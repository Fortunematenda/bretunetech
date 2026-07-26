export type RawTrendPoint = {
  date?: unknown;
  count?: unknown;
  pageViews?: unknown;
  page_views?: unknown;
  visitors?: unknown;
};

export type TrendPoint = {
  date: string; // YYYY-MM-DD
  visitors: number;
  pageViews: number;
  label: string;
  fullDate: string;
};

function toFiniteNumber(value: unknown): number {
  if (value == null || value === '') return 0;
  if (typeof value === 'bigint') return Number(value);
  const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function toDateKey(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.substring(0, 10);
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatShortDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  return new Date(y, m - 1, d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
}

function formatFullDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  return new Date(y, m - 1, d).toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Group by day, coerce numbers, sort chronologically. Does not invent values. */
export function normalizeVisitorTrend(raw: unknown): TrendPoint[] {
  if (!Array.isArray(raw)) return [];

  const byDay = new Map<string, { visitors: number; pageViews: number }>();

  for (const item of raw as RawTrendPoint[]) {
    if (!item || typeof item !== 'object') continue;
    const key = toDateKey(item.date);
    if (!key) continue;

    const visitors = toFiniteNumber(item.count ?? item.visitors);
    const pageViews = toFiniteNumber(item.pageViews ?? item.page_views);
    const prev = byDay.get(key);
    if (prev) {
      // If API already daily-aggregates, keep max to avoid double-counting filled zeros;
      // if raw timestamps sneak in, sum.
      byDay.set(key, {
        visitors: prev.visitors + visitors,
        pageViews: prev.pageViews + pageViews,
      });
    } else {
      byDay.set(key, { visitors, pageViews });
    }
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      visitors: Math.max(0, Math.round(values.visitors)),
      pageViews: Math.max(0, Math.round(values.pageViews)),
      label: formatShortDate(date),
      fullDate: formatFullDate(date),
    }));
}

export function summarizeVisitorTrend(points: TrendPoint[], previousPoints: TrendPoint[] = []) {
  const totalVisitors = points.reduce((sum, p) => sum + p.visitors, 0);
  const totalPageViews = points.reduce((sum, p) => sum + p.pageViews, 0);
  const previousTotal = previousPoints.reduce((sum, p) => sum + p.visitors, 0);

  let changePercent: number | null = null;
  if (previousPoints.length > 0 && previousTotal > 0) {
    changePercent = ((totalVisitors - previousTotal) / previousTotal) * 100;
  } else if (previousPoints.length > 0 && previousTotal === 0 && totalVisitors > 0) {
    changePercent = null; // real previous period exists but was zero — avoid fake %
  }

  return {
    totalVisitors,
    totalPageViews,
    previousTotal,
    changePercent,
    hasPageViews: points.some((p) => p.pageViews > 0) || totalPageViews > 0,
  };
}

export function niceYMax(maxValue: number): number {
  if (maxValue <= 0) return 4;
  if (maxValue <= 4) return 4;
  const padded = Math.ceil(maxValue * 1.1);
  const magnitude = 10 ** Math.floor(Math.log10(padded));
  const step = magnitude >= 10 ? magnitude / 2 : 1;
  return Math.max(4, Math.ceil(padded / step) * step);
}

export function yTicks(max: number, count = 4): number[] {
  const ticks: number[] = [];
  for (let i = 0; i <= count; i++) {
    ticks.push(Math.round((max / count) * i));
  }
  return Array.from(new Set(ticks));
}
