'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Plus, RefreshCw, Copy, LayoutTemplate, Pencil } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminKpiCard from '@/components/admin/AdminKpiCard';
import { Button } from '@/components/ui/button';
import { newsletterAdminApi, type Campaign, type NewsletterTemplate } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';

export default function NewslettersAdminPage() {
  const [dash, setDash] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, c, t] = await Promise.all([
        newsletterAdminApi.dashboard(),
        newsletterAdminApi.listCampaigns(),
        newsletterAdminApi.listTemplates(),
      ]);
      setDash(d);
      setCampaigns(c.campaigns || []);
      setTemplates(t.templates || []);
    } catch (e: any) {
      appToast.error(e.message || 'Failed to load newsletters');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function newCampaign() {
    try {
      const c = await newsletterAdminApi.createCampaign({
        title: 'Untitled campaign',
        subject: 'BretuneTech update',
        audience: { consentOnly: true, activity: 'all' },
        blocks: [
          { type: 'hero', headline: 'BretuneTech', subhead: 'Enterprise technology for South Africa' },
          { type: 'richtext', html: '<p>Edit your message here.</p>' },
          { type: 'cta', label: 'Shop now', href: '/products' },
        ],
      });
      window.location.href = `/admin/newsletters/campaigns/${c.id}`;
    } catch (e: any) {
      appToast.error(e.message || 'Could not create campaign');
    }
  }

  async function useTemplate(templateId: string, title?: string) {
    try {
      const c = await newsletterAdminApi.createCampaignFromTemplate(templateId, title ? { title } : undefined);
      window.location.href = `/admin/newsletters/campaigns/${c.id}`;
    } catch (e: any) {
      appToast.error(e.message || 'Could not create campaign from template');
    }
  }

  async function duplicate(id: string) {
    try {
      await newsletterAdminApi.duplicate(id);
      appToast.success('Campaign duplicated');
      load();
    } catch (e: any) {
      appToast.error(e.message || 'Duplicate failed');
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader
        title="Newsletters"
        description="Campaigns, subscribers and delivery metrics from live database events only."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className="mr-1 size-4" /> Refresh
            </Button>
            <Button size="sm" onClick={newCampaign}>
              <Plus className="mr-1 size-4" /> New campaign
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpiCard label="Active subscribers" value={dash?.subscribers?.active ?? '—'} icon={Mail} tone="primary" loading={loading} />
        <AdminKpiCard label="Delivered" value={dash?.delivery?.delivered ?? 0} tone="emerald" loading={loading} />
        <AdminKpiCard label="Open rate" value={dash ? `${dash.engagement.openRate}%` : '—'} sub="Approximate" tone="sky" loading={loading} />
        <AdminKpiCard label="Bounces" value={dash?.delivery?.bounces ?? 0} tone="rose" loading={loading} />
      </div>

      {dash && !dash.sendingEnabled && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Bulk sending is disabled until <code className="text-xs">NEWSLETTER_SENDING_ENABLED=true</code>. See docs/NEWSLETTER_SETUP.md.
        </p>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <LayoutTemplate className="size-4 text-[#003d7a]" />
          Templates
        </div>
        <p className="text-sm text-gray-600">
          Starter layouts you can edit and reuse. Creating a campaign copies the template — later template edits do not change existing campaigns.
        </p>
        {templates.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
            No templates yet. On the server run{' '}
            <code className="text-xs">cd backend && npm run newsletter:seed-templates</code>.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((t) => (
              <div key={t.id} className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="font-medium text-gray-900">{t.name}</h3>
                <p className="mt-1 flex-1 text-xs text-gray-500">{t.description || t.subject}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/admin/newsletters/templates/${t.id}`}>
                    <Button type="button" size="sm" variant="outline">
                      <Pencil className="mr-1 size-3.5" /> Edit
                    </Button>
                  </Link>
                  <Button type="button" size="sm" onClick={() => useTemplate(t.id, t.title)}>
                    Use for campaign
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/newsletters/campaigns/${c.id}`} className="text-[#003d7a] hover:underline">
                    {c.title}
                  </Link>
                  <div className="text-xs text-gray-500">{c.subject}</div>
                </td>
                <td className="px-4 py-3">{c.status}</td>
                <td className="px-4 py-3">{c.monthKey || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => duplicate(c.id)} title="Duplicate">
                    <Copy className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && campaigns.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No campaigns yet. Pick a template above, run <code>npm run newsletter:seed-december</code>, or create a blank campaign.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}