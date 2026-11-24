'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Ban } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { CampaignStatusBadge } from '@/components/admin/newsletter/campaign-status';
import { Button } from '@/components/ui/button';
import { useAdminConfirm } from '@/components/admin/useAdminConfirm';
import { newsletterAdminApi, type Campaign } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';
import { cn } from '@/lib/utils';

const TZ = 'Africa/Johannesburg';
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function partsInTz(iso: string) {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [y, m, day] = fmt.format(d).split('-').map(Number);
  return { year: y, month: m, day };
}

function campaignInstant(c: Campaign): string | null {
  return c.scheduledAt || c.sentAt || c.createdAt || null;
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat('en-ZA', { timeZone: TZ, month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(year, month - 1, 15)),
  );
}

function buildMonthGrid(year: number, month: number) {
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const startPad = (firstDow + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<{ day: number | null; key: string }> = [];
  for (let i = 0; i < startPad; i++) cells.push({ day: null, key: `pad-${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, key: `${year}-${month}-${d}` });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, key: `tail-${cells.length}` });
  return cells;
}

export default function NewsletterCalendarPage() {
  const { confirm, dialog } = useAdminConfirm();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const now = useMemo(() => partsInTz(new Date().toISOString()), []);
  const [year, setYear] = useState(now.year);
  const [month, setMonth] = useState(now.month);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await newsletterAdminApi.listCampaigns();
      setCampaigns(res.campaigns || []);
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byDay = useMemo(() => {
    const map = new Map<string, Campaign[]>();
    for (const c of campaigns) {
      const iso = campaignInstant(c);
      if (!iso) continue;
      const p = partsInTz(iso);
      if (p.year !== year || p.month !== month) continue;
      const key = `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => (campaignInstant(a) || '').localeCompare(campaignInstant(b) || ''));
    }
    return map;
  }, [campaigns, year, month]);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  function prevMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else setMonth((m) => m + 1);
  }

  async function cancelScheduled(c: Campaign, e: { preventDefault: () => void; stopPropagation: () => void }) {
    e.preventDefault();
    e.stopPropagation();
    if (!(await confirm({
      title: 'Cancel scheduled send',
      description: `Cancel “${c.title}”? It will return to draft and will not send at the scheduled time.`,
      confirmLabel: 'Cancel send',
      variant: 'danger',
    }))) return;
    try {
      await newsletterAdminApi.cancelCampaign(c.id);
      appToast.success('Schedule cancelled');
      load();
    } catch (err: unknown) {
      appToast.error(err instanceof Error ? err.message : 'Could not cancel');
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader
        title="Campaign calendar"
        description="Dates use Africa/Johannesburg (SAST). Automations only create drafts — they do not send until you approve."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Button type="button" variant="outline" size="sm" onClick={prevMonth} aria-label="Previous month">
          <ChevronLeft className="size-4" />
        </Button>
        <p className="text-lg font-semibold text-gray-900">{monthLabel(year, month)}</p>
        <Button type="button" variant="outline" size="sm" onClick={nextMonth} aria-label="Next month">
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-1 py-2">
              {d}
            </div>
          ))}
        </div>
        {loading ? (
          <div className="grid min-h-[320px] animate-pulse grid-cols-7 gap-px bg-gray-100 p-px">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="min-h-24 bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-gray-100">
            {grid.map((cell) => {
              const dayKey =
                cell.day != null
                  ? `${year}-${String(month).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`
                  : null;
              const items = dayKey ? byDay.get(dayKey) ?? [] : [];
              const isToday =
                cell.day != null && year === now.year && month === now.month && cell.day === now.day;
              return (
                <div
                  key={cell.key}
                  className={cn(
                    'min-h-28 bg-white p-1.5 sm:p-2',
                    cell.day == null && 'bg-gray-50/80',
                  )}
                >
                  {cell.day != null && (
                    <>
                      <span
                        className={cn(
                          'mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                          isToday ? 'bg-[#003d7a] text-white' : 'text-gray-700',
                        )}
                      >
                        {cell.day}
                      </span>
                      <ul className="space-y-1">
                        {items.map((c) => (
                          <li key={c.id}>
                            <div className="rounded-md border border-gray-100 bg-gray-50/80 px-1.5 py-1 transition hover:border-[#003d7a]/20 hover:bg-sky-50/50">
                              <Link
                                href={`/admin/newsletters/campaigns/${c.id}`}
                                className="line-clamp-2 block text-[10px] font-medium leading-tight text-gray-900 hover:text-[#003d7a] sm:text-xs"
                              >
                                {c.title}
                              </Link>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1">
                                <CampaignStatusBadge status={c.status} />
                                {c.status === 'SCHEDULED' && (
                                  <button
                                    type="button"
                                    title="Cancel schedule"
                                    className="inline-flex rounded p-0.5 text-rose-600 hover:bg-rose-50"
                                    onClick={(e) => cancelScheduled(c, e)}
                                  >
                                    <Ban className="size-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Campaigns are placed by scheduled time, sent time, or created time (first available). Click a row to open the
        campaign editor.
      </p>
      {dialog}
    </div>
  );
}