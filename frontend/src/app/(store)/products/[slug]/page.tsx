'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus, Tag, ChevronRight, ChevronLeft, Shield, Truck, Zap, Heart, Check, X, Loader2, FileText, Star, File, MessageSquare, User, MessageCircle, Mail, CheckCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { brand } from '@/lib/brand';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { checkWishlist, addToWishlist, removeFromWishlist } from '@/lib/wishlist-api';
import { productsApi } from '@/lib/api';
import { getProductReviews, createReview, Review, ReviewStats } from '@/lib/reviews-api';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sellingPrice: number;
  costPrice?: number;
  originalPrice?: number;
  discountExpiresAt?: string;
  condition: string;
  stockQuantity: number;
  stockCpt?: number;
  stockJhb?: number;
  stockDbn?: number;
  category?: { name: string; slug: string };
  tags?: { tag: string }[];
  images: { url: string; altText?: string }[];
  sku?: string;
  specifications?: { key: string; value: string }[];
  manualUrl?: string;
  additionalInfo?: string;
  shippingDays?: number;
  supplierName?: string;
  brand?: { id: string; name: string; slug: string };
}

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const returnUrl = searchParams.get('returnUrl') || '/products';
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const { token, user } = useAuthStore();
  const { addItem: addToStore, removeItem: removeFromStore, isInWishlist: checkStoreWishlist } = useWishlistStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [warehouseLocation, setWarehouseLocation] = useState<'CPT' | 'JHB' | 'DBN' | undefined>(undefined);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'specifications' | 'additionalInfo' | 'reviews' | 'documents'>('details');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const getShippingText = () => {
    if (!product) return 'Ships in 3-4 work days';
    const cpt = product.stockCpt ?? 0;
    const jhb = product.stockJhb ?? 0;
    const dbn = product.stockDbn ?? 0;
    const warehouses = [cpt > 0 && 'CPT', jhb > 0 && 'JHB', dbn > 0 && 'DBN'].filter(Boolean) as string[];
    if (warehouses.length === 0) {
      if (product.shippingDays === 1) return 'Ships in 1 work day';
      if (product.shippingDays === 2) return 'Ships in 1-2 work days';
      if (product.shippingDays && product.shippingDays > 2) return `Ships in ${product.shippingDays - 1}-${product.shippingDays} work days`;
      return 'Ships in 3-5 work days';
    }
    if (warehouses.length >= 3) return 'Same-day dispatch — available in CPT, JHB & DBN';
    return `Same-day dispatch from ${warehouses.join(' & ')}`;
  };
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const isAuthenticated = !!user && !!token;

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await productsApi.getBySlug(slug);
        setProduct(data);

        // Save to recently viewed (scoped by user ID)
        try {
          const rvKey = `recentlyViewed_${user?.id ?? 'guest'}`;
          const stored = localStorage.getItem(rvKey);
          const recentlyViewed = stored ? JSON.parse(stored) : [];
          const productEntry = {
            id: data.id,
            slug: data.slug,
            name: data.name,
            price: data.sellingPrice,
            image: data.images[0]?.url || '',
            originalPrice: (data as any).originalPrice,
            shippingDays: (data as any).shippingDays || 3,
          };
          // Remove if already exists, then add to front
          const filtered = recentlyViewed.filter((p: any) => p.id !== data.id);
          filtered.unshift(productEntry);
          // Keep only last 10
          const trimmed = filtered.slice(0, 10);
          localStorage.setItem(rvKey, JSON.stringify(trimmed));
        } catch (error) {
          console.error('Error saving to recently viewed:', error);
        }

        // Fetch related products — keyword match first, then same category fallback
        setIsLoadingRelated(true);
        try {
          const seen = new Set<string>([data.slug]);
          const scored: { product: any; score: number }[] = [];

          // Extract meaningful keywords from product name (2+ char words, skip common words)
          const stopWords = new Set(['and', 'the', 'for', 'with', 'from', 'new', 'used', 'set', 'per', 'kit']);
          const nameWords = data.name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((w: string) => w.length >= 3 && !stopWords.has(w));

          // Use first 2 most meaningful words as search query (brand + model usually)
          const searchQuery = nameWords.slice(0, 2).join(' ');

          if (searchQuery) {
            try {
              const byKeyword = await productsApi.list({ search: searchQuery, limit: '8' });
              for (const p of byKeyword.products) {
                if (seen.has(p.slug)) continue;
                seen.add(p.slug);
                // Score: count how many name words match
                const pName = p.name.toLowerCase();
                const matchCount = nameWords.filter((w: string) => pName.includes(w)).length;
                scored.push({ product: p, score: matchCount + (p.category?.slug === data.category?.slug ? 2 : 0) });
              }
            } catch { /* silent */ }
          }

          // Also fetch same category for breadth
          if (data.category?.slug) {
            try {
              const byCat = await productsApi.list({ category: data.category.slug, limit: '8' });
              for (const p of byCat.products) {
                if (seen.has(p.slug)) continue;
                seen.add(p.slug);
                const pName = p.name.toLowerCase();
                const matchCount = nameWords.filter((w: string) => pName.includes(w)).length;
                scored.push({ product: p, score: matchCount + 1 }); // +1 for same category
              }
            } catch { /* silent */ }
          }

          // Sort by score descending, take top 4
          scored.sort((a, b) => b.score - a.score);
          setRelatedProducts(scored.slice(0, 4).map((s) => s.product));
        } catch {
          // Silent fail
        } finally {
          setIsLoadingRelated(false);
        }
      } catch (error) {
        setLoadError('Product not found');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Fetch reviews when product loads
  useEffect(() => {
    if (!product) return;
    getProductReviews(product.id).then((data) => {
      setReviews(data.reviews);
      setReviewStats(data.stats);
    }).catch(() => {});
  }, [product?.id]);

  // Check initial wishlist status
  useEffect(() => {
    if (!product || !token) return;
    checkWishlist(product.id, token)
      .then(setIsInWishlist)
      .catch(() => setIsInWishlist(false));
  }, [product, token]);

  // Also check store for local state
  useEffect(() => {
    if (product) {
      setIsInWishlist(checkStoreWishlist(product.id));
    }
  }, [product, checkStoreWishlist]);

  const toggleWishlist = async () => {
    if (!isAuthenticated || !token) {
      setToastMessage('Please login to add to wishlist');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    if (!product) return;

    setIsWishlistLoading(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id, token);
        removeFromStore(product.id);
        setIsInWishlist(false);
        setToastMessage('Removed from wishlist');
      } else {
        const wishlistItem = await addToWishlist(product.id, token);
        addToStore(wishlistItem);
        setIsInWishlist(true);
        setToastMessage('Added to wishlist!');
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update wishlist';
      setToastMessage(message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 py-16 text-center bg-white min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#003d7a] mb-4" />
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!product || loadError) {
    return (
      <div className="w-full px-4 py-16 text-center bg-white min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link href={returnUrl} className="text-[#003d7a] hover:text-[#0055a4]">Back to products</Link>
      </div>
    );
  }

  const inStock = product.stockQuantity > 0;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-white min-h-screen max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-6 overflow-x-auto">
        <Link href="/" className="hover:text-[#003d7a] whitespace-nowrap">Home</Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <Link href={returnUrl} className="hover:text-[#003d7a] whitespace-nowrap">Products</Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        {product.category && (
          <>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#003d7a] whitespace-nowrap">{product.category.name}</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
          </>
        )}
        <span className="text-gray-900 truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Image Gallery */}
        <div className="space-y-3 sm:space-y-4">
          <div
            className="bg-white border border-gray-100 rounded-2xl w-full relative overflow-hidden cursor-zoom-in h-[300px] sm:h-[400px] lg:h-[500px] flex items-center justify-center"
            onClick={() => { if (product.images?.[selectedImage]?.url && !product.images[selectedImage].url.startsWith('/images/')) { setLightboxIndex(selectedImage); setLightboxOpen(true); } }}
          >
            {product.images?.[selectedImage]?.url && !product.images[selectedImage].url.startsWith('/images/') ? (
              <img
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].altText || product.name}
                  className="w-full h-full object-contain object-center p-4 transition-transform duration-300"
                />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8">
                <div className="w-24 h-24 mb-4 bg-gradient-to-br from-[#003d7a]/10 to-orange-400/10 rounded-2xl flex items-center justify-center">
                  <Tag className="w-12 h-12 text-gray-400" />
                </div>
                <span className="text-sm text-gray-500">{product.name}</span>
              </div>
            )}
          {/* Badge — matches product card style */}
          {(() => {
            const discountPct = product.originalPrice && product.sellingPrice
              ? Math.round(((product.originalPrice - product.sellingPrice) / product.sellingPrice) * 100)
              : null;
            const badge = product.tags?.[0]?.tag || (product.condition === 'REFURBISHED' ? 'Refurbished' : null);
            return discountPct ? (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm z-10">
                {discountPct}% OFF
              </span>
            ) : badge ? (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full shadow-sm z-10">
                {badge}
              </span>
            ) : null;
          })()}
          </div>
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-colors bg-white ${
                    selectedImage === i ? 'border-[#003d7a]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {!img.url.startsWith('/images/') ? (
                    <img src={img.url} alt={img.altText} className="w-full h-full object-cover object-center" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Tabs + content — fills the white space below thumbnails */}
          <div className="mt-4 sm:mt-5">
            <div className="border-b border-gray-200 mb-3 sm:mb-4">
              <div className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none">
                <button onClick={() => setActiveTab('details')} className={`pb-2 sm:pb-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${ activeTab === 'details' ? 'border-[#003d7a] text-[#003d7a]' : 'border-transparent text-gray-500 hover:text-gray-700' }`}>Details</button>
                <button onClick={() => setActiveTab('specifications')} className={`pb-2 sm:pb-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${ activeTab === 'specifications' ? 'border-[#003d7a] text-[#003d7a]' : 'border-transparent text-gray-500 hover:text-gray-700' }`}>Specifications</button>
                {product.additionalInfo && <button onClick={() => setActiveTab('additionalInfo')} className={`pb-2 sm:pb-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${ activeTab === 'additionalInfo' ? 'border-[#003d7a] text-[#003d7a]' : 'border-transparent text-gray-500 hover:text-gray-700' }`}>Additional Info</button>}
                <button onClick={() => setActiveTab('reviews')} className={`pb-2 sm:pb-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${ activeTab === 'reviews' ? 'border-[#003d7a] text-[#003d7a]' : 'border-transparent text-gray-500 hover:text-gray-700' }`}>Reviews {reviewStats && reviewStats.count > 0 && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full ml-1">{reviewStats.count}</span>}</button>
                <button onClick={() => setActiveTab('documents')} className={`pb-2 sm:pb-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${ activeTab === 'documents' ? 'border-[#003d7a] text-[#003d7a]' : 'border-transparent text-gray-500 hover:text-gray-700' }`}>Documents</button>
              </div>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">
              {activeTab === 'details' && (
                <p>{product.description}</p>
              )}
              {activeTab === 'additionalInfo' && (
                <p className="whitespace-pre-wrap text-gray-700">{product.additionalInfo}</p>
              )}
              {activeTab === 'specifications' && (
                <div className="space-y-3">
                  {product.specifications && product.specifications.length > 0 && (
                    <div className="divide-y divide-gray-100">
                      {product.sku && <div className="flex justify-between py-1.5"><span className="text-gray-500">SKU</span><span className="font-medium text-gray-900 font-mono">{product.sku}</span></div>}
                      <div className="flex justify-between py-1.5"><span className="text-gray-500">Condition</span><span className="font-medium text-gray-900">{product.condition}</span></div>
                      {product.specifications.map((spec: { key: string; value: string }, idx: number) => (
                        <div key={idx} className="flex justify-between py-1.5"><span className="text-gray-500">{spec.key}</span><span className="font-medium text-gray-900">{spec.value}</span></div>
                      ))}
                    </div>
                  )}
                  {(!product.specifications || product.specifications.length === 0) && <p className="italic text-gray-400">No specifications available.</p>}
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-gray-400 italic">No reviews yet. {isAuthenticated ? '' : <><a href="/login" className="text-[#003d7a] hover:underline">Sign in</a> to write one.</>}</p>
                  ) : (
                    reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 text-sm">{review.user.firstName} {review.user.lastName}</span>
                          <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-0.5 mb-1">{[...Array(5)].map((_, i) => <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}</div>
                        {review.title && <p className="font-medium text-xs text-gray-900">{review.title}</p>}
                        <p className="text-xs text-gray-600">{review.comment}</p>
                      </div>
                    ))
                  )}
                  {isAuthenticated && !showReviewForm && <button onClick={() => setShowReviewForm(true)} className="mt-2 px-3 py-1.5 bg-[#003d7a] text-white rounded-lg text-xs font-medium hover:bg-[#0055a4] transition-colors">Write a Review</button>}
                  {showReviewForm && (
                    <div className="space-y-2 mt-2">
                      <div className="flex gap-1">{[1,2,3,4,5].map((star) => <button key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })} className={`text-lg ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>)}</div>
                      <input type="text" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} placeholder="Title (optional)" className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#003d7a]" />
                      <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Your review..." rows={3} className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#003d7a]" />
                      {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
                      <div className="flex gap-2"><button onClick={async () => { if (!product || !token) return; setIsSubmittingReview(true); setReviewError(''); try { await createReview(token, { productId: product.id, rating: reviewForm.rating, title: reviewForm.title, comment: reviewForm.comment }); setShowReviewForm(false); setReviewForm({ rating: 5, title: '', comment: '' }); const data = await getProductReviews(product.id); setReviews(data.reviews); setReviewStats(data.stats); } catch (err: any) { setReviewError(err?.message || 'Failed to submit review'); } finally { setIsSubmittingReview(false); } }} disabled={!reviewForm.comment.trim() || isSubmittingReview} className="px-3 py-1.5 bg-[#003d7a] text-white rounded-lg text-xs font-medium disabled:opacity-50">{isSubmittingReview ? 'Submitting...' : 'Submit'}</button><button onClick={() => setShowReviewForm(false)} className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs">Cancel</button></div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'documents' && (
                product.manualUrl ? (
                  <a href={product.manualUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#003d7a] hover:underline text-sm">
                    <File className="w-4 h-4" /> User Manual / Datasheet
                  </a>
                ) : (
                  <p className="italic text-gray-400">No documents available.</p>
                )
              )}
            </div>
          </div>

        </div>

        {/* Details */}
        <div className="min-w-0">
          {product.category && (
            <Link href={`/products?category=${product.category.slug}`} className="text-xs sm:text-sm text-[#003d7a] hover:text-[#0055a4] mb-2 inline-block">
              {product.category.name}
            </Link>
          )}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{product.name}</h1>

          {/* Supplier Backed Badge */}
          <div className="mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
              <span className="text-[10px] sm:text-xs font-medium text-green-700">Supplied Through Authorized Distributor Network</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span className="text-2xl sm:text-3xl font-bold text-[#003d7a]">{formatPrice(product.sellingPrice)}</span>
            {product.originalPrice && (
              <span className="text-lg sm:text-xl text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
            {product.condition === 'REFURBISHED' && (
              <span className="px-2 py-1 bg-[#003d7a]/10 text-[#003d7a] text-xs font-medium rounded-lg border border-[#003d7a]/30">Refurbished</span>
            )}
          </div>

          {/* Product info — above warehouse picker */}
          <div className="grid grid-cols-2 gap-2 mb-4 sm:mb-5">
            <div className="bg-gray-50 rounded-lg p-2 sm:p-2.5 border border-gray-100">
              <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Availability</p>
              {inStock ? (
                <p className="text-xs sm:text-sm font-semibold text-green-600">
                  {product.stockQuantity > 0 ? 'In Stock' : 'Supplier Stock'}
                  {product.stockQuantity > 0 && ` (${product.stockQuantity})`}
                </p>
              ) : (
                <p className="text-xs sm:text-sm font-semibold text-red-500">Out of Stock</p>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-2 sm:p-2.5 border border-gray-100">
              <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Estimated Delivery</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-900">
                {inStock ? '1-3 Business Days' : 'Available on Request'}
              </p>
            </div>
            {product.sku && (
              <div className="bg-gray-50 rounded-lg p-2 sm:p-2.5 border border-gray-100">
                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Product Code</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 font-mono truncate">{product.sku}</p>
              </div>
            )}
            {product.condition && (
              <div className="bg-gray-50 rounded-lg p-2 sm:p-2.5 border border-gray-100">
                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Condition</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">{product.condition.charAt(0) + product.condition.slice(1).toLowerCase()}</p>
              </div>
            )}
            {(product.brand?.name || product.supplierName) && (
              <div className="bg-gray-50 rounded-lg p-2 sm:p-2.5 border border-gray-100">
                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Brand</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{product.brand?.name || product.supplierName}</p>
              </div>
            )}
          </div>

          {/* Warehouse location picker — required when any warehouse has stock */}
          {inStock && [(product.stockCpt ?? 0) > 0, (product.stockJhb ?? 0) > 0, (product.stockDbn ?? 0) > 0].filter(Boolean).length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Ship from warehouse <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {(product.stockCpt ?? 0) > 0 && (
                  <button
                    onClick={() => setWarehouseLocation('CPT')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      warehouseLocation === 'CPT'
                        ? 'bg-green-600 text-white border-green-600 shadow-sm'
                        : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />Cape Town <span className="opacity-75 font-normal">({product.stockCpt})</span>
                  </button>
                )}
                {(product.stockJhb ?? 0) > 0 && (
                  <button
                    onClick={() => setWarehouseLocation('JHB')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      warehouseLocation === 'JHB'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />Johannesburg <span className="opacity-75 font-normal">({product.stockJhb})</span>
                  </button>
                )}
                {(product.stockDbn ?? 0) > 0 && (
                  <button
                    onClick={() => setWarehouseLocation('DBN')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      warehouseLocation === 'DBN'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />Durban <span className="opacity-75 font-normal">({product.stockDbn})</span>
                  </button>
                )}
              </div>
              {warehouseLocation ? (
                <p className="text-xs text-green-600 font-medium mt-1.5">✓ Dispatching from {warehouseLocation === 'CPT' ? 'Cape Town' : warehouseLocation === 'JHB' ? 'Johannesburg' : 'Durban'}</p>
              ) : (
                <p className="text-xs text-red-500 mt-1.5">Please select a warehouse to continue</p>
              )}
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-100 rounded-l-lg transition-colors">
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="w-12 text-center text-gray-900 font-medium">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))} className="p-3 hover:bg-gray-100 rounded-r-lg transition-colors">
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <button
              disabled={!inStock || ([(product.stockCpt ?? 0) > 0, (product.stockJhb ?? 0) > 0, (product.stockDbn ?? 0) > 0].some(Boolean) && !warehouseLocation) || addedToCart}
              onClick={() => {
                addItem({ productId: product.id, name: product.name, price: product.sellingPrice, quantity, type: 'product', image: product.images?.[0]?.url, warehouseLocation });
                if (token) {
                  import('@/lib/api').then(({ cartApi }) => {
                    cartApi.addItem(token, { productId: product.id, quantity, warehouseLocation }).catch(() => {});
                  });
                }
                setAddedToCart(true);
                setToastMessage(`${product.name} added to cart`);
                setShowToast(true);
                setTimeout(() => { setAddedToCart(false); setShowToast(false); }, 2500);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium rounded-xl transition-all ${
                addedToCart
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-[#003d7a] hover:bg-[#0055a4] disabled:bg-gray-200 disabled:cursor-not-allowed text-white'
              }`}
            >
              {addedToCart ? (
                <><Check className="w-5 h-5" /> Added to Cart!</>
              ) : (
                <><ShoppingCart className="w-5 h-5" /> Add to Cart — {formatPrice(product.sellingPrice * quantity)}</>
              )}
            </button>
            <button
              onClick={toggleWishlist}
              disabled={isWishlistLoading}
              className={`p-3 rounded-xl border-2 transition-all ${
                isInWishlist 
                  ? 'bg-red-50 border-red-200 text-red-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200'
              } ${isWishlistLoading ? 'cursor-wait' : ''}`}
              title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {isWishlistLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
              )}
            </button>

          {/* Toast Notification */}
          {showToast && (
            <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all animate-in slide-in-from-bottom-4 ${
              addedToCart || toastMessage.includes('added to cart') || toastMessage.includes('wishlist') && isInWishlist
                ? 'bg-green-600 text-white'
                : toastMessage.includes('wishlist') ? 'bg-gray-800 text-white' : 'bg-green-600 text-white'
            }`}>
              <Check className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">{toastMessage}</p>
                {addedToCart && <p className="text-xs opacity-80">Go to <a href="/cart" className="underline">cart</a> to checkout</p>}
              </div>
            </div>
          )}
          </div>

          {/* Need Assistance */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-900 mb-3">Need Assistance?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(
                  `Hi Bretunetech, I'm interested in *${product.name}* (${formatPrice(product.sellingPrice)}).\n${brand.website}/products/${product.slug}\n\nIs this in stock?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition-colors"
              >
                <MessageCircle className="w-5 h-5" /> WhatsApp Support
              </a>
              <a
                href={`mailto:${brand.emailSales}?subject=${encodeURIComponent(
                  `Quote request: ${product.name}`
                )}&body=${encodeURIComponent(
                  `Hi Bretunetech,\n\nI'd like a quote for the following:\n\nProduct: ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''}\nLink: ${brand.website}/products/${product.slug}\n\nQuantity needed: \nDo you offer installation? \nDelivery location: \n\nThank you.`
                )}`}
                className="flex items-center justify-center gap-2 py-3 border-2 border-[#003d7a] text-[#003d7a] hover:bg-[#003d7a] hover:text-white font-medium rounded-xl transition-colors"
              >
                <FileText className="w-5 h-5" /> Request Quote
              </a>
              <a
                href="/contact"
                className="flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors"
              >
                <Mail className="w-5 h-5" /> Contact Us
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <Shield className="w-5 h-5 text-[#003d7a] mx-auto mb-1.5" />
              <p className="text-xs text-gray-500">Warranty Included</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <Truck className="w-5 h-5 text-[#003d7a] mx-auto mb-1.5" />
              <p className="text-xs text-gray-500">{getShippingText()}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <Zap className="w-5 h-5 text-orange-500 mx-auto mb-1.5" />
              <p className="text-xs text-gray-500">Bretune Certified</p>
            </div>
          </div>
        </div>
      </div>


      {/* You Might Also Like */}
      {(relatedProducts.length > 0 || isLoadingRelated) && (
        <div className="mt-16 pt-12 border-t border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
          {isLoadingRelated ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={`/products/${related.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-[160px] bg-white flex items-center justify-center p-3 overflow-hidden border-b border-gray-100">
                    {related.images?.[0]?.url ? (
                      <img
                        src={related.images[0].url}
                        alt={related.name}
                        className="max-w-full max-h-full object-contain object-center group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-[#003d7a] transition-colors">
                      {related.name}
                    </h3>
                    <p className="text-[#003d7a] font-bold mt-2">{formatPrice(related.sellingPrice)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      )}
      {/* Lightbox */}
      {lightboxOpen && product.images && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 z-10 text-white bg-gray-800 hover:bg-gray-700 rounded-full p-2.5 transition-colors shadow-xl border border-white/20"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev */}
          {product.images.length > 1 && (
            <button
              className="absolute left-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + product.images.length) % product.images.length); }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <img
            src={product.images[lightboxIndex]?.url}
            alt={product.images[lightboxIndex]?.altText || product.name}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {product.images.length > 1 && (
            <button
              className="absolute right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % product.images.length); }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Counter */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-colors ${i === lightboxIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                />
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
