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
        className="max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#003d7a] focus:outline-none"
        placeholder="Search email or name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-auto rounded-xl border border-gray-200 bg-white text-gray-900">
        <table className="w-full text-sm text-gray-900">
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
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium text-gray-900">{r.email}</td>
                <td className="px-3 py-2 text-gray-900">{r.status || '—'}</td>
                <td className="px-3 py-2 text-gray-900">{r.source || '—'}</td>
                <td className="px-3 py-2 text-gray-900">{r.consentAt ? new Date(r.consentAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}