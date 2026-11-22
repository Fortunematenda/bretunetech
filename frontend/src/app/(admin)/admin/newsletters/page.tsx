'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Mail, MousePointerClick, Send } from 'lucide-react';
import AdminKpiCard from '@/components/admin/AdminKpiCard';
import { Button } from '@/components/ui/button';
import { HOLIDAY_NEWSLETTER_BLOCKS, newsletterAdminApi, type Campaign } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';

export default function NewslettersAdminPage() {
  const [dash, setDash] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([newsletterAdminApi.dashboard(), newsletterAdminApi.listCampaigns()]);
      setDash(d);
      setCampaigns(c.campaigns || []);
    } catch (e: any) {
      appToast.error(e.message || 'Failed to load newsletters');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createDraft() {
    const body = {
      title: 'December 2026 Newsletter',
      subject: 'Keep your home and business connected this holiday season',
      previewText: 'CCTV, Wi-Fi and networking from BretuneTech.',
      audience: { consentOnly: true, activity: 'all' as const },
      blocks: HOLIDAY_NEWSLETTER_BLOCKS,
      monthKey: '2026-12',
    };
    try {
      const c = await newsletterAdminApi.createCampaign(body);
      if (c?.id) window.location.href = `/admin/newsletters/campaigns/${c.id}`;
      else throw new Error(c?.error || 'Could not create draft');
    } catch (e: any) {
      try {
        const { monthKey: _month, ...rest } = body;
        const c = await newsletterAdminApi.createCampaign(rest);
        if (c?.id) window.location.href = `/admin/newsletters/campaigns/${c.id}`;
        else throw new Error(c?.error || e.message);
      } catch (err: any) {
        appToast.error(err.message || 'Could not create draft');
      }
    }
  }

  const upcoming = campaigns.filter((c) => c.status === 'DRAFT' || c.status === 'SCHEDULED' || c.status === 'PENDING_APPROVAL');
  const subscribers = dash?.subscribers?.active;

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Newsletter Manager</h1>
          <p className="text-sm text-gray-500">BretuneTech Admin / Marketing</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${dash?.sendingEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
          {dash?.sendingEnabled ? 'Sending on' : 'Sending off'}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpiCard label="Subscribers" value={subscribers == null ? '—' : Number(subscribers).toLocaleString('en-ZA')} icon={Mail} tone="primary" loading={loading} />
        <AdminKpiCard label="Campaigns sent" value={dash?.campaigns?.sent ?? 0} icon={Send} tone="emerald" loading={loading} />
        <AdminKpiCard label="Open rate" value={dash ? `${dash.engagement.openRate}%` : '—'} icon={Mail} tone="sky" loading={loading} />
        <AdminKpiCard label="Click rate" value={dash ? `${dash.engagement.clickRate}%` : '—'} icon={MousePointerClick} tone="primary" loading={loading} />
      </div>
      <p className="text-xs text-gray-400">Live figures from your database. Open rate is approximate when mail clients block images.</p>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming newsletters</h2>
          <span className="rounded-full border px-2 py-0.5 text-xs text-gray-500">Your drafts</span>
        </div>
        {upcoming.length === 0 && !loading && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4">
            <div>
              <p className="font-medium text-gray-900">December 2026 Newsletter</p>
              <p className="text-sm text-gray-500">CCTV • Holiday Security • Wi-Fi</p>
            </div>
            <Button onClick={createDraft}>Create draft</Button>
          </div>
        )}
        {upcoming.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4">
            <div>
              <p className="font-medium text-gray-900">{c.title}</p>
              <p className="text-sm text-gray-500">{c.subject}</p>
              {c.monthKey && (
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="size-3" /> {c.monthKey}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-sky-700">{c.status}</span>
              <Link href={`/admin/newsletters/campaigns/${c.id}`}>
                <Button>Open draft</Button>
              </Link>
            </div>
          </div>
        ))}
        {upcoming.length > 0 && (
          <Button variant="outline" onClick={createDraft}>Create another draft</Button>
        )}
      </section>
    </div>
  );
}