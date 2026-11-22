'use client';

import { useEffect, useState } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { newsletterAdminApi } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';

export default function AutomationsPage() {
  const [enabled, setEnabled] = useState(false);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [hour, setHour] = useState(8);
  const [timeZone, setTimeZone] = useState('Africa/Johannesburg');

  useEffect(() => {
    newsletterAdminApi.schedule().then((row) => {
      if (!row) return;
      setEnabled(Boolean(row.enabled));
      setDayOfMonth(row.dayOfMonth ?? 1);
      setHour(row.hour ?? 8);
      setTimeZone(row.timeZone || 'Africa/Johannesburg');
    }).catch((e) => appToast.error(e.message));
  }, []);

  async function save() {
    try {
      await newsletterAdminApi.updateSchedule({ enabled, dayOfMonth, hour, timeZone });
      appToast.success('Automation saved');
    } catch (e: any) {
      appToast.error(e.message || 'Could not save');
    }
  }

  return (
    <div className="max-w-xl space-y-6 p-4 sm:p-6">
      <AdminPageHeader
        title="Automations"
        description="When enabled, the worker creates one draft per calendar month. It does not send until you approve the draft."
      />
      <label className="flex items-center gap-2 text-sm text-gray-800">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Create a monthly draft automatically
      </label>
      <label className="block text-sm text-gray-700">
        Day of month
        <input type="number" min={1} max={28} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-gray-900" value={dayOfMonth} onChange={(e) => setDayOfMonth(Number(e.target.value))} />
      </label>
      <label className="block text-sm text-gray-700">
        Hour (0–23)
        <input type="number" min={0} max={23} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-gray-900" value={hour} onChange={(e) => setHour(Number(e.target.value))} />
      </label>
      <label className="block text-sm text-gray-700">
        Time zone
        <input className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-gray-900" value={timeZone} onChange={(e) => setTimeZone(e.target.value)} />
      </label>
      <Button onClick={save}>Save automation</Button>
    </div>
  );
}