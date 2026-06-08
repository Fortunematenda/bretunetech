'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Check, X, Loader2, Truck } from 'lucide-react';
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
    originalPrice?: number;
    discountExpiresAt?: string;
    condition: string;
    images: { url: string; altText?: string }[];
    tags?: { tag: string }[];
    category?: { name: string; slug: string };
    stockQuantity?: number;
    stockCpt?: number;
    stockJhb?: number;
    stockDbn?: number;
    averageRating?: number;
    reviewCount?: number;
    shippingDays?: number;
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

  const primaryImage = normalizeImageUrl(product.images?.[0]?.url);

  // Get badge - prioritize certain tags
  const badge = product.tags?.find((t) => t.tag === 'Best Seller')?.tag ||
    product.tags?.find((t) => t.tag === 'New')?.tag ||
    product.tags?.find((t) => t.tag === 'Premium')?.tag ||
    (product.condition === 'REFURBISHED' ? 'Refurbished' : undefined);

  // Calculate discount percentage
  const discountPercentage = product.originalPrice && product.sellingPrice
    ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)
    : null;

  // Warehouse-aware shipping estimate
  const getShippingText = () => {
    const cpt = product.stockCpt ?? 0;
    const jhb = product.stockJhb ?? 0;
    const dbn = product.stockDbn ?? 0;
    const anyWarehouse = cpt > 0 || jhb > 0 || dbn > 0;
    const multiWarehouse = [cpt > 0, jhb > 0, dbn > 0].filter(Boolean).length > 1;
    if (!anyWarehouse) {
      // No warehouse stock — use product shippingDays or default
      if (product.shippingDays === 1) return 'Ships in 1 work day';
      if (product.shippingDays === 2) return 'Ships in 1-2 work days';
      return 'Ships in 3-5 work days';
    }
    if (multiWarehouse) return 'Same-day dispatch from CPT, JHB & DBN';
    if (cpt > 0) return 'Same-day dispatch from Cape Town';
    if (jhb > 0) return 'Same-day dispatch from Johannesburg';
    if (dbn > 0) return 'Same-day dispatch from Durban';
    return 'Ships in 1-2 work days';
  };

  return (
    <>
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col card-glow hover:-translate-y-1"
    >
      <div className="relative aspect-square w-full bg-white overflow-hidden flex items-center justify-center">
        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 z-10 pointer-events-none" />

        {discountPercentage && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm z-10">
            {discountPercentage}% OFF
          </span>
        )}
        {badge && !discountPercentage && (
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
          className="w-full h-full object-contain scale-110 group-hover:scale-125 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.svg'; }}
        />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#003d7a] transition-colors duration-200 text-sm">
          {product.name}
        </h4>
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <p className="text-base font-bold text-[#003d7a] group-hover:scale-105 transition-transform duration-200 origin-left">{formatPrice(product.sellingPrice)}</p>
          {product.originalPrice && (
            <p className="text-xs text-gray-400 line-through whitespace-nowrap">{formatPrice(product.originalPrice)}</p>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">VAT incl.</p>
        {/* Takealot-style dispatch row */}
        <div className="mt-2 space-y-1">
          {(product.stockCpt ?? 0) > 0 || (product.stockJhb ?? 0) > 0 || (product.stockDbn ?? 0) > 0 ? (
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#003d7a] shrink-0" />
              <div className="flex flex-wrap gap-1">
                {(product.stockCpt ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Cape Town
                  </span>
                )}
                {(product.stockCpt ?? 0) > 0 && (product.stockJhb ?? 0) > 0 && <span className="text-[10px] text-gray-300">·</span>}
                {(product.stockJhb ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                    Johannesburg
                  </span>
                )}
                {(product.stockJhb ?? 0) > 0 && (product.stockDbn ?? 0) > 0 && <span className="text-[10px] text-gray-300">·</span>}
                {(product.stockCpt ?? 0) > 0 && (product.stockDbn ?? 0) > 0 && (product.stockJhb ?? 0) === 0 && <span className="text-[10px] text-gray-300">·</span>}
                {(product.stockDbn ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-orange-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                    Durban
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 shrink-0" />{getShippingText()}
            </p>
          )}
        </div>
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
