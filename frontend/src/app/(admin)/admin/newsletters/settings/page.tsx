'use client';

import { useEffect, useState } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { newsletterAdminApi } from '@/lib/newsletter-api';

export default function NewsletterSettingsPage() {
  const [dash, setDash] = useState<any>(null);

  useEffect(() => {
    newsletterAdminApi.dashboard().then(setDash);
  }, []);

  const rows = [
    ['From name', dash?.identity?.fromName],
    ['From email', dash?.identity?.fromEmail],
    ['Provider', dash?.identity?.provider],
    ['Bulk sending', dash?.sendingEnabled ? 'On' : 'Off'],
    ['Queue worker', dash?.workerEnabled ? 'On' : 'Off'],
  ];

  return (
    <div className="max-w-xl space-y-6 p-4 sm:p-6">
      <AdminPageHeader
        title="Settings"
        description="Sender identity and sending switches are set in the server environment, then the backend is restarted."
      />
      <dl className="divide-y rounded-xl border bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
            <dt className="text-gray-500">{label}</dt>
            <dd className="font-medium text-gray-900">{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}