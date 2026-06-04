'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus, Tag, ChevronRight, Shield, Truck, Zap, Heart, Check, X, Loader2, FileText, Star, File, MessageSquare } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { checkWishlist, addToWishlist, removeFromWishlist } from '@/lib/wishlist-api';
import { productsApi } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sellingPrice: number;
  costPrice?: number;
  condition: string;
  stockQuantity: number;
  category?: { name: string; slug: string };
  tags?: { tag: string }[];
  images: { url: string; altText?: string }[];
  sku?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const { token, user } = useAuthStore();
  const { addItem: addToStore, removeItem: removeFromStore, isInWishlist: checkStoreWishlist } = useWishlistStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'specifications' | 'reviews' | 'documents'>('specifications');
  const isAuthenticated = !!user && !!token;

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await productsApi.getBySlug(slug);
        setProduct(data);
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
        <Link href="/products" className="text-[#003d7a] hover:text-[#0055a4]">Back to products</Link>
      </div>
    );
  }

  const inStock = product.stockQuantity > 0;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-[#003d7a]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-[#003d7a]">Products</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {product.category && (
          <>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#003d7a]">{product.category.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-gray-900 truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl aspect-square w-full max-w-md mx-auto relative overflow-hidden">
            {product.images?.[selectedImage]?.url && !product.images[selectedImage].url.startsWith('/images/') ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].altText || product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8">
                <div className="w-24 h-24 mb-4 bg-gradient-to-br from-[#003d7a]/10 to-orange-400/10 rounded-2xl flex items-center justify-center">
                  <Tag className="w-12 h-12 text-gray-400" />
                </div>
                <span className="text-sm text-gray-500">{product.name}</span>
              </div>
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.condition === 'REFURBISHED' && (
                <span className="px-3 py-1 bg-[#003d7a] text-white text-sm font-medium rounded-lg">Refurbished</span>
              )}
              {product.tags?.map((t: any) => (
                <span key={t.tag} className="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-lg">{t.tag}</span>
              ))}
            </div>
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
                    <div className="w-full h-full flex items-center justify-center p-1">
                      <img src={img.url} alt={img.altText} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.category && (
            <Link href={`/products?category=${product.category.slug}`} className="text-sm text-[#003d7a] hover:text-[#0055a4] mb-2 inline-block">
              {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-[#003d7a]">{formatPrice(product.sellingPrice)}</span>
            {product.condition === 'REFURBISHED' && (
              <span className="px-2 py-1 bg-[#003d7a]/10 text-[#003d7a] text-xs font-medium rounded-lg border border-[#003d7a]/30">Refurbished</span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Stock */}
          <div className="mb-6">
            {inStock ? (
              <span className="text-sm text-green-600 font-medium">In Stock ({product.stockQuantity} available)</span>
            ) : (
              <span className="text-sm text-red-500 font-medium">Out of Stock</span>
            )}
          </div>

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
              disabled={!inStock}
              onClick={() => {
                addItem({ productId: product.id, name: product.name, price: product.sellingPrice, quantity, type: 'product', image: product.images?.[0]?.url });
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#003d7a] hover:bg-[#0055a4] disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart — {formatPrice(product.sellingPrice * quantity)}
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
            <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all ${
              isInWishlist ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
            }`}>
              {isInWishlist ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              <span className="font-medium">{toastMessage}</span>
            </div>
          )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <Shield className="w-5 h-5 text-[#003d7a] mx-auto mb-1.5" />
              <p className="text-xs text-gray-500">Warranty Included</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <Truck className="w-5 h-5 text-[#003d7a] mx-auto mb-1.5" />
              <p className="text-xs text-gray-500">Fast Delivery</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <Zap className="w-5 h-5 text-orange-500 mx-auto mb-1.5" />
              <p className="text-xs text-gray-500">Bretune Certified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section - Specifications, Reviews, Documents */}
      <div className="mt-12">
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('specifications')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'specifications' ? 'border-[#003d7a] text-[#003d7a]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> Specifications
              </span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'reviews' ? 'border-[#003d7a] text-[#003d7a]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4" /> Reviews
              </span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'documents' ? 'border-[#003d7a] text-[#003d7a]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <File className="w-4 h-4" /> Documents
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'specifications' && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Specifications</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Condition</span>
                <span className="font-medium text-gray-900">{product.condition}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Stock Quantity</span>
                <span className="font-medium text-gray-900">{product.stockQuantity} units</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Category</span>
                <span className="font-medium text-gray-900">{product.category?.name || 'N/A'}</span>
              </div>
              {product.sku && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">SKU</span>
                  <span className="font-medium text-gray-900">{product.sku}</span>
                </div>
              )}
              {product.tags && product.tags.length > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200 md:col-span-2">
                  <span className="text-gray-600">Tags</span>
                  <div className="flex gap-2 flex-wrap">
                    {product.tags.map((t: any) => (
                      <span key={t.tag} className="px-2 py-1 bg-[#003d7a]/10 text-[#003d7a] text-xs rounded">{t.tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Reviews</h3>
              <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this product!</p>
              <button className="mt-4 px-4 py-2 bg-[#003d7a] text-white rounded-lg text-sm font-medium hover:bg-[#0055a4] transition-colors">
                Write a Review
              </button>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Documents</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <File className="w-8 h-8 text-[#003d7a]" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Product Datasheet</p>
                  <p className="text-xs text-gray-500">PDF • Coming soon</p>
                </div>
                <button className="px-3 py-1.5 text-sm text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed">
                  Download
                </button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <File className="w-8 h-8 text-[#003d7a]" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">User Manual</p>
                  <p className="text-xs text-gray-500">PDF • Coming soon</p>
                </div>
                <button className="px-3 py-1.5 text-sm text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed">
                  Download
                </button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <File className="w-8 h-8 text-[#003d7a]" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Warranty Information</p>
                  <p className="text-xs text-gray-500">PDF • Coming soon</p>
                </div>
                <button className="px-3 py-1.5 text-sm text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed">
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* You Might Also Like */}
      <div className="mt-16 pt-12 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
        <p className="text-gray-500">More products coming soon. Add products via the admin panel.</p>
      </div>
    </div>
  );
}
