'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mail, RefreshCw, Search } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { newsletterAdminApi } from '@/lib/newsletter-api';
import { formatDate } from '@/lib/utils';
import { appToast } from '@/lib/toast';

type SubscriberRow = {
  id: string;
  email: string;
  firstName?: string | null;
  status: string;
  source?: string | null;
  consentAt?: string | null;
};

export default function NewsletterSubscribersPage() {
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await newsletterAdminApi.subscribers({ search, page: '1', limit: '100' });
      setRows(data.subscribers || []);
      setTotal(data.pagination?.total ?? (data.subscribers || []).length);
    } catch (e: any) {
      appToast.error(e.message || 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsletter subscribers"
        description={`${total} people on the newsletter list`}
        actions={
          <Button type="button" variant="outline" size="icon" onClick={load} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search email or name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscriber</TableHead>
              <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</TableHead>
              <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscribed</TableHead>
              <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</TableHead>
              <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Consent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-32" /></TableCell>
                  <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-40" /></TableCell>
                  <TableCell className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-4" /></TableCell>
                  <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-20" /></TableCell>
                  <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-5 py-16 text-center text-gray-500 text-sm">No subscribers found</TableCell>
              </TableRow>
            ) : rows.map((row) => {
              const subscribed = row.status === 'ACTIVE';
              const name = row.firstName?.trim() || row.email.split('@')[0];
              return (
                <TableRow key={row.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-gray-600" />{row.email}</span>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={subscribed}
                      readOnly
                      aria-label={subscribed ? `${row.email} is subscribed` : `${row.email} is not subscribed`}
                      className="w-4 h-4 rounded border-gray-300 text-primary pointer-events-none"
                    />
                  </TableCell>
                  <TableCell className="px-5 py-4 text-xs text-gray-500">{row.source || '—'}</TableCell>
                  <TableCell className="px-5 py-4 text-gray-500 text-xs">{row.consentAt ? formatDate(row.consentAt) : '—'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
