'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminKpiCard from '@/components/admin/AdminKpiCard';
import { CampaignStatusBadge } from '@/components/admin/newsletter/campaign-status';
import { Button } from '@/components/ui/button';
import { newsletterAdminApi, type Campaign, type NewsletterDashboard } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';

export default function NewsletterAnalyticsPage() {
  const [dash, setDash] = useState<NewsletterDashboard | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [d, c] = await Promise.all([
          newsletterAdminApi.dashboard(),
          newsletterAdminApi.listCampaigns(),
        ]);
        setDash(d);
        setCampaigns((c.campaigns || []).filter((row) => ['SENT', 'SENDING', 'SCHEDULED'].includes(row.status)));
      } catch (e: any) {
        appToast.error(e.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader
        title="Analytics"
        description="Global delivery and engagement from stored events. Open a campaign for a detailed report."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpiCard label="Accepted (provider)" value={dash?.delivery?.accepted ?? 0} tone="primary" loading={loading} />
        <AdminKpiCard label="Confirmed delivered" value={dash?.delivery?.delivered ?? 0} tone="emerald" loading={loading} />
        <AdminKpiCard label="Unique opens" value={dash?.engagement?.opens ?? 0} tone="sky" loading={loading} />
        <AdminKpiCard label="Unique clicks" value={dash?.engagement?.clicks ?? 0} tone="primary" loading={loading} />
        <AdminKpiCard label="Failed" value={dash?.delivery?.failed ?? 0} tone="rose" loading={loading} />
        <AdminKpiCard label="Ambiguous" value={dash?.delivery?.ambiguous ?? 0} tone="rose" loading={loading} />
        <AdminKpiCard label="Bounces" value={dash?.delivery?.bounces ?? 0} tone="rose" loading={loading} />
        <AdminKpiCard label="Complaints" value={dash?.delivery?.complaints ?? 0} tone="rose" loading={loading} />
      </div>
      <p className="text-sm text-gray-500">{dash?.delivery?.acceptedNote}</p>
      <p className="text-sm text-gray-500">{dash?.delivery?.deliveredNote}</p>
      <p className="text-sm text-gray-500">{dash?.engagement?.openRateNote}</p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Campaign reports</h2>
        {campaigns.length === 0 && !loading ? (
          <p className="rounded-xl border border-dashed bg-gray-50 px-4 py-8 text-sm text-gray-500">
            No scheduled or sent campaigns yet. Reports appear after a campaign is scheduled or sent.
          </p>
        ) : (
          <div className="divide-y rounded-xl border bg-white">
            {campaigns.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-500">{c.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CampaignStatusBadge status={c.status} />
                  <Link href={`/admin/newsletters/campaigns/${c.id}/analytics`}>
                    <Button type="button" size="sm" variant="outline">
                      <BarChart3 className="mr-1 size-3.5" />
                      Report
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
