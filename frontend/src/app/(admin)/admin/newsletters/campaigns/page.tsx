'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Copy, Plus, RefreshCw, Search, Trash2, XCircle } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CampaignStatusBadge } from '@/components/admin/newsletter/campaign-status';
import { newsletterAdminApi, type Campaign } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';
import { useAdminConfirm } from '@/components/admin/useAdminConfirm';

const CANCELABLE = new Set(['APPROVED', 'SCHEDULED', 'SENDING', 'PENDING_APPROVAL']);

const STATUS_FILTER = [
  'all',
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'SCHEDULED',
  'SENDING',
  'SENT',
  'CANCELLED',
  'FAILED',
] as const;

export default function CampaignsPage() {
  const { confirm, dialog } = useAdminConfirm();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const c = await newsletterAdminApi.listCampaigns();
      setCampaigns(c.campaigns || []);
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    });
  }, [campaigns, search, statusFilter]);

  async function remove(c: Campaign) {
    if (c.status === 'SENDING') {
      appToast.error('This campaign is still sending.');
      return;
    }
    if (!(await confirm({
      title: 'Delete campaign',
      description: `Delete “${c.title}”? Subscribers stay on the list.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    }))) return;
    try {
      await newsletterAdminApi.deleteCampaign(c.id);
      appToast.success('Campaign deleted');
      load();
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Could not delete campaign');
    }
  }

  async function cancel(c: Campaign) {
    if (!CANCELABLE.has(c.status)) return;
    if (!(await confirm({
      title: 'Cancel campaign',
      description: `Stop “${c.title}”? Scheduled or in-flight sends for this campaign will be skipped.`,
      confirmLabel: 'Cancel campaign',
      variant: 'danger',
    }))) return;
    try {
      await newsletterAdminApi.cancelCampaign(c.id);
      appToast.success('Campaign cancelled');
      load();
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Could not cancel campaign');
    }
  }

  async function duplicate(c: Campaign) {
    try {
      const copy = await newsletterAdminApi.duplicate(c.id);
      appToast.success('Campaign duplicated');
      if (copy && typeof copy === 'object' && 'id' in copy) {
        window.location.href = `/admin/newsletters/campaigns/${(copy as Campaign).id}`;
      } else load();
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Could not duplicate campaign');
    }
  }

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
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Could not create campaign');
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader
        title="Campaigns"
        description="One-off and scheduled emails. Open a row to edit the layout."
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="icon" onClick={load} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={createBlank}>
              <Plus className="mr-1 size-4" /> New draft
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or subject…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'all' ? 'All statuses' : s.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white text-gray-900">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Campaign</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Status</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Scheduled</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-gray-500 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  {Array.from({ length: 4 }).map((__, j) => (
                    <TableCell key={j} className="px-4 py-4">
                      <div className="h-3 bg-gray-100 rounded w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="px-4 py-12 text-center text-sm text-gray-500">
                  {campaigns.length === 0 ? 'No campaigns yet. Create a draft to get started.' : 'No campaigns match your filters.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id} className="border-t border-gray-100">
                  <TableCell className="px-4 py-3">
                    <Link href={`/admin/newsletters/campaigns/${c.id}`} className="font-medium text-[#003d7a] hover:underline">
                      {c.title}
                    </Link>
                    <div className="text-xs text-gray-500">{c.subject}</div>
                    {c.monthKey && <div className="text-xs text-gray-400">Month: {c.monthKey}</div>}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <CampaignStatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-gray-600">
                    {c.scheduledAtLocal || c.sentAtLocal || '—'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="inline-flex flex-wrap justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/newsletters/campaigns/${c.id}`}>Open</Link>
                      </Button>
                      <Button variant="ghost" size="sm" title="Duplicate" onClick={() => duplicate(c)}>
                        <Copy className="size-4" />
                      </Button>
                      {CANCELABLE.has(c.status) && (
                        <Button variant="ghost" size="sm" title="Cancel" onClick={() => cancel(c)}>
                          <XCircle className="size-4 text-amber-700" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete"
                        disabled={c.status === 'SENDING'}
                        onClick={() => remove(c)}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {dialog}
    </div>
  );
}