'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Check, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { checkWishlist, addToWishlist, removeFromWishlist } from '@/lib/wishlist-api';
import { productsApi } from '@/lib/api';
import { getProductReviews, Review, ReviewStats } from '@/lib/reviews-api';
import ProductGallery from '@/components/product-detail/ProductGallery';
import ProductInfoCenter from '@/components/product-detail/ProductInfoCenter';
import ProductPurchaseCard from '@/components/product-detail/ProductPurchaseCard';
import ProductTabs from '@/components/product-detail/ProductTabs';
import TrustBlock from '@/components/product-detail/TrustBlock';
import RelatedProducts from '@/components/product-detail/RelatedProducts';
import MobileAccordion from '@/components/product-detail/MobileAccordion';

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
  documents?: { id: string; url: string; name: string; type: string }[];
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
  const [warehouseLocation, setWarehouseLocation] = useState<'CPT' | 'JHB' | 'DBN' | undefined>(undefined);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({});
  const toggleAccordion = (key: string) => setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  const isAuthenticated = !!user && !!token;

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
    return `Same-day dispatch from ${warehouses.join(' & ')}`;
  };

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await productsApi.getBySlug(slug);
        setProduct(data);

        // Track product view for analytics
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
          const visitorId = localStorage.getItem('bt_visitor_id') || crypto.randomUUID();
          const sessionId = sessionStorage.getItem('bt_session_id') || crypto.randomUUID();
          if (!localStorage.getItem('bt_visitor_id')) localStorage.setItem('bt_visitor_id', visitorId);
          if (!sessionStorage.getItem('bt_session_id')) sessionStorage.setItem('bt_session_id', sessionId);
          fetch(`${API_BASE}/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              visitorId,
              sessionId,
              pageUrl: `/products/${slug}`,
              pageTitle: data.name,
              referrer: document.referrer || undefined,
              productId: data.id,
            }),
            keepalive: true,
          }).catch(() => {});
        } catch {}

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
          const filtered = recentlyViewed.filter((p: any) => p.id !== data.id);
          filtered.unshift(productEntry);
          const trimmed = filtered.slice(0, 10);
          localStorage.setItem(rvKey, JSON.stringify(trimmed));
        } catch (error) {
          console.error('Error saving to recently viewed:', error);
        }

        // Fetch related products with improved selection
        setIsLoadingRelated(true);
        try {
          const seen = new Set<string>([data.slug]);
          const scored: { product: any; score: number }[] = [];
          const stopWords = new Set(['and', 'the', 'for', 'with', 'from', 'new', 'used', 'set', 'per', 'kit', 'of', 'in', 'to']);
          const nameWords: string[] = (data.name as string)
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((w: string) => w.length >= 3 && !stopWords.has(w));

          // 1. Same category first with good diversity
          if (data.category?.slug) {
            try {
              const byCat = await productsApi.list({ category: data.category.slug, limit: '16' });
              for (const p of byCat.products) {
                if (seen.has(p.slug)) continue;
                seen.add(p.slug);
                const pName = p.name.toLowerCase();
                const matchCount = nameWords.filter((w: string) => pName.includes(w)).length;
                const similarityPenalty = matchCount >= 3 ? -5 : 0;
                scored.push({ product: p, score: 4 + matchCount + similarityPenalty });
              }
            } catch { /* silent */ }
          }

          // 2. Keyword search for complementary items
          const searchQuery = nameWords.slice(0, 2).join(' ');
          if (searchQuery) {
            try {
              const byKeyword = await productsApi.list({ search: searchQuery, limit: '8' });
              for (const p of byKeyword.products) {
                if (seen.has(p.slug)) continue;
                seen.add(p.slug);
                const pName = p.name.toLowerCase();
                const matchCount = nameWords.filter((w: string) => pName.includes(w)).length;
                scored.push({ product: p, score: matchCount + (p.category?.slug === data.category?.slug ? 2 : 0) });
              }
            } catch { /* silent */ }
          }

          // 3. Broader category searches for accessories
          const accessoryKeywords = ['rj45', 'cat6', 'cable', 'crimp', 'tester', 'patch', 'keystone', 'jack', 'connector', 'adapter', 'accessory'];
          for (const keyword of accessoryKeywords) {
            if (nameWords.some((w: string) => w.includes(keyword))) {
              try {
                const accessoryResults = await productsApi.list({ search: keyword, limit: '4' });
                for (const p of accessoryResults.products) {
                  if (seen.has(p.slug)) continue;
                  seen.add(p.slug);
                  scored.push({ product: p, score: 1 });
                }
              } catch { /* silent */ }
            }
          }

          scored.sort((a, b) => b.score - a.score);
          const final = [];
          const usedNames = new Set<string>();
          for (const s of scored) {
            const pName = s.product.name.toLowerCase();
            if (usedNames.has(pName)) continue;
            usedNames.add(pName);
            final.push(s.product);
            if (final.length >= 4) break;
          }
          setRelatedProducts(final);
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

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.sellingPrice,
      quantity,
      type: 'product',
      image: product.images?.[0]?.url,
      warehouseLocation,
    });
    if (token) {
      import('@/lib/api').then(({ cartApi }) => {
        cartApi.addItem(token, { productId: product.id, quantity, warehouseLocation }).catch(() => {});
      });
    }
    setAddedToCart(true);
    setToastMessage(`${product.name} added to cart`);
    setShowToast(true);
    setTimeout(() => { setAddedToCart(false); setShowToast(false); }, 2500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.sellingPrice,
      quantity,
      type: 'product',
      image: product.images?.[0]?.url,
      warehouseLocation,
    });
    if (token) {
      import('@/lib/api').then(({ cartApi }) => {
        cartApi.addItem(token, { productId: product.id, quantity, warehouseLocation }).catch(() => {});
      });
    }
    window.location.href = '/cart';
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 py-16 text-center bg-white min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#003d7a] mb-4" />
        <p className="text-slate-500">Loading product...</p>
      </div>
    );
  }

  if (!product || loadError) {
    return (
      <div className="w-full px-4 py-16 text-center bg-white min-h-screen">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Product Not Found</h1>
        <p className="text-slate-500 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link href={returnUrl} className="text-[#003d7a] hover:text-[#0055a4]">Back to products</Link>
      </div>
    );
  }

  const inStock = (product.stockQuantity > 0) || ((product.stockCpt ?? 0) > 0) || ((product.stockJhb ?? 0) > 0) || ((product.stockDbn ?? 0) > 0);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-white min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        {/* Desktop breadcrumb */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 mb-4 overflow-x-auto">
          <Link href="/" className="hover:text-[#003d7a] whitespace-nowrap">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link href="/products" className="hover:text-[#003d7a] whitespace-nowrap">Products</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          {product.category && (
            <>
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#003d7a] whitespace-nowrap">{product.category.name}</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
            </>
          )}
          <span className="text-slate-900 truncate">{product.name}</span>
        </nav>

        {/* Mobile breadcrumb */}
        <nav className="flex sm:hidden items-center gap-1.5 text-xs text-slate-500 mb-4 overflow-x-auto">
          <Link href="/" className="hover:text-[#003d7a] whitespace-nowrap">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link href={returnUrl} className="hover:text-[#003d7a] whitespace-nowrap">Products</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-slate-900 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 auto-rows-start" data-product-id={product.id}>
          {/* Main content area */}
          <main className="min-w-0">
            {/* Product Hero — image + info only on desktop */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-6">
              {/* Left: Product image/gallery */}
              <div className="lg:w-[56%] shrink-0">
                <ProductGallery
                  product={product}
                  returnUrl={returnUrl}
                  isInWishlist={isInWishlist}
                  onToggleWishlist={toggleWishlist}
                />
              </div>

              {/* Middle: Product info */}
              <div className="lg:w-[44%] shrink-0">
                <ProductInfoCenter
                  product={product}
                  reviewStats={reviewStats}
                />
              </div>
            </div>

            {/* Horizontal trust strip — directly below hero */}
            <div className="mb-10">
              <TrustBlock getShippingText={getShippingText} />
            </div>

            {/* Desktop tabs */}
            <div className="hidden lg:block">
              <ProductTabs
                product={product}
                reviews={reviews}
                setReviews={setReviews}
                reviewStats={reviewStats}
                setReviewStats={setReviewStats}
                isAuthenticated={isAuthenticated}
                token={token}
              />
            </div>

            {/* Mobile accordion */}
            <MobileAccordion
              product={product}
              accordionOpen={accordionOpen}
              toggleAccordion={toggleAccordion}
              reviews={reviews}
              reviewStats={reviewStats}
              isAuthenticated={isAuthenticated}
            />

            {/* Mobile purchase card */}
            <div className="lg:hidden mt-6">
              <ProductPurchaseCard
                product={product}
                quantity={quantity}
                setQuantity={setQuantity}
                warehouseLocation={warehouseLocation}
                setWarehouseLocation={setWarehouseLocation}
                addedToCart={addedToCart}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                isInWishlist={isInWishlist}
                isWishlistLoading={isWishlistLoading}
                onToggleWishlist={toggleWishlist}
                inStock={inStock}
                getShippingText={getShippingText}
              />
            </div>

            {/* Related Products */}
            <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />
          </main>

          {/* Right sticky purchase card — separate column */}
          <aside className="hidden lg:block shrink-0">
            <ProductPurchaseCard
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              warehouseLocation={warehouseLocation}
              setWarehouseLocation={setWarehouseLocation}
              addedToCart={addedToCart}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              isInWishlist={isInWishlist}
              isWishlistLoading={isWishlistLoading}
              onToggleWishlist={toggleWishlist}
              inStock={inStock}
              getShippingText={getShippingText}
            />
          </aside>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all animate-in slide-in-from-bottom-4 ${
          addedToCart || toastMessage.includes('added to cart') || (toastMessage.includes('wishlist') && isInWishlist)
            ? 'bg-green-600 text-white'
            : toastMessage.includes('wishlist') ? 'bg-slate-800 text-white' : 'bg-green-600 text-white'
        }`}>
          <Check className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">{toastMessage}</p>
            {addedToCart && <p className="text-xs opacity-80">Go to <a href="/cart" className="underline">cart</a> to checkout</p>}
          </div>
        </div>
      )}
    </div>
  );
}
