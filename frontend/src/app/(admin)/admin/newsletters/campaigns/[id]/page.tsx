'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { newsletterAdminApi, type Campaign, type EmailBlock } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';

export default function CampaignEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [preview, setPreview] = useState<'desktop' | 'mobile'>('desktop');

  const load = useCallback(async () => {
    const c = await newsletterAdminApi.getCampaign(id);
    setCampaign(c);
  }, [id]);

  useEffect(() => {
    load().catch((e) => appToast.error(e.message));
  }, [load]);

  async function save() {
    if (!campaign) return;
    try {
      await newsletterAdminApi.updateCampaign(id, {
        title: campaign.title,
        subject: campaign.subject,
        previewText: campaign.previewText,
        audience: campaign.audience,
        blocks: campaign.blocks,
      });
      appToast.success('Saved');
    } catch (e: any) {
      appToast.error(e.message);
    }
  }

  if (!campaign) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  const blocks = campaign.blocks || [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader
        title={campaign.title}
        description={`Status: ${campaign.status}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/newsletters" className="text-sm text-[#003d7a] underline">
              ← Back
            </Link>
            <Button size="sm" variant="outline" onClick={save}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => newsletterAdminApi.submit(id).then(load)}>
              Submit for approval
            </Button>
            <Button size="sm" variant="outline" onClick={() => newsletterAdminApi.approve(id).then(load)}>
              Approve
            </Button>
            <Button size="sm" onClick={() => newsletterAdminApi.start(id).then(() => appToast.success('Queued'))}>
              Start send
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-medium">Subject</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={campaign.subject}
            onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
          />
          <label className="block text-sm font-medium">Preview text</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={campaign.previewText || ''}
            onChange={(e) => setCampaign({ ...campaign, previewText: e.target.value })}
          />
          <label className="block text-sm font-medium">Content blocks (JSON)</label>
          <textarea
            className="min-h-[280px] w-full rounded-lg border p-3 font-mono text-xs"
            value={JSON.stringify(blocks, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value) as EmailBlock[];
                setCampaign({ ...campaign, blocks: parsed });
              } catch {
                /* keep typing */
              }
            }}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setCampaign({
                  ...campaign,
                  blocks: [...blocks, { type: 'category', categorySlug: 'networking', limit: 4 }],
                })
              }
            >
              + Category block
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setCampaign({
                  ...campaign,
                  blocks: [...blocks, { type: 'cta', label: 'Shop now', href: '/products' }],
                })
              }
            >
              + CTA
            </Button>
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Test email"
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <Button
              size="sm"
              onClick={() =>
                testEmail &&
                newsletterAdminApi.testSend(id, testEmail).then(() => appToast.success('Test sent (or SMTP accepted)'))
              }
            >
              Send test
            </Button>
          </div>
        </div>

        <div>
          <div className="mb-2 flex gap-2">
            <Button size="sm" variant={preview === 'desktop' ? 'default' : 'outline'} onClick={() => setPreview('desktop')}>
              Desktop
            </Button>
            <Button size="sm" variant={preview === 'mobile' ? 'default' : 'outline'} onClick={() => setPreview('mobile')}>
              Mobile
            </Button>
          </div>
          <div
            className={`mx-auto overflow-hidden rounded-xl border bg-slate-100 p-4 ${preview === 'mobile' ? 'max-w-[390px]' : 'max-w-full'}`}
          >
            <div className="rounded-lg bg-white p-4 shadow">
              <div className="mb-2 text-center text-[#003d7a] font-bold">BretuneTech</div>
              {blocks.map((b, i) => (
                <div key={i} className="mb-3 text-sm text-gray-700">
                  {b.type === 'hero' && (
                    <div className="rounded-lg bg-[#003d7a] p-4 text-center text-white">
                      <div className="font-semibold">{b.headline}</div>
                      {b.subhead && <div className="text-xs opacity-90">{b.subhead}</div>}
                    </div>
                  )}
                  {b.type === 'richtext' && <div dangerouslySetInnerHTML={{ __html: b.html }} />}
                  {b.type === 'category' && <p>Products from category: {b.categorySlug}</p>}
                  {b.type === 'cta' && (
                    <div className="text-center">
                      <span className="inline-block rounded bg-sky-500 px-4 py-2 text-white">{b.label}</span>
                    </div>
                  )}
                </div>
              ))}
              <p className="mt-4 text-center text-[10px] text-gray-400">Unsubscribe link in sent emails</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}