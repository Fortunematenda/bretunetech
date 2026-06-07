'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Check, X, Loader2, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { checkWishlist, addToWishlist, removeFromWishlist } from '@/lib/wishlist-api';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sellingPrice: number;
    costPrice?: number;
    condition: string;
    images: { url: string; altText?: string }[];
    tags?: { tag: string }[];
    category?: { name: string; slug: string };
    stockQuantity?: number;
    averageRating?: number;
    reviewCount?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token, user } = useAuthStore();
  const isAuthenticated = !!user && !!token;
  const { isInWishlist: checkStoreWishlist, addItem, removeItem } = useWishlistStore();
  
  const isInWishlist = checkStoreWishlist(product.id);

  const toggleWishlist = async (e: React.MouseEvent) => {
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
        removeItem(product.id);
        setToastMessage('Removed from wishlist');
      } else {
        const wishlistItem = await addToWishlist(product.id, token);
        addItem(wishlistItem);
        setToastMessage(`Added to wishlist!`);
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

  const normalizeImageUrl = (url?: string) => {
    if (!url) return '/assets/products-pics/voltnet-logo.jfif';
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

  const primaryImage = normalizeImageUrl(product.images?.[0]?.url);

  // Get badge - prioritize certain tags
  const badge = product.tags?.find((t) => t.tag === 'Best Seller')?.tag ||
    product.tags?.find((t) => t.tag === 'New')?.tag ||
    product.tags?.find((t) => t.tag === 'Premium')?.tag ||
    (product.condition === 'REFURBISHED' ? 'Refurbished' : undefined);

  return (
    <>
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col card-glow hover:-translate-y-1"
    >
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden p-4 flex items-center justify-center">
        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 z-10 pointer-events-none" />

        {badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full shadow-sm z-10">
            {badge}
          </span>
        )}
        <button
          onClick={toggleWishlist}
          disabled={isLoading}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all z-10 ${
            isInWishlist
              ? 'bg-red-50 text-red-500'
              : 'bg-white/80 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100'
          } ${isLoading ? 'cursor-wait' : ''}`}
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
          )}
        </button>
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/products-pics/voltnet-logo.jfif'; }}
        />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        {/* Rating */}
        {product.averageRating && product.averageRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(product.averageRating!) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">{product.averageRating.toFixed(1)}</span>
          </div>
        )}
        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#003d7a] transition-colors duration-200 text-sm">
          {product.name}
        </h4>
        <p className="text-lg font-bold text-[#003d7a] group-hover:scale-105 transition-transform duration-200 origin-left">{formatPrice(product.sellingPrice)}</p>
        <p className="text-xs text-slate-500 mt-0.5">VAT incl.</p>
      </div>
    </Link>

    {/* Toast Notification */}
    {showToast && (
      <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all max-w-sm ${
        isInWishlist ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
      }`}>
        {isInWishlist ? <Check className="w-5 h-5 flex-shrink-0" /> : <X className="w-5 h-5 flex-shrink-0" />}
        <span className="font-medium text-sm">{toastMessage}</span>
      </div>
    )}
    </>
  );
}
