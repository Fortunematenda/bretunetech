'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, Check, Star, Heart, Eye, Percent } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { addToWishlist, removeFromWishlist } from '@/lib/wishlist-api';

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  badge?: string;
  stock?: 'in' | 'low' | 'out';
  rating?: number;
  shipsToday?: boolean;
  brand?: string;
  originalPrice?: number;
  discount?: number;
  shippingDays?: number;
  discountExpiresAt?: string;
}

interface EnhancedProductCardProps {
  product: Product;
}

export default function EnhancedProductCard({ product }: EnhancedProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { isInWishlist: checkStoreWishlist, addItem: addWishlistItem, removeItem: removeWishlistItem } = useWishlistStore();
  const [added, setAdded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = !!user && !!token;

  const isInWishlist = checkStoreWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1, type: 'product', image: product.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !token) {
      setToastMessage('Please login to add to wishlist');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id, token);
        removeWishlistItem(product.id);
        setToastMessage('Removed from wishlist');
      } else {
        const wishlistItem = await addToWishlist(product.id, token);
        addWishlistItem(wishlistItem);
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
      setIsLoading(false);
    }
  };

  const discountPercentage = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount;

  const getShippingText = () => {
    if (product.shippingDays === 1) return 'Ships in 1 work day';
    if (product.shippingDays === 2) return 'Ships in 1-2 work days';
    if (product.shippingDays && product.shippingDays > 2) {
      return `Ships in ${product.shippingDays - 1} - ${product.shippingDays} work days`;
    }
    return 'Ships in 3-4 work days';
  };

  const normalizeImageUrl = (url?: string) => {
    if (!url) return '/assets/placeholder.svg';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) {
      if (url.startsWith('/assets/')) {
        return url;
      }

      if (!url.startsWith('/images/')) {
        return url;
      }

      // Use relative path for images - Nginx proxies /api/ to backend
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
      const host = apiBase.replace(/\/api\/?$/, '') || '';
      return `${host}${url}`;
    }
    return url;
  };

  const normalizedImage = normalizeImageUrl(product.image);

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      {/* Badges Row - Above Image */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        {discountPercentage && (
          <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm flex items-center gap-0.5">
            <Percent className="w-2.5 h-2.5" /> {discountPercentage}% OFF
          </span>
        )}
        {product.badge && !discountPercentage && (
          <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-semibold rounded-full shadow-sm">
            {product.badge}
          </span>
        )}
        {product.stock === 'in' && (
          <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-semibold rounded-full shadow-sm">
            In Stock
          </span>
        )}
        {product.stock === 'low' && (
          <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-semibold rounded-full shadow-sm">
            Low Stock
          </span>
        )}
      </div>

      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/3] bg-white overflow-hidden block">
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            onClick={handleWishlist}
            className="w-8 h-8 bg-white/95 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:scale-110 transition-all duration-200"
          >
            <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              router.push(`/products/${product.slug}`);
            }}
            className="w-8 h-8 bg-white/95 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 hover:text-[#003d7a] hover:scale-110 transition-all duration-200"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Image */}
        <img
          src={normalizedImage}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.svg'; }}
        />
      </Link>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{product.brand}</p>
        )}

        {/* Rating - Only show if rating > 0 */}
        {(product.rating ?? 0) > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(product.rating!) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
          </div>
        )}

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#003d7a] transition-colors duration-200 text-sm leading-tight">
            {product.name}
          </h4>
        </Link>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <p className="text-lg font-bold text-[#003d7a]">{formatPrice(product.price)}</p>
            {product.originalPrice && (
              <p className="text-xs text-gray-400 line-through whitespace-nowrap">{formatPrice(product.originalPrice)}</p>
            )}
          </div>
          <span className="text-xs text-gray-400">VAT incl.</span>
          <p className="text-xs text-gray-500 mt-1">{getShippingText()}</p>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleQuickAdd}
          disabled={product.stock === 'out'}
          className={`w-full py-2.5 text-white text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all duration-200 mt-auto ${
            added ? 'bg-green-500 hover:bg-green-600' : product.stock === 'out' ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#003d7a] hover:bg-[#002855]'
          }`}
        >
          {added ? <><Check className="w-4 h-4" /> Added!</> : product.stock === 'out' ? 'Out of Stock' : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm animate-in fade-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
