'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, RefreshCw } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { downloadTextFile } from '@/components/admin/newsletter/campaign-status';
import { newsletterAdminApi } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';

type CampaignAnalytics = {
  campaignId: string;
  eligibleRecipients: number;
  accepted: number;
  delivered: number;
  failed: number;
  ambiguous: number;
  skipped: number;
  bounces: number;
  complaints: number;
  uniqueOpens: number;
  uniqueClicks: number;
  unsubscribes: number;
  openRate: number;
  clickRate: number;
  deliveryDataAvailable: boolean;
  notes?: {
    accepted?: string;
    delivered?: string;
    opens?: string;
  };
  recipientStatusBreakdown?: Array<{ status: string; count: number }>;
  timeZone?: string;
};

function localInputToIso(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function KpiCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">{value}</p>
      {hint && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default function CampaignAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [exporting, setExporting] = useState(false);

  const rangeParams = useCallback(() => {
    const from = localInputToIso(fromInput);
    const to = localInputToIso(toInput);
    const params: { from?: string; to?: string } = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return params;
  }, [fromInput, toInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await newsletterAdminApi.campaignAnalytics(id, rangeParams());
      setAnalytics(data as CampaignAnalytics);
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Failed to load analytics');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [id, rangeParams]);

  useEffect(() => {
    load();
  }, [load]);

  async function exportCsv() {
    setExporting(true);
    try {
      const csv = await newsletterAdminApi.campaignAnalyticsCsv(id, rangeParams());
      downloadTextFile(`campaign-${id}-analytics.csv`, csv);
      appToast.success('Analytics CSV downloaded');
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  const a = analytics;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader
        title="Campaign analytics"
        description={a?.timeZone ? `Metrics in ${a.timeZone}` : 'Delivery and engagement'}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="icon" onClick={load} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={exporting || !a} onClick={exportCsv}>
              <Download className="mr-1 size-4" />
              Download CSV
            </Button>
            <Link href={`/admin/newsletters/campaigns/${id}`} className="text-sm text-[#003d7a] underline self-center">
              ← Campaign editor
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <label className="text-xs text-gray-500">Events from</label>
          <input
            type="datetime-local"
            className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={fromInput}
            onChange={(e) => setFromInput(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Events to</label>
          <input
            type="datetime-local"
            className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={toInput}
            onChange={(e) => setToInput(e.target.value)}
          />
        </div>
        <Button type="button" size="sm" variant="outline" onClick={load}>
          Apply range
        </Button>
      </div>

      {loading && !a && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {a && (
        <>
          {!a.deliveryDataAvailable && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-medium">Limited delivery data</p>
              <p className="mt-1 text-xs">{a.notes?.delivered || 'Confirmed delivery data is unavailable for this campaign.'}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Eligible" value={a.eligibleRecipients} />
            <KpiCard label="Accepted" value={a.accepted} hint={a.notes?.accepted} />
            <KpiCard label="Delivered" value={a.delivered} hint={a.notes?.delivered} />
            <KpiCard label="Failed" value={a.failed} />
            <KpiCard label="Unique opens" value={a.uniqueOpens} hint={a.notes?.opens} />
            <KpiCard label="Open rate" value={`${a.openRate}%`} />
            <KpiCard label="Unique clicks" value={a.uniqueClicks} />
            <KpiCard label="Click rate" value={`${a.clickRate}%`} />
            <KpiCard label="Bounces" value={a.bounces} />
            <KpiCard label="Complaints" value={a.complaints} />
            <KpiCard label="Unsubscribes" value={a.unsubscribes} />
            <KpiCard label="Skipped" value={a.skipped} />
          </div>

          {a.recipientStatusBreakdown && a.recipientStatusBreakdown.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Recipient status</th>
                    <th className="px-4 py-3 text-right">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {a.recipientStatusBreakdown.map((row) => (
                    <tr key={row.status} className="border-t border-gray-100">
                      <td className="px-4 py-2 text-gray-800">{row.status}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}