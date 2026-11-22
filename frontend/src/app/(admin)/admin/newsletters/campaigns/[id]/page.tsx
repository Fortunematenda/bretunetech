'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import NewsletterContentEditor, { NewsletterEmailPreview } from '@/components/admin/newsletter/NewsletterContentEditor';
import { newsletterAdminApi, type Campaign, type EmailBlock } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';
import { useAdminConfirm } from '@/components/admin/useAdminConfirm';

export default function CampaignEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { confirm, dialog } = useAdminConfirm();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);
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

  async function remove() {
    if (!campaign) return;
    if (campaign.status === 'SENDING') {
      appToast.error('This campaign is still sending. Delete it after sending finishes.');
      return;
    }
    if (!(await confirm({
      title: 'Delete campaign',
      description: `Delete “${campaign.title}”? Subscribers stay on the list. Send history for this campaign is removed.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    }))) return;
    setDeleting(true);
    try {
      await newsletterAdminApi.deleteCampaign(id);
      appToast.success('Campaign deleted');
      router.push('/admin/newsletters/campaigns');
    } catch (e: any) {
      appToast.error(e.message || 'Could not delete campaign');
      setDeleting(false);
    }
  }

  if (!campaign) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  const blocks = (campaign.blocks || []) as EmailBlock[];

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
            <Button size="sm" variant="outline" className="text-red-700" disabled={deleting || campaign.status === 'SENDING'} onClick={remove}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <NewsletterContentEditor
            value={{
              title: campaign.title,
              subject: campaign.subject,
              previewText: campaign.previewText || '',
              blocks,
            }}
            onChange={(v) =>
              setCampaign({
                ...campaign,
                title: v.title,
                subject: v.subject,
                previewText: v.previewText,
                blocks: v.blocks,
              })
            }
          />
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Test email"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#003d7a] focus:outline-none"
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
        <NewsletterEmailPreview blocks={blocks} preview={preview} onPreviewChange={setPreview} />
      </div>
      {dialog}
    </div>
  );
}