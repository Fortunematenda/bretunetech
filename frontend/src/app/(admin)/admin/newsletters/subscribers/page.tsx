'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { newsletterAdminApi } from '@/lib/newsletter-api';

export default function NewsletterSubscribersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const data = await newsletterAdminApi.subscribers({ search, page: '1', limit: '50' });
    setRows(data.subscribers || []);
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader title="Newsletter subscribers" description="Opt-in proof, consent source and suppression status." />
      <input
        className="max-w-md rounded-lg border px-3 py-2 text-sm"
        placeholder="Search email or name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Consent at</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2">{r.source}</td>
                <td className="px-3 py-2">{r.consentAt ? new Date(r.consentAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}