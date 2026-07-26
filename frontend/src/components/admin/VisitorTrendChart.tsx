'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, TrendingUp, Users, Eye, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import {
  normalizeVisitorTrend,
  niceYMax,
  summarizeVisitorTrend,
  yTicks,
  type TrendPoint,
} from '@/lib/visitor-trend';

const RANGE_OPTIONS = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'Last 90 days' },
] as const;

type Props = {
  token: string | null | undefined;
  title?: string;
  defaultDays?: 7 | 30 | 90;
};

function ChartSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-gray-100" />
        ))}
      </div>
      <div className="h-[280px] rounded-lg bg-gray-50 border border-gray-100" />
    </div>
  );
}

function SingleDayState({ point }: { point: TrendPoint }) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-lg border border-dashed border-sky-200 bg-sky-50/60 px-4 py-10 min-h-[260px]">
      <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Visitors today</p>
      <p className="mt-2 text-4xl font-bold text-gray-900 tabular-nums">{point.visitors.toLocaleString()}</p>
      <p className="mt-1 text-sm text-gray-600">{point.fullDate}</p>
      {point.pageViews > 0 && (
        <p className="mt-2 text-xs text-gray-500">{point.pageViews.toLocaleString()} page views</p>
      )}
      <p className="mt-4 max-w-sm text-sm text-gray-500">
        More trend data will appear as visits are recorded.
      </p>
    </div>
  );
}

