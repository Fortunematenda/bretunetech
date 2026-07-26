'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Minus,
  Plus,
  Check,
  Zap,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  FileText,
  Mail,
  Clock3,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import { brand } from '@/lib/brand';
import { businessConfig } from '@/lib/businessConfig';
import { formatPrice } from '@/lib/utils';
import { TrackedWhatsAppLink } from '@/components/analytics/TrackedLinks';
import { addressesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { storeButton } from '@/components/ui/button-variants';
import { Separator } from '@/components/ui/separator';
import { iconSize } from '@/lib/icons';

const DEFAULT_DELIVER_TO = brand.location;

interface ProductPurchaseCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sellingPrice: number;
    originalPrice?: number;
    condition: string;
    stockQuantity: number;
    stockCpt?: number;
    stockJhb?: number;
    stockDbn?: number;
    shippingDays?: number;
    sku?: string;
    images: { url: string; altText?: string }[];
    brand?: { name: string };
    supplierName?: string;
  };
  quantity: number;
  setQuantity: (q: number) => void;
  warehouseLocation: 'CPT' | 'JHB' | 'DBN' | undefined;
  setWarehouseLocation: (loc: 'CPT' | 'JHB' | 'DBN') => void;
  addedToCart: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isInWishlist: boolean;
  isWishlistLoading: boolean;
  onToggleWishlist: () => void;
  inStock: boolean;
  getShippingText: () => string;
}

const WAREHOUSES = [
  { code: 'CPT' as const, name: 'Cape Town' },
  { code: 'JHB' as const, name: 'Johannesburg' },
  { code: 'DBN' as const, name: 'Durban' },
] as const;

function formatDeliveryEstimate(shippingDays?: number, hasWarehouseStock?: boolean) {
  if (hasWarehouseStock) return '1–3 work days';
  const days = shippingDays && shippingDays > 0 ? shippingDays : 3;
  if (days <= 1) return '1 work day';
  if (days === 2) return '1–2 work days';
  return `${Math.max(1, days - 1)}–${days} work days`;
}

