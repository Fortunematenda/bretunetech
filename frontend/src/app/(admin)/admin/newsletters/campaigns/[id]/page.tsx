'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, Copy, Lock } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { CampaignStatusBadge } from '@/components/admin/newsletter/campaign-status';
import NewsletterContentEditor, { NewsletterEmailPreview } from '@/components/admin/newsletter/NewsletterContentEditor';
import { newsletterAdminApi, type Campaign, type EmailBlock } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';
import { useAdminConfirm } from '@/components/admin/useAdminConfirm';

type AudiencePreview = {
  eligibleCount: number;
  legacyExcluded: number;
  suppressedCount: number;
  timeZone: string;
};

const CANCELABLE = new Set(['APPROVED', 'SCHEDULED', 'SENDING', 'PENDING_APPROVAL', 'DRAFT']);

export default function CampaignEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { confirm, dialog } = useAdminConfirm();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [audience, setAudience] = useState<AudiencePreview | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [preview, setPreview] = useState<'desktop' | 'mobile'>('desktop');
  const [scheduleInput, setScheduleInput] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const load = useCallback(async () => {
    const c = await newsletterAdminApi.getCampaign(id);
    setCampaign(c);
    if (c.scheduledAtLocal) {
      const m = c.scheduledAtLocal.match(/(\d{4})[/-](\d{2})[/-](\d{2}).*?(\d{2}):(\d{2})/);
      if (m) setScheduleInput(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`);
    }
  }, [id]);

  const loadAudience = useCallback(async () => {
    try {
      const data = await newsletterAdminApi.audiencePreview(id);
      setAudience(data);
    } catch {
      setAudience(null);
    }
  }, [id]);

  useEffect(() => {
    load().catch((e) => appToast.error(e instanceof Error ? e.message : 'Failed to load campaign'));
    loadAudience();
  }, [load, loadAudience]);

  const isSent = campaign?.status === 'SENT';
  const isReadOnly = isSent;

  async function save() {
    if (!campaign || isReadOnly) return;
    try {
      await newsletterAdminApi.updateCampaign(id, {
        title: campaign.title,
        subject: campaign.subject,
        previewText: campaign.previewText,
        audience: campaign.audience,
        blocks: campaign.blocks,
      });
      appToast.success('Saved');
      loadAudience();
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Save failed');
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
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Could not delete campaign');
      setDeleting(false);
    }
  }

  async function submitForApproval() {
    try {
      await newsletterAdminApi.submit(id);
      await load();
      appToast.success('Submitted for approval');
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Submit failed');
    }
  }

  async function approve() {
    const count = audience?.eligibleCount;
    const extra =
      audience && audience.legacyExcluded > 0
        ? ` ${audience.legacyExcluded} legacy auto-enrolled contacts are excluded until they re-consent.`
        : '';
    if (!(await confirm({
      title: 'Approve campaign',
      description: `Approve this send for ${count != null ? count : 'the matched'} eligible recipients?${extra}`,
      confirmLabel: 'Approve',
      variant: 'default',
    }))) return;
    try {
      await newsletterAdminApi.approve(id);
      await load();
      appToast.success('Campaign approved');
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Approve failed');
    }
  }

  async function startSend() {
    const count = audience?.eligibleCount;
    const extra =
      audience && audience.legacyExcluded > 0
        ? ` ${audience.legacyExcluded} legacy contacts are excluded.`
        : '';
    if (!(await confirm({
      title: 'Start send',
      description: `Queue this campaign to ${count != null ? count : 'eligible'} subscribers now?${extra}`,
      confirmLabel: 'Start send',
      variant: 'default',
    }))) return;
    try {
      await newsletterAdminApi.start(id);
      appToast.success('Send queued');
      load();
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Start failed');
    }
  }

  async function cancelCampaign() {
    if (!(await confirm({
      title: 'Cancel campaign',
      description: 'Cancel scheduling and skip any unsent queue items for this campaign?',
      confirmLabel: 'Cancel campaign',
      variant: 'danger',
    }))) return;
    try {
      await newsletterAdminApi.cancelCampaign(id);
      appToast.success('Campaign cancelled');
      load();
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Cancel failed');
    }
  }

  async function schedule() {
    if (!scheduleInput.trim()) {
      appToast.error('Enter a Johannesburg local date and time');
      return;
    }
    setScheduling(true);
    try {
      await newsletterAdminApi.scheduleCampaign(id, scheduleInput.trim());
      appToast.success('Campaign scheduled');
      load();
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Schedule failed');
    } finally {
      setScheduling(false);
    }
  }

  async function duplicateCampaign() {
    try {
      const copy = await newsletterAdminApi.duplicate(id);
      const newId = copy && typeof copy === 'object' && 'id' in copy ? (copy as Campaign).id : null;
      if (newId) {
        appToast.success('Draft duplicate created');
        router.push(`/admin/newsletters/campaigns/${newId}`);
      }
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Duplicate failed');
    }
  }

  if (!campaign) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  const blocks = (campaign.blocks || []) as EmailBlock[];
  const canSchedule = campaign.status === 'APPROVED' || campaign.status === 'SCHEDULED';
  const showCancel = campaign.status && CANCELABLE.has(campaign.status) && campaign.status !== 'DRAFT';

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="space-y-2">
        <AdminPageHeader
          title={campaign.title}
          description={campaign.subject}
          actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/newsletters/campaigns" className="text-sm text-[#003d7a] underline self-center">
              ← Campaigns
            </Link>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/admin/newsletters/campaigns/${id}/analytics`}>
                <BarChart3 className="mr-1 size-4" />
                Analytics
              </Link>
            </Button>
            {isSent ? (
              <Button size="sm" onClick={duplicateCampaign}>
                <Copy className="mr-1 size-4" />
                Duplicate
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={save}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={submitForApproval}>
                  Submit for approval
                </Button>
                <Button size="sm" variant="outline" onClick={approve}>
                  Approve
                </Button>
                <Button size="sm" onClick={startSend}>
                  Start send
                </Button>
                {showCancel && (
                  <Button size="sm" variant="outline" className="text-amber-800" onClick={cancelCampaign}>
                    Cancel
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-700"
                  disabled={deleting || campaign.status === 'SENDING'}
                  onClick={remove}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </Button>
              </>
            )}
          </div>
        }
        />
        <div className="flex flex-wrap items-center gap-2">
          <CampaignStatusBadge status={campaign.status} />
          {campaign.scheduledAtLocal && (
            <span className="text-xs text-gray-500">Scheduled {campaign.scheduledAtLocal}</span>
          )}
        </div>
      </div>

      {isSent && (
        <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <Lock className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">This campaign was sent and is read-only.</p>
            <p className="mt-1 text-xs text-emerald-800">
              View analytics or duplicate this layout into a new draft to send again.
            </p>
          </div>
        </div>
      )}

      {audience && !isSent && (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
          <p className="font-medium text-gray-900">Audience preview</p>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-600">
            <li>
              <span className="font-semibold text-gray-900">{audience.eligibleCount}</span> eligible recipients
            </li>
            <li>
              <span className="font-semibold text-gray-900">{audience.legacyExcluded}</span> legacy excluded (needs re-consent)
            </li>
            <li>
              <span className="font-semibold text-gray-900">{audience.suppressedCount}</span> suppressed / bounced
            </li>
            <li className="text-gray-400">Times shown in {audience.timeZone}</li>
          </ul>
        </div>
      )}

      {canSchedule && !isSent && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
          <p className="text-sm font-medium text-gray-900">Schedule send (Johannesburg local)</p>
          <p className="text-xs text-gray-500">
            Use a local datetime without timezone, e.g. 2026-12-01T09:00 — interpreted as Africa/Johannesburg.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="datetime-local"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              value={scheduleInput}
              onChange={(e) => setScheduleInput(e.target.value)}
            />
            <Button size="sm" variant="outline" disabled={scheduling} onClick={schedule}>
              {scheduling ? 'Scheduling…' : 'Schedule'}
            </Button>
          </div>
          {campaign.scheduledAtLocal && (
            <p className="text-xs text-gray-500">Currently scheduled: {campaign.scheduledAtLocal}</p>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`space-y-4 ${isReadOnly ? 'pointer-events-none opacity-95' : ''}`}>
          <NewsletterContentEditor
            value={{
              title: campaign.title,
              subject: campaign.subject,
              previewText: campaign.previewText || '',
              blocks,
            }}
            onChange={(v) => {
              if (isReadOnly) return;
              setCampaign({
                ...campaign,
                title: v.title,
                subject: v.subject,
                previewText: v.previewText,
                blocks: v.blocks,
              });
            }}
          />
          {!isSent && (
            <div className="flex gap-2 pointer-events-auto">
              <input
                type="email"
                placeholder="Test email"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#003d7a] focus:outline-none"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <Button
                size="sm"
                onClick={async () => {
                  if (!testEmail || !campaign) return;
                  try {
                    await newsletterAdminApi.updateCampaign(id, {
                      title: campaign.title,
                      subject: campaign.subject,
                      previewText: campaign.previewText,
                      audience: campaign.audience,
                      blocks: campaign.blocks,
                    });
                    await newsletterAdminApi.testSend(id, testEmail);
                    appToast.success('Saved, then sent the test from this draft');
                  } catch (e: unknown) {
                    appToast.error(e instanceof Error ? e.message : 'Test email failed');
                  }
                }}
              >
                Send test
              </Button>
            </div>
          )}
        </div>
        <NewsletterEmailPreview blocks={blocks} preview={preview} onPreviewChange={setPreview} />
      </div>
      {dialog}
    </div>
  );
}