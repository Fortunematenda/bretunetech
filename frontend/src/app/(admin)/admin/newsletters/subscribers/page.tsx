'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Download, RefreshCw, Search, Upload } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { newsletterAdminApi } from '@/lib/newsletter-api';
import { downloadTextFile } from '@/components/admin/newsletter/campaign-status';
import { appToast } from '@/lib/toast';

type SubscriberRow = {
  id: string;
  email: string;
  firstName?: string | null;
  status: string;
  source?: string | null;
  interests?: string[];
  marketingEligible?: boolean;
  requiresConsentReview?: boolean;
  orderCount?: number;
  suppression?: { reason: string; detail?: string } | null;
};

type ConsentAudit = {
  requireConsentReview: number;
  legacyAutoEnrolledActive: number;
  eligibleMarketingActive: number;
  note?: string;
  sampleEmails?: string[];
};

type ImportRow = {
  email: string;
  firstName?: string;
  consentAt: string;
  source: string;
  interests?: string[];
  error?: string;
};

const PAGE_SIZE = 25;

const STATUS_OPTIONS = ['', 'PENDING', 'ACTIVE', 'UNSUBSCRIBED', 'SUPPRESSED'] as const;

function parseCsv(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  const idx = (name: string) => header.indexOf(name);
  const emailI = idx('email');
  const firstI = idx('firstname');
  const consentI = idx('consentat');
  const sourceI = idx('source');
  const interestsI = idx('interests');
  if (emailI < 0 || consentI < 0 || sourceI < 0) {
    throw new Error('CSV must include columns: email, consentAt, source (firstName, interests optional)');
  }

  const parseCell = (line: string, i: number) => {
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    const row = line + ',';
    for (let j = 0; j < row.length; j++) {
      const ch = row[j];
      if (ch === '"') {
        if (inQuotes && row[j + 1] === '"') {
          cur += '"';
          j++;
        } else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cells.push(cur);
        cur = '';
      } else cur += ch;
    }
    return (cells[i] ?? '').trim();
  };

  const rows: ImportRow[] = [];
  for (let li = 1; li < lines.length; li++) {
    const email = parseCell(lines[li], emailI);
    if (!email) continue;
    const firstName = firstI >= 0 ? parseCell(lines[li], firstI) : undefined;
    const consentAt = parseCell(lines[li], consentI);
    const source = parseCell(lines[li], sourceI) || 'import';
    const interestsRaw = interestsI >= 0 ? parseCell(lines[li], interestsI) : '';
    const interests = interestsRaw
      ? interestsRaw.split(/[|;]/).map((s) => s.trim()).filter(Boolean)
      : undefined;

    let error: string | undefined;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) error = 'Invalid email';
    else if (!consentAt) error = 'consentAt required';
    else {
      const d = new Date(consentAt);
      if (Number.isNaN(d.getTime())) error = 'Invalid consentAt (use ISO datetime)';
    }

    rows.push({
      email,
      firstName: firstName || undefined,
      consentAt: consentAt ? new Date(consentAt).toISOString() : consentAt,
      source,
      interests,
      error,
    });
  }
  return rows;
}

