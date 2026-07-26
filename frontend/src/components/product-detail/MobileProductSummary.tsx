'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, MapPin, Minus, Plus, Rocket, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { businessConfig } from '@/lib/businessConfig';
import { brand } from '@/lib/brand';
import { addressesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

const DEFAULT_DELIVER_TO = brand.location;

const WAREHOUSES = [
  { code: 'CPT' as const, name: 'Cape Town' },
  { code: 'JHB' as const, name: 'Johannesburg' },
  { code: 'DBN' as const, name: 'Durban' },
] as const;

interface MobileProductSummaryProps {
  product: {
    name: string;
    sellingPrice: number;
    originalPrice?: number;
    sku?: string;
    brand?: { name: string; slug?: string };
    stockCpt?: number;
    stockJhb?: number;
    stockDbn?: number;
    shippingDays?: number;
  };
  reviewStats: { average: number; count: number } | null;
  quantity: number;
  setQuantity: (q: number) => void;
  maxQty: number;
  warehouseLocation: 'CPT' | 'JHB' | 'DBN' | undefined;
  setWarehouseLocation: (loc: 'CPT' | 'JHB' | 'DBN') => void;
  requiresWarehouse: boolean;
  deliveryEstimate: string;
  inStock: boolean;
}

export default function MobileProductSummary({
  product,
  reviewStats,
  quantity,
  setQuantity,
  maxQty,
  warehouseLocation,
  setWarehouseLocation,
  requiresWarehouse,
  deliveryEstimate,
  inStock,
}: MobileProductSummaryProps) {
  const { token } = useAuthStore();
  const [deliverTo, setDeliverTo] = useState(DEFAULT_DELIVER_TO);
  const stockCounts = {
    CPT: product.stockCpt ?? 0,
    JHB: product.stockJhb ?? 0,
    DBN: product.stockDbn ?? 0,
  };

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
        setDeliverTo(label || defaultAddress.formattedAddress || DEFAULT_DELIVER_TO);
      })
      .catch(() => {
        if (!cancelled) setDeliverTo(DEFAULT_DELIVER_TO);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="space-y-4">
      {/* Price first — Takealot mobile order */}
      <div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="text-[1.75rem] font-bold leading-none tracking-tight text-[#003d7a]">
            {formatPrice(product.sellingPrice)}
          </p>
          {businessConfig.showVatOnCustomerPages && (
            <span className="text-xs font-medium text-slate-500">Incl. VAT</span>
          )}
        </div>
        {product.originalPrice && product.originalPrice > product.sellingPrice && (
          <p className="mt-1 text-sm text-slate-400 line-through">
            {formatPrice(product.originalPrice)}
          </p>
        )}
        {!inStock && (
          <p className="mt-2 text-sm font-semibold text-red-600">Currently out of stock</p>
        )}
      </div>

      <h1 className="text-[1.125rem] font-bold leading-snug text-slate-900">
        {product.name}
      </h1>

      {product.brand?.name && (
        <div className="text-sm">
          {product.brand.slug ? (
            <Link
              href={`/products?brand=${product.brand.slug}`}
              className="font-medium text-[#003d7a] hover:underline"
            >
              {product.brand.name}
            </Link>
          ) : (
            <span className="font-medium text-slate-700">{product.brand.name}</span>
          )}
        </div>
      )}

      {product.sku ? (
        <p className="text-sm text-slate-600">
          <span className="text-slate-500">SKU:</span>{' '}
          <span className="font-mono font-medium text-slate-800">{product.sku}</span>
        </p>
      ) : null}

      <div className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1">
        <CheckCircle className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
        <span className="text-[10px] font-medium text-green-700">
          by bretunetech distributor network
        </span>
      </div>

      {reviewStats && reviewStats.count > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.round(reviewStats.average)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {reviewStats.average.toFixed(1)}
          </span>
          <span className="text-sm text-slate-500">({reviewStats.count})</span>
        </div>
      )}

      {inStock && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-3">
          <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Get it in {deliveryEstimate}
            </p>
            <p className="mt-0.5 text-xs text-emerald-700">
              Major cities often faster
            </p>
          </div>
        </div>
      )}

      <div className="flex min-h-11 items-center gap-2.5 rounded-xl border border-slate-200 px-3">
        <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
          {requiresWarehouse && warehouseLocation
            ? `Dispatch from: ${WAREHOUSES.find((w) => w.code === warehouseLocation)?.name}`
            : requiresWarehouse
              ? 'Select dispatch warehouse'
              : `Deliver to: ${deliverTo}`}
        </span>
        <Link
          href={token ? '/account/addresses' : '/delivery'}
          className="shrink-0 text-sm font-semibold text-[#003d7a]"
        >
          {token ? 'Change' : 'Info'}
        </Link>
      </div>

      {requiresWarehouse && !warehouseLocation && (
        <div className="space-y-2">
          {WAREHOUSES.map((wh) => {
            const count = stockCounts[wh.code];
            if (count <= 0) return null;
            return (
              <button
                key={wh.code}
                type="button"
                onClick={() => setWarehouseLocation(wh.code)}
                className="flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-200 px-3.5 text-sm font-semibold text-slate-800"
              >
                <span>{wh.name}</span>
                <span className="text-xs font-normal text-slate-500">{count} in stock</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-slate-900">Quantity</span>
        <div className="inline-flex min-h-11 items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="grid h-11 w-11 place-items-center text-slate-600 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <output className="min-w-10 px-2 text-center text-sm font-semibold">{quantity}</output>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
            disabled={quantity >= maxQty}
            className="grid h-11 w-11 place-items-center text-slate-600 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