export default function ProductPurchaseCard({
  product,
  quantity,
  setQuantity,
  warehouseLocation,
  setWarehouseLocation,
  addedToCart,
  onAddToCart,
  onBuyNow,
  isInWishlist,
  isWishlistLoading,
  onToggleWishlist,
  inStock,
}: ProductPurchaseCardProps) {
  const { token } = useAuthStore();
  const [showWarehousePicker, setShowWarehousePicker] = useState(false);
  const [localAction, setLocalAction] = useState<'cart' | 'buy' | null>(null);
  const [deliverTo, setDeliverTo] = useState(DEFAULT_DELIVER_TO);

  const warehouseStockCount = [
    (product.stockCpt ?? 0) > 0,
    (product.stockJhb ?? 0) > 0,
    (product.stockDbn ?? 0) > 0,
  ].filter(Boolean).length;
  const requiresWarehouse = inStock && warehouseStockCount > 0;
  const canPurchase = inStock && (!requiresWarehouse || !!warehouseLocation);
  const stockCounts = {
    CPT: product.stockCpt ?? 0,
    JHB: product.stockJhb ?? 0,
    DBN: product.stockDbn ?? 0,
  };
  const maxQty = Math.max(product.stockQuantity || 0, 1);
  const canDecrease = quantity > 1;
  const canIncrease = quantity < maxQty;
  const busy = localAction !== null || !canPurchase;
  const deliveryEstimate = formatDeliveryEstimate(product.shippingDays, requiresWarehouse);
  const selectedWarehouse = WAREHOUSES.find((w) => w.code === warehouseLocation);
  const deliverLabel = selectedWarehouse
    ? `Dispatch from: ${selectedWarehouse.name}`
    : requiresWarehouse
      ? 'Select dispatch warehouse'
      : `Deliver to: ${deliverTo}`;

  useEffect(() => {
    if (!token) {
      setDeliverTo(DEFAULT_DELIVER_TO);
      return;
    }
    let cancelled = false;
    addressesApi
      .list(token)
      .then((addresses) => {
        if (cancelled || !addresses?.length) {
          if (!cancelled) setDeliverTo(DEFAULT_DELIVER_TO);
          return;
        }
        const defaultAddress =
          addresses.find((a: { isDefault?: boolean }) => a.isDefault) || addresses[0];
        const label = [defaultAddress.city, defaultAddress.province]
          .filter(Boolean)
          .join(', ');
        setDeliverTo(
          label || defaultAddress.formattedAddress || DEFAULT_DELIVER_TO
        );
      })
      .catch(() => {
        if (!cancelled) setDeliverTo(DEFAULT_DELIVER_TO);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (requiresWarehouse && warehouseStockCount === 1 && !warehouseLocation) {
      const single = WAREHOUSES.find((w) => stockCounts[w.code] > 0);
      if (single) setWarehouseLocation(single.code);
    }
    // Auto-select only when a single warehouse has stock
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stockCounts derived from product fields
  }, [requiresWarehouse, warehouseStockCount, warehouseLocation, setWarehouseLocation, product.stockCpt, product.stockJhb, product.stockDbn]);

  const handleAddToCart = () => {
    if (!canPurchase || localAction || addedToCart) return;
    setLocalAction('cart');
    try {
      onAddToCart();
    } finally {
      // Parent clears addedToCart after toast; release local lock shortly
      window.setTimeout(() => setLocalAction(null), 400);
    }
  };

  const handleBuyNow = () => {
    if (!canPurchase || localAction) return;
    setLocalAction('buy');
    try {
      onBuyNow();
    } finally {
      window.setTimeout(() => setLocalAction(null), 800);
    }
  };

  return (
    <aside
      aria-label="Purchase options"
      className="w-full max-w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-6 lg:sticky lg:top-24"
    >
      {/* 1. Price */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-2xl font-bold tracking-tight text-[#003d7a] sm:text-[1.65rem]">
          {formatPrice(product.sellingPrice)}
        </p>
        {businessConfig.showVatOnCustomerPages && (
          <span className="text-xs font-medium text-slate-500">Incl. VAT</span>
        )}
        {product.originalPrice && product.originalPrice > product.sellingPrice && (
          <span className="text-sm text-slate-400 line-through">
            {formatPrice(product.originalPrice)}
          </span>
        )}
      </div>

      {/* 2. Delivery summary */}
      {inStock ? (
        <div className="mt-4 flex items-start gap-3">
          <Rocket aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              Get it in {deliveryEstimate}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              Major cities often faster ·{' '}
              <Link href="/delivery" className="text-[#003d7a] font-medium hover:underline">
                T&amp;Cs apply
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm font-semibold text-red-600">Currently out of stock</p>
      )}

      {/* 3. Processing message */}
      {inStock && (
        <div className="mt-4 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
          <Clock3 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Order now to start processing</p>
            <p className="mt-0.5 text-xs text-emerald-800">as soon as payment clears.</p>
          </div>
        </div>
      )}

      {/* 4. Delivery location */}
      <div className="mt-3">
        {requiresWarehouse ? (
          <button
            type="button"
            onClick={() => setShowWarehousePicker((v) => !v)}
            className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-slate-200 px-3.5 text-left transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d7a] focus-visible:ring-offset-2"
          >
            <MapPin aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400" />
            <span className={`min-w-0 flex-1 truncate text-sm font-semibold ${!warehouseLocation ? 'text-orange-700' : 'text-slate-900'}`}>
              {deliverLabel}
            </span>
            <span className="text-sm font-semibold text-[#003d7a]">Change</span>
          </button>
        ) : (
          <div className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-slate-200 px-3.5">
            <MapPin aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
              Deliver to: {deliverTo}
            </span>
            <Link
              href={token ? '/account/addresses' : '/delivery'}
              className="text-sm font-semibold text-[#003d7a] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d7a] focus-visible:ring-offset-2 rounded"
            >
              {token ? 'Change' : 'Info'}
            </Link>
          </div>
        )}

        {requiresWarehouse && (showWarehousePicker || !warehouseLocation) && (
          <div className="mt-2 space-y-2" role="listbox" aria-label="Dispatch warehouse">
            {WAREHOUSES.map((wh) => {
              const count = stockCounts[wh.code];
              if (count <= 0) return null;
              const selected = warehouseLocation === wh.code;
              return (
                <button
                  key={wh.code}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setWarehouseLocation(wh.code);
                    setShowWarehousePicker(false);
                  }}
                  className={`flex min-h-11 w-full items-center justify-between rounded-xl border px-3.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d7a] focus-visible:ring-offset-2 ${
                    selected
                      ? 'border-[#003d7a] bg-[#003d7a] text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <MapPin aria-hidden="true" className="h-4 w-4" />
                    {wh.name}
                  </span>
                  <span className={`text-xs font-normal ${selected ? 'text-white/80' : 'text-slate-500'}`}>
                    {count} in stock
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Divider */}
      <Separator className="my-5" />

      {/* 6. Quantity */}
      <div className="flex items-center justify-between gap-4">
        <span id="product-quantity-label" className="text-sm font-semibold text-slate-900">
          Quantity
        </span>
        <div
          className="inline-flex min-h-11 items-center overflow-hidden rounded-xl border border-slate-200 bg-white"
          role="group"
          aria-labelledby="product-quantity-label"
        >
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={!canDecrease || localAction !== null}
            className="grid h-11 w-11 place-items-center text-slate-600 transition hover:bg-slate-50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d7a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus aria-hidden="true" className="h-4 w-4" />
          </button>
          <output
            aria-live="polite"
            className="min-w-10 px-2 text-center text-sm font-semibold text-slate-950"
          >
            {quantity}
          </output>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
            disabled={!canIncrease || localAction !== null}
            className="grid h-11 w-11 place-items-center text-slate-600 transition hover:bg-slate-50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d7a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 7. Primary action */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={busy || addedToCart}
        aria-busy={localAction === 'cart'}
        className={`${storeButton.cart} mt-5`}
      >
        {localAction === 'cart' ? (
          <>
            <Loader2 aria-hidden="true" className={`${iconSize.lg} animate-spin`} />
            Adding…
          </>
        ) : addedToCart ? (
          <>
            <Check aria-hidden="true" className={iconSize.lg} />
            Added to Cart
          </>
        ) : !inStock ? (
          'Out of stock'
        ) : !canPurchase ? (
          'Select warehouse'
        ) : (
          <>
            <ShoppingCart aria-hidden="true" className={iconSize.lg} />
            Add to Cart
          </>
        )}
      </button>

      {/* 8. Secondary actions */}
      <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={busy}
          aria-busy={localAction === 'buy'}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-[#003d7a] bg-white px-3 text-sm font-semibold text-[#003d7a] transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d7a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {localAction === 'buy' ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Zap aria-hidden="true" className="h-4 w-4" />
          )}
          Buy Now
        </button>

        <button
          type="button"
          onClick={onToggleWishlist}
          disabled={isWishlistLoading || localAction !== null}
          aria-pressed={isInWishlist}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d7a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isWishlistLoading ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Heart
              aria-hidden="true"
              className={`h-4 w-4 ${isInWishlist ? 'fill-current text-rose-600' : ''}`}
            />
          )}
          {isInWishlist ? 'Saved' : 'Add to List'}
        </button>
      </div>

      {/* 9. Trust indicators */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Rocket aria-hidden="true" className="h-3.5 w-3.5" />
          Fast dispatch
        </span>
        <span aria-hidden="true" className="text-slate-300">•</span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
          Secure checkout
        </span>
      </div>

      <Separator className="my-5" />

      {/* 10. Help */}
      <section aria-labelledby="purchase-help-heading">
        <h3
          id="purchase-help-heading"
          className="text-xs font-bold uppercase tracking-wide text-slate-700"
        >
          Need help?
        </h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <TrackedWhatsAppLink
            location="pdp_purchase_card"
            href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(
              `Hi BretuneTech, I'm interested in *${product.name}* (${formatPrice(product.sellingPrice)}).\n${brand.website}/products/${product.slug}\n\nIs this in stock?`
            )}`}
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-2 text-xs font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <MessageCircle aria-hidden="true" className="h-4 w-4" />
            WhatsApp
          </TrackedWhatsAppLink>
          <a
            href={`mailto:${brand.emailSales}?subject=${encodeURIComponent(
              `Quote request: ${product.name}`
            )}&body=${encodeURIComponent(
              `Hi BretuneTech,\n\nI'd like a quote for the following:\n\nProduct: ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''}\nLink: ${brand.website}/products/${product.slug}\n\nQuantity needed: \nDo you offer installation? \nDelivery location: \n\nThank you.`
            )}`}
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#003d7a] bg-white px-2 text-xs font-semibold text-[#003d7a] transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d7a] focus-visible:ring-offset-2"
          >
            <FileText aria-hidden="true" className="h-4 w-4" />
            Quote
          </a>
          <a
            href="/contact"
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d7a] focus-visible:ring-offset-2"
          >
            <Mail aria-hidden="true" className="h-4 w-4" />
            Contact
          </a>
        </div>
      </section>

      {/* 11. Payment reassurance — only methods currently offered at checkout */}
      <div className="mt-5 rounded-xl bg-slate-50 p-3.5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Secure payments</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
              <span>EFT / Bank Transfer</span>
            </div>
          </div>
          <div className="flex max-w-[8.5rem] items-center gap-2 border-l border-slate-200 pl-3">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-[10px] leading-4 text-slate-500">
              Your payment is safe and secure
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