export default function NewsletterSubscribersPage() {
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [consentEligibility, setConsentEligibility] = useState<'all' | 'eligible' | 'requires_consent'>('all');
  const [source, setSource] = useState('');
  const [interest, setInterest] = useState('');
  const [activity, setActivity] = useState<'all' | 'purchased' | 'never_purchased'>('all');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [audit, setAudit] = useState<ConsentAudit | null>(null);
  const [importPreview, setImportPreview] = useState<ImportRow[] | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filterParams = useMemo(() => {
    const p: Record<string, string> = {
      page: String(page),
      limit: String(PAGE_SIZE),
    };
    if (search.trim()) p.search = search.trim();
    if (status) p.status = status;
    if (consentEligibility !== 'all') p.consentEligibility = consentEligibility;
    if (source.trim()) p.source = source.trim();
    if (interest.trim()) p.interest = interest.trim();
    if (activity !== 'all') p.activity = activity;
    return p;
  }, [search, status, consentEligibility, source, interest, activity, page]);

  const exportParams = useMemo(() => {
    const { page: _p, limit: _l, ...rest } = filterParams;
    return rest;
  }, [filterParams]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await newsletterAdminApi.subscribers(filterParams);
      setRows(data.subscribers || []);
      setTotal(data.pagination?.total ?? (data.subscribers || []).length);
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, [filterParams]);

  const loadAudit = useCallback(async () => {
    try {
      const data = await newsletterAdminApi.consentAudit();
      setAudit(data as ConsentAudit);
    } catch {
      /* non-blocking */
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  useEffect(() => {
    setPage(1);
  }, [search, status, consentEligibility, source, interest, activity]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await newsletterAdminApi.exportSubscribersCsv(exportParams);
      downloadTextFile('newsletter-subscribers.csv', csv);
      appToast.success('Export downloaded');
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  async function onFileChosen(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      if (!parsed.length) {
        appToast.error('No data rows found in CSV');
        return;
      }
      setImportPreview(parsed);
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Could not parse CSV');
      setImportPreview(null);
    }
  }

  async function runImport() {
    if (!importPreview?.length) return;
    const valid = importPreview.filter((r) => !r.error);
    if (!valid.length) {
      appToast.error('Fix validation errors before importing');
      return;
    }
    setImporting(true);
    try {
      const result = await newsletterAdminApi.importSubscribers(
        valid.map(({ email, firstName, consentAt, source: src, interests }) => ({
          email,
          firstName,
          consentAt,
          source: src,
          interests,
        })),
      );
      const count = (result as { imported?: number }).imported ?? valid.length;
      appToast.success(`Imported ${count} subscriber${count === 1 ? '' : 's'}`);
      setImportPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      load();
      loadAudit();
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  const importInvalidCount = importPreview?.filter((r) => r.error).length ?? 0;

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-full overflow-x-hidden">
      <AdminPageHeader
        title="Newsletter subscribers"
        description={`${total} on the list`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled={exporting} onClick={handleExport}>
              <Download className="mr-1 size-4" />
              Export CSV
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={() => { load(); loadAudit(); }} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {audit && audit.requireConsentReview > 0 && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />
          <div>
            <p className="font-medium">
              {audit.requireConsentReview} legacy subscriber{audit.requireConsentReview === 1 ? '' : 's'} need consent review
            </p>
            <p className="mt-1 text-xs text-amber-800">
              {audit.note || 'These accounts are excluded from campaigns until they re-consent.'}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email or name…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary"
            />
          </div>
          <Select value={status || '_all'} onValueChange={(v) => setStatus(v === '_all' ? '' : v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All statuses</SelectItem>
              {STATUS_OPTIONS.filter(Boolean).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={consentEligibility} onValueChange={(v) => setConsentEligibility(v as typeof consentEligibility)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Eligibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All eligibility</SelectItem>
              <SelectItem value="eligible">Eligible</SelectItem>
              <SelectItem value="requires_consent">Needs consent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={activity} onValueChange={(v) => setActivity(v as typeof activity)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All activity</SelectItem>
              <SelectItem value="purchased">Purchased</SelectItem>
              <SelectItem value="never_purchased">Never purchased</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Source"
            className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="Interest"
            className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => onFileChosen(e.target.files?.[0])}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-1 size-4" />
            Import CSV
          </Button>
          <span className="text-xs text-gray-500">Columns: email, firstName, consentAt, source, interests</span>
        </div>

        {importPreview && (
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>
                Preview: {importPreview.length} row{importPreview.length === 1 ? '' : 's'}
                {importInvalidCount > 0 && (
                  <span className="text-red-600"> ({importInvalidCount} invalid)</span>
                )}
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => { setImportPreview(null); if (fileRef.current) fileRef.current.value = ''; }}>
                  Cancel
                </Button>
                <Button type="button" size="sm" disabled={importing || importPreview.every((r) => r.error)} onClick={runImport}>
                  {importing ? 'Importing…' : 'Confirm import'}
                </Button>
              </div>
            </div>
            <div className="max-h-48 overflow-auto rounded border border-gray-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Consent</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importPreview.slice(0, 20).map((r) => (
                    <TableRow key={r.email}>
                      <TableCell className="text-xs">{r.email}</TableCell>
                      <TableCell className="text-xs">{r.firstName || '—'}</TableCell>
                      <TableCell className="text-xs">{r.source}</TableCell>
                      <TableCell className="text-xs">{r.consentAt ? r.consentAt.slice(0, 19) : '—'}</TableCell>
                      <TableCell className="text-xs text-red-600">{r.error || 'OK'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {importPreview.length > 20 && (
                <p className="px-3 py-2 text-xs text-gray-500">…and {importPreview.length - 20} more</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Email</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Name</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Status</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Source</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Eligibility</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Interests</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Orders</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Suppression</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100/50">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j} className="px-4 py-4">
                      <div className="h-3 bg-gray-100 rounded w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-4 py-16 text-center text-gray-500 text-sm">
                  No subscribers match these filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const name = row.firstName?.trim() || '—';
                const eligible = row.marketingEligible === true;
                return (
                  <TableRow key={row.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="px-4 py-3 text-sm text-gray-900">{row.email}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700">{name}</TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-600">{row.status}</TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-500">{row.source || '—'}</TableCell>
                    <TableCell className="px-4 py-3">
                      {eligible ? (
                        <Badge variant="secondary">Eligible</Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-300 text-amber-800">Needs consent</Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-500 max-w-[140px] truncate" title={(row.interests || []).join(', ')}>
                      {(row.interests || []).length ? row.interests!.join(', ') : '—'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm tabular-nums">{row.orderCount ?? 0}</TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate" title={row.suppression?.detail}>
                      {row.suppression?.reason || '—'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
          <span>
            Page {page} of {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}