'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Check, Loader2, Truck, ShoppingCart, Eye } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { formatPrice, cn } from '@/lib/utils';
import { appToast } from '@/lib/toast';
import { iconSize } from '@/lib/icons';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { addToWishlist, removeFromWishlist } from '@/lib/wishlist-api';
import { Button } from '@/components/ui/button';

export interface ProductCardProduct {
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
}

interface ProductCardProps {
  product: ProductCardProduct;
  returnUrl?: string;
}

function badgeStyle(label: string) {
  const key = label.toLowerCase();
  if (key.includes('best')) return 'bg-emerald-50 text-emerald-700';
  if (key === 'new' || key.includes('new arrival')) return 'bg-sky-50 text-[#003d7a]';
  if (key.includes('sale') || key.includes('special') || key.startsWith('-')) return 'bg-red-50 text-red-600';
  if (key.includes('refurb')) return 'bg-amber-50 text-amber-700';
  return 'bg-gray-100 text-gray-700';
}

export default function ProductCard({ product, returnUrl }: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addItem);
  const [cartAdded, setCartAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token, user } = useAuthStore();
  const isAuthenticated = !!user && !!token;
  const { isInWishlist: checkStoreWishlist, addItem, removeItem } = useWishlistStore();
  const isInWishlist = checkStoreWishlist(product.id);

  const productHref = returnUrl
    ? `/products/${product.slug}?returnUrl=${encodeURIComponent(returnUrl)}`
    : `/products/${product.slug}`;

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !token) {
      appToast.info('Please login to add to wishlist');
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id, token);
        removeItem(product.id);
        appToast.success('Removed from wishlist');
      } else {
        const wishlistItem = await addToWishlist(product.id, token);
        addItem(wishlistItem);
        appToast.success('Added to wishlist!');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update wishlist';
      appToast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeImageUrl = (url?: string) => {
    if (!url) return '/assets/placeholder.svg';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) {
      if (url.startsWith('/assets/') || !url.startsWith('/images/')) return url;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
      const host = apiBase.replace(/\/api\/?$/, '') || '';
      return `${host}${url}`;
    }
    return url;
  };

  const primaryImage = normalizeImageUrl(product.images?.[0]?.url);
  const [imageSrc, setImageSrc] = useState(primaryImage);
  useEffect(() => {
    setImageSrc(primaryImage);
  }, [primaryImage]);

  const discountPercentage =
    product.originalPrice && product.sellingPrice
      ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)
      : null;

  const tagBadge =
    product.tags?.find((t) => /best\s*seller/i.test(t.tag))?.tag ||
    product.tags?.find((t) => /^new$/i.test(t.tag) || /new arrival/i.test(t.tag))?.tag ||
    product.tags?.find((t) => /sale|special/i.test(t.tag))?.tag ||
    (product.condition === 'REFURBISHED' ? 'Refurbished' : undefined);

  const displayBadge = discountPercentage
    ? 'Sale'
    : tagBadge === 'Best Seller'
      ? 'Bestseller'
      : tagBadge;

  const inStock =
    (product.stockQuantity ?? 0) > 0 ||
    (product.stockCpt ?? 0) > 0 ||
    (product.stockJhb ?? 0) > 0 ||
    (product.stockDbn ?? 0) > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.sellingPrice,
      quantity: 1,
      type: 'product',
      image: product.images?.[0]?.url,
    });
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1500);
  };

  const getShippingText = () => {
    const cpt = product.stockCpt ?? 0;
    const jhb = product.stockJhb ?? 0;
    const dbn = product.stockDbn ?? 0;
    const anyWarehouse = cpt > 0 || jhb > 0 || dbn > 0;
    const multiWarehouse = [cpt > 0, jhb > 0, dbn > 0].filter(Boolean).length > 1;
    if (!anyWarehouse) {
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
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-md',
        !inStock && 'opacity-80'
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
        {displayBadge ? (
          <span
            className={cn(
              'absolute top-3 left-3 z-10 rounded-md px-2 py-0.5 text-[11px] font-semibold',
              badgeStyle(displayBadge)
            )}
          >
            {displayBadge === 'Sale' && discountPercentage ? `Sale` : displayBadge}
          </span>
        ) : null}

        <button
          type="button"
          onClick={toggleWishlist}
          disabled={isLoading}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isInWishlist}
          className={cn(
            'absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-400 shadow-sm transition-colors hover:text-red-500',
            isInWishlist && 'text-red-500'
          )}
        >
          {isLoading ? (
            <Loader2 className={`${iconSize.sm} animate-spin`} aria-hidden="true" />
          ) : (
            <Heart className={cn(iconSize.sm, isInWishlist && 'fill-current')} aria-hidden="true" />
          )}
        </button>

        <Link href={productHref} className="absolute inset-0 block" aria-label={product.name}>
          <Image
            src={imageSrc}
            alt={product.images?.[0]?.altText || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain object-center p-5"
            loading="lazy"
            unoptimized={imageSrc.endsWith('.svg')}
            onError={() => setImageSrc('/assets/placeholder.svg')}
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        {product.category?.name ? (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {product.category.name}
          </p>
        ) : null}

        <Link href={productHref} className="mb-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#0f172a] transition-colors group-hover:text-[#003d7a]">
            {product.name}
          </h3>
        </Link>

        <div className="mb-2">
          <p className="text-base font-bold text-[#003d7a]">{formatPrice(product.sellingPrice)}</p>
          {product.originalPrice && product.originalPrice > product.sellingPrice ? (
            <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
          ) : null}
        </div>

        <p className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
          <Truck className="size-3.5 shrink-0 text-gray-400" aria-hidden="true" />
          <span className="line-clamp-1">{inStock ? getShippingText() : 'Out of stock'}</span>
        </p>

        <div className="mt-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddToCart}
            disabled={!inStock}
            aria-label="Add to cart"
            className={cn(
              'h-10 flex-1 gap-2 rounded-lg border-gray-200 text-sm font-semibold text-[#003d7a] hover:bg-[#003d7a]/5 hover:text-[#003d7a]',
              cartAdded && 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700'
            )}
          >
            {cartAdded ? (
              <>
                <Check className={iconSize.sm} aria-hidden="true" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className={iconSize.sm} aria-hidden="true" />
                Add to Cart
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            asChild
            className="size-10 shrink-0 rounded-lg border-gray-200 text-gray-500 hover:text-[#003d7a]"
          >
            <Link href={productHref} aria-label={`View ${product.name}`}>
              <Eye className={iconSize.sm} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
