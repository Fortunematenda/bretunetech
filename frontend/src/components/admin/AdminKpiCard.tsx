'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AdminKpiTone =
  | 'emerald'
  | 'primary'
  | 'sky'
  | 'rose'
  | 'amber'
  | 'orange'
  | 'red'
  | 'slate'
  | 'teal';

const TONES: Record<
  AdminKpiTone,
  {
    ring: string;
    wash: string;
    blob: string;
    iconWrap: string;
    value: string;
    bar: string;
    chip: string;
  }
> = {
  emerald: {
    ring: 'hover:border-emerald-200/80',
    wash: 'from-emerald-500/[0.12] via-emerald-500/[0.04] to-transparent',
    blob: 'bg-emerald-400/25',
    iconWrap: 'bg-emerald-500 text-white shadow-emerald-500/30',
    value: 'text-emerald-700',
    bar: 'from-emerald-500 to-teal-400',
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  primary: {
    ring: 'hover:border-primary/30',
    wash: 'from-primary/[0.12] via-primary/[0.04] to-transparent',
    blob: 'bg-primary/20',
    iconWrap: 'bg-primary text-white shadow-primary/30',
    value: 'text-primary',
    bar: 'from-primary to-sky-500',
    chip: 'bg-primary/5 text-primary ring-primary/10',
  },
  sky: {
    ring: 'hover:border-sky-200/80',
    wash: 'from-sky-500/[0.12] via-sky-500/[0.04] to-transparent',
    blob: 'bg-sky-400/25',
    iconWrap: 'bg-sky-500 text-white shadow-sky-500/30',
    value: 'text-sky-700',
    bar: 'from-sky-500 to-cyan-400',
    chip: 'bg-sky-50 text-sky-700 ring-sky-100',
  },
  rose: {
    ring: 'hover:border-rose-200/80',
    wash: 'from-rose-500/[0.12] via-rose-500/[0.04] to-transparent',
    blob: 'bg-rose-400/25',
    iconWrap: 'bg-rose-500 text-white shadow-rose-500/30',
    value: 'text-rose-700',
    bar: 'from-rose-500 to-orange-400',
    chip: 'bg-rose-50 text-rose-700 ring-rose-100',
  },
  amber: {
    ring: 'hover:border-amber-200/80',
    wash: 'from-amber-500/[0.12] via-amber-500/[0.04] to-transparent',
    blob: 'bg-amber-400/25',
    iconWrap: 'bg-amber-500 text-white shadow-amber-500/30',
    value: 'text-amber-700',
    bar: 'from-amber-500 to-orange-400',
    chip: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
  orange: {
    ring: 'hover:border-orange-200/80',
    wash: 'from-orange-500/[0.12] via-orange-500/[0.04] to-transparent',
    blob: 'bg-orange-400/25',
    iconWrap: 'bg-orange-500 text-white shadow-orange-500/30',
    value: 'text-orange-700',
    bar: 'from-orange-500 to-amber-400',
    chip: 'bg-orange-50 text-orange-700 ring-orange-100',
  },
  red: {
    ring: 'hover:border-red-200/80',
    wash: 'from-red-500/[0.12] via-red-500/[0.04] to-transparent',
    blob: 'bg-red-400/25',
    iconWrap: 'bg-red-500 text-white shadow-red-500/30',
    value: 'text-red-700',
    bar: 'from-red-500 to-rose-400',
    chip: 'bg-red-50 text-red-700 ring-red-100',
  },
  slate: {
    ring: 'hover:border-slate-300/80',
    wash: 'from-slate-500/[0.10] via-slate-500/[0.03] to-transparent',
    blob: 'bg-slate-400/20',
    iconWrap: 'bg-slate-600 text-white shadow-slate-500/30',
    value: 'text-slate-800',
    bar: 'from-slate-600 to-slate-400',
    chip: 'bg-slate-50 text-slate-700 ring-slate-200',
  },
  teal: {
    ring: 'hover:border-teal-200/80',
    wash: 'from-teal-500/[0.12] via-teal-500/[0.04] to-transparent',
    blob: 'bg-teal-400/25',
    iconWrap: 'bg-teal-500 text-white shadow-teal-500/30',
    value: 'text-teal-700',
    bar: 'from-teal-500 to-emerald-400',
    chip: 'bg-teal-50 text-teal-700 ring-teal-100',
  },
};

export interface AdminKpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  tone?: AdminKpiTone;
  href?: string;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
  showArrow?: boolean;
}

/** Shared admin KPI card — same look as the dashboard metrics. */
export default function AdminKpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'primary',
  href,
  onClick,
  className,
  loading,
  showArrow,
}: AdminKpiCardProps) {
  const t = TONES[tone] ?? TONES.primary;
  const clickable = Boolean(href || onClick);
  const arrow = showArrow ?? clickable;

  const inner = loading ? (
    <div className="relative p-4 sm:p-5">
      <div className="animate-pulse space-y-3">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-xl bg-gray-100" />
          <div className="h-7 w-7 rounded-full bg-gray-100" />
        </div>
        <div className="h-7 w-1/2 rounded bg-gray-100" />
        <div className="h-4 w-2/3 rounded bg-gray-100" />
      </div>
    </div>
  ) : (
    <div className="relative p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        {Icon ? (
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shadow-lg', t.iconWrap)}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
        ) : (
          <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset', t.chip)}>
            {label}
          </span>
        )}
        {arrow ? (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-gray-400 ring-1 ring-gray-200/80 transition-colors group-hover:bg-white group-hover:text-gray-700">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className="h-7 w-7" aria-hidden="true" />
        )}
      </div>

      <p className={cn('text-2xl font-bold tracking-tight sm:text-[1.65rem]', t.value)}>{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {Icon ? (
          <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset', t.chip)}>
            {label}
          </span>
        ) : null}
        {sub ? <span className="text-[11px] text-gray-500">{sub}</span> : null}
      </div>
    </div>
  );

  const baseClass = cn(
    'group relative block overflow-hidden rounded-2xl border border-gray-200/80 bg-white text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300',
    clickable && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(15,23,42,0.18)]',
    t.ring,
    className
  );

  const shell = (
    <>
      <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br', t.wash)} />
      <div className={cn('pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full blur-2xl', t.blob)} />
      <div className={cn('absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r', t.bar)} />
      {inner}
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={cn(baseClass, 'w-full')}>
        {shell}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(baseClass, 'w-full')}>
        {shell}
      </button>
    );
  }

  return <div className={baseClass}>{shell}</div>;
}
