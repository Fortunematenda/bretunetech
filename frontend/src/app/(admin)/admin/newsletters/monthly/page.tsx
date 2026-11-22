'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { newsletterAdminApi, type Campaign } from '@/lib/newsletter-api';

export default function MonthlyNewslettersPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    newsletterAdminApi.listCampaigns().then((c) => setCampaigns((c.campaigns || []).filter((row: Campaign) => row.monthKey)));
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader title="Monthly Newsletters" description="Campaigns tied to a calendar month. Each month key can only be used once." />
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3">{c.monthKey}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/newsletters/campaigns/${c.id}`} className="text-[#003d7a] hover:underline">{c.title}</Link>
                </td>
                <td className="px-4 py-3">{c.status}</td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No monthly newsletters yet. Create a draft from Overview.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}