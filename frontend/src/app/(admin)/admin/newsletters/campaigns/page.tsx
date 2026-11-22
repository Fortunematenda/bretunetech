'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Copy, Plus } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { newsletterAdminApi, type Campaign } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const c = await newsletterAdminApi.listCampaigns();
      setCampaigns(c.campaigns || []);
    } catch (e: any) {
      appToast.error(e.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createBlank() {
    try {
      const c = await newsletterAdminApi.createCampaign({
        title: 'Untitled campaign',
        subject: 'BretuneTech update',
        audience: { consentOnly: true, activity: 'all' },
        blocks: [
          { type: 'hero', headline: 'BretuneTech update', subhead: 'Enterprise technology for South Africa' },
          { type: 'cta', label: 'Explore Products & Services', href: '/', sublabel: 'www.bretunetech.com' },
        ],
      });
      window.location.href = `/admin/newsletters/campaigns/${c.id}`;
    } catch (e: any) {
      appToast.error(e.message || 'Could not create campaign');
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader
        title="Campaigns"
        description="One-off and scheduled emails. Open a row to edit the layout."
        actions={<Button size="sm" onClick={createBlank}><Plus className="mr-1 size-4" /> New campaign</Button>}
      />
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
                  <Link href={`/admin/newsletters/campaigns/${c.id}`} className="text-[#003d7a] hover:underline">{c.title}</Link>
                  <div className="text-xs text-gray-500">{c.subject}</div>
                </td>
                <td className="px-4 py-3">{c.status}</td>
                <td className="px-4 py-3">{c.monthKey || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" title="Duplicate" onClick={() => newsletterAdminApi.duplicate(c.id).then(load)}>
                    <Copy className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && campaigns.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No campaigns yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}