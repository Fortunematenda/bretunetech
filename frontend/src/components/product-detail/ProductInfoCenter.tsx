'use client';

import { Star, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { brand } from '@/lib/brand';

interface ProductInfoCenterProps {
  product: {
    id: string;
    name: string;
    slug: string;
    condition: string;
    category?: { name: string; slug: string };
    brand?: { name: string; slug?: string };
    sku?: string;
    specifications?: { key: string; value: string }[];
    shippingDays?: number;
  };
  reviewStats: { average: number; count: number } | null;
  getShippingText: () => string;
}

const ASSURANCES = [
  {
    href: '/delivery',
    icon: Truck,
    title: 'Nationwide delivery',
    detail: 'Free on qualifying orders',
  },
  {
    href: '/returns',
    icon: RotateCcw,
    title: '30-day returns',
    detail: 'Straightforward exchanges',
  },
  {
    href: '/warranty',
    icon: ShieldCheck,
    title: 'Local warranty',
    detail: 'Up to 12 months cover',
  },
] as const;

export default function ProductInfoCenter({
  product,
  reviewStats,
  getShippingText,
}: ProductInfoCenterProps) {
  const hasReviews = !!reviewStats && reviewStats.count > 0;
  const shippingText = getShippingText();
  const rating = hasReviews ? Math.round(reviewStats!.average) : 0;

  const scrollToReviews = () => {
    const el = document.getElementById('product-tabs');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const reviewsTab = el.querySelector<HTMLButtonElement>('[data-tab="reviews"]');
    reviewsTab?.click();
  };

  return (
    <div className="flex flex-col text-left">
      <h1 className="mb-3 text-xl font-bold leading-snug tracking-tight text-[#003d7a] sm:text-2xl">
        {product.name}
      </h1>

      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {product.brand?.name ? (
          product.brand.slug ? (
            <Link
              href={`/products?brand=${product.brand.slug}`}
              className="font-semibold text-slate-800 underline-offset-2 hover:text-[#003d7a] hover:underline"
            >
              {product.brand.name}
            </Link>
          ) : (
            <span className="font-semibold text-slate-800">{product.brand.name}</span>
          )
        ) : null}
        {product.brand?.name && product.category?.name ? (
          <span className="text-slate-300" aria-hidden="true">
            |
          </span>
        ) : null}
        {product.category?.name ? (
          product.category.slug ? (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-slate-500 underline-offset-2 hover:text-[#003d7a] hover:underline"
            >
              {product.category.name}
            </Link>
          ) : (
            <span className="text-slate-500">{product.category.name}</span>
          )
        ) : null}
      </div>

      {product.sku ? (
        <p className="mb-1 text-sm text-slate-600">
          <span className="text-slate-500">SKU:</span>{' '}
          <span className="font-mono font-medium text-slate-800">{product.sku}</span>
        </p>
      ) : null}

      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-400">
        Supplied by {brand.name}
      </p>

      {hasReviews ? (
        <button
          type="button"
          onClick={scrollToReviews}
          className="mb-5 flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm transition-colors hover:border-[#003d7a]/30 hover:bg-[#003d7a]/5"
        >
          <span className="flex gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`size-3.5 ${
                  i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
                }`}
              />
            ))}
          </span>
          <span className="font-semibold text-slate-900">{reviewStats!.average.toFixed(1)}</span>
          <span className="text-slate-500">
            {reviewStats!.count} review{reviewStats!.count === 1 ? '' : 's'}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={scrollToReviews}
          className="mb-5 w-fit text-sm font-medium text-[#003d7a] underline-offset-2 hover:underline"
        >
          Write a review
        </button>
      )}

      <div className="mb-4 rounded-xl border border-[#003d7a]/15 bg-[#e8f0f8] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#003d7a] shadow-sm">
              <Truck className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#003d7a]/70">
                Dispatch
              </p>
              <p className="text-sm font-bold text-slate-900">{shippingText}</p>
            </div>
          </div>
          <Link
            href="/delivery"
            className="text-xs font-semibold text-[#003d7a] underline-offset-2 hover:underline"
          >
            Delivery info
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {ASSURANCES.map(({ href, icon: Icon, title, detail }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:border-[#003d7a]/35 hover:bg-slate-50"
          >
            <Icon className="mb-1.5 size-4 text-[#003d7a]" aria-hidden="true" />
            <p className="text-xs font-semibold text-slate-900">{title}</p>
            <p className="text-[11px] text-slate-500">{detail}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
