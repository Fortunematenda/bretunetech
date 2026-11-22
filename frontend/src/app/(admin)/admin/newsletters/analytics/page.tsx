'use client';

import { useEffect, useState } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminKpiCard from '@/components/admin/AdminKpiCard';
import { newsletterAdminApi } from '@/lib/newsletter-api';

export default function NewsletterAnalyticsPage() {
  const [dash, setDash] = useState<any>(null);

  useEffect(() => {
    newsletterAdminApi.dashboard().then(setDash);
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader title="Analytics" description="Counts come from delivery events stored for sent campaigns." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpiCard label="Delivered" value={dash?.delivery?.delivered ?? 0} tone="emerald" loading={!dash} />
        <AdminKpiCard label="Opens" value={dash?.engagement?.opens ?? 0} tone="sky" loading={!dash} />
        <AdminKpiCard label="Clicks" value={dash?.engagement?.clicks ?? 0} tone="primary" loading={!dash} />
        <AdminKpiCard label="Bounces" value={dash?.delivery?.bounces ?? 0} tone="rose" loading={!dash} />
      </div>
      <p className="text-sm text-gray-500">{dash?.engagement?.openRateNote}</p>
    </div>
  );
}