function EmptyState({ failed, onRetry }: { failed: boolean; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 min-h-[260px]">
      <p className="text-sm text-gray-600">No visitor data is available for this period.</p>
      {failed && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
}

function TrendSvgChart({ points }: { points: TrendPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 640;
  const height = 280;
  const pad = { top: 24, right: 16, bottom: 36, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxVisitors = Math.max(...points.map((p) => p.visitors), 0);
  const yMax = niceYMax(maxVisitors);
  const ticks = yTicks(yMax);

  const coords = points.map((p, i) => {
    const x = pad.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const y = pad.top + innerH - (p.visitors / yMax) * innerH;
    return { x, y, ...p };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(' ');

  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${(pad.top + innerH).toFixed(2)} L ${coords[0].x.toFixed(2)} ${(pad.top + innerH).toFixed(2)} Z`
      : '';

  const xLabelIndexes = (() => {
    if (points.length <= 7) return points.map((_, i) => i);
    if (points.length <= 30) {
      const step = Math.ceil(points.length / 6);
      const idxs = [0];
      for (let i = step; i < points.length - 1; i += step) idxs.push(i);
      idxs.push(points.length - 1);
      return Array.from(new Set(idxs));
    }
    const step = Math.ceil(points.length / 5);
    const idxs = [0];
    for (let i = step; i < points.length - 1; i += step) idxs.push(i);
    idxs.push(points.length - 1);
    return Array.from(new Set(idxs));
  })();

  const active = hoverIndex != null ? coords[hoverIndex] : null;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[260px] sm:h-[300px]"
        role="img"
        aria-label="Visitor trend chart"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {ticks.map((tick) => {
          const y = pad.top + innerH - (tick / yMax) * innerH;
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={pad.left + innerW}
                y1={y}
                y2={y}
                stroke="#f3f4f6"
                strokeWidth={1}
              />
              <text x={pad.left - 8} y={y + 3} textAnchor="end" className="fill-gray-400" fontSize={10}>
                {tick}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="#0ea5e9" fillOpacity={0.12} stroke="none" />
        <path d={linePath} fill="none" stroke="#0284c7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {coords.map((c, i) => (
          <g key={c.date}>
            <circle
              cx={c.x}
              cy={c.y}
              r={hoverIndex === i ? 4.5 : 3}
              fill="#fff"
              stroke="#0284c7"
              strokeWidth={2}
            />
            <rect
              x={c.x - Math.max(innerW / points.length / 2, 8)}
              y={pad.top}
              width={Math.max(innerW / points.length, 16)}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
            />
          </g>
        ))}

        {xLabelIndexes.map((i) => (
          <text
            key={`x-${points[i].date}`}
            x={coords[i].x}
            y={height - 10}
            textAnchor="middle"
            className="fill-gray-400"
            fontSize={10}
          >
            {points[i].label}
          </text>
        ))}

        {active && (
          <g>
            <line
              x1={active.x}
              x2={active.x}
              y1={pad.top}
              y2={pad.top + innerH}
              stroke="#94a3b8"
              strokeDasharray="3 3"
            />
            <rect
              x={Math.min(Math.max(active.x - 70, 4), width - 144)}
              y={Math.max(active.y - 48, 4)}
              width={140}
              height={40}
              rx={6}
              fill="#111827"
            />
            <text
              x={Math.min(Math.max(active.x - 70, 4), width - 144) + 70}
              y={Math.max(active.y - 48, 4) + 16}
              textAnchor="middle"
              fill="#fff"
              fontSize={10}
            >
              {active.fullDate}
            </text>
            <text
              x={Math.min(Math.max(active.x - 70, 4), width - 144) + 70}
              y={Math.max(active.y - 48, 4) + 30}
              textAnchor="middle"
              fill="#e5e7eb"
              fontSize={10}
            >
              {active.visitors.toLocaleString()} visitors
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function VisitorTrendChart({
  token,
  title = 'Visitor Trend',
  defaultDays = 7,
}: Props) {
  const [days, setDays] = useState<7 | 30 | 90>(defaultDays);
  const [points, setPoints] = useState<TrendPoint[]>([]);
  const [previousPoints, setPreviousPoints] = useState<TrendPoint[]>([]);
  const [uniqueVisitors, setUniqueVisitors] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTrend = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      // One request covering current + previous period for real comparison only.
      const [raw, nvr] = await Promise.all([
        analyticsApi.getVisitorsOverTime(token, days * 2),
        analyticsApi.getNewVsReturning(token, days).catch(() => null),
      ]);
      const normalized = normalizeVisitorTrend(raw);
      const current = normalized.slice(-days);
      const previous = normalized.slice(0, Math.max(0, normalized.length - days)).slice(-days);
      setPoints(current);
      setPreviousPoints(previous);
      const unique = nvr && typeof nvr.total === 'number' ? nvr.total : null;
      setUniqueVisitors(unique);
    } catch {
      setPoints([]);
      setPreviousPoints([]);
      setUniqueVisitors(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // Defer so loading state is not set synchronously inside the effect body.
      await Promise.resolve();
      if (cancelled || !token) return;
      await fetchTrend();
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [fetchTrend, token]);

  const summary = useMemo(
    () => summarizeVisitorTrend(points, previousPoints),
    [points, previousPoints]
  );

  const nonZeroDays = points.filter((p) => p.visitors > 0 || p.pageViews > 0).length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-600" />
          {title}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setDays(opt.days)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  days === opt.days
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={fetchTrend}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
            aria-label="Refresh visitor trend"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <ChartSkeleton />
      ) : error ? (
        <EmptyState failed onRetry={fetchTrend} />
      ) : points.length === 0 ? (
        <EmptyState failed={false} onRetry={fetchTrend} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                <Users className="w-3 h-3" /> Total visitors
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900 tabular-nums">
                {summary.totalVisitors.toLocaleString()}
              </p>
            </div>
            {uniqueVisitors != null ? (
              <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                <p className="text-[11px] text-gray-500">Unique visitors</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 tabular-nums">
                  {uniqueVisitors.toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                <p className="text-[11px] text-gray-500">Active days</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 tabular-nums">{nonZeroDays}</p>
              </div>
            )}
            {summary.hasPageViews ? (
              <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Page views
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900 tabular-nums">
                  {summary.totalPageViews.toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                <p className="text-[11px] text-gray-500">Days in range</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 tabular-nums">{points.length}</p>
              </div>
            )}
            {summary.changePercent != null ? (
              <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                <p className="text-[11px] text-gray-500">vs previous period</p>
                <p
                  className={`mt-1 text-lg font-semibold tabular-nums inline-flex items-center gap-1 ${
                    summary.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {summary.changePercent >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(summary.changePercent).toFixed(0)}%
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                <p className="text-[11px] text-gray-500">vs previous period</p>
                <p className="mt-1 text-sm text-gray-400">No comparison yet</p>
              </div>
            )}
          </div>

          {points.length === 1 ? (
            <SingleDayState point={points[0]} />
          ) : (
            <TrendSvgChart points={points} />
          )}
        </>
      )}
    </div>
  );
}
