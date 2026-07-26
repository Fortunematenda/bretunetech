'use client';

import { Check, Loader2, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface MobileStickyBuyBarProps {
  price: number;
  originalPrice?: number;
  inStock: boolean;
  canPurchase: boolean;
  addedToCart: boolean;
  isAdding: boolean;
  onAddToCart: () => void;
}

export default function MobileStickyBuyBar({
  price,
  originalPrice,
  inStock,
  canPurchase,
  addedToCart,
  isAdding,
  onAddToCart,
}: MobileStickyBuyBarProps) {
  const busy = isAdding || !canPurchase || addedToCart;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-slate-200 bg-white/95 px-3 pt-2.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="mx-auto flex max-w-[1560px] items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold leading-none tracking-tight text-[#003d7a]">
            {formatPrice(price)}
          </p>
          {originalPrice && originalPrice > price && (
            <p className="mt-0.5 text-xs text-slate-400 line-through">
              {formatPrice(originalPrice)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={busy}
          aria-busy={isAdding}
          className="inline-flex min-h-12 min-w-[9.5rem] flex-[1.2] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          {isAdding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Adding…
            </>
          ) : addedToCart ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Added
            </>
          ) : !inStock ? (
            'Out of stock'
          ) : !canPurchase ? (
            'Select warehouse'
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
