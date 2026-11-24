'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Calendar,
  CalendarClock,
  Eye,
  FileText,
  Mail,
  MousePointerClick,
  Send,
  Settings,
  ShieldAlert,
  ShieldOff,
  UserCheck,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminKpiCard from '@/components/admin/AdminKpiCard';
import { CampaignStatusBadge } from '@/components/admin/newsletter/campaign-status';
import { Button } from '@/components/ui/button';
import { newsletterAdminApi, type NewsletterDashboard } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';

const QUICK_LINKS = [
  { href: '/admin/newsletters/campaigns', label: 'Campaigns', icon: Send, desc: 'Draft, schedule, and send' },
  { href: '/admin/newsletters/subscribers', label: 'Subscribers', icon: Users, desc: 'List, import, and export' },
  { href: '/admin/newsletters/templates', label: 'Templates', icon: FileText, desc: 'Reusable layouts' },
  { href: '/admin/newsletters/calendar', label: 'Calendar', icon: Calendar, desc: 'Month view (SAST)' },
  { href: '/admin/newsletters/analytics', label: 'Analytics', icon: BarChart3, desc: 'Delivery and engagement' },
  { href: '/admin/newsletters/settings', label: 'Settings', icon: Settings, desc: 'Sender identity' },
] as const;

function fmtCount(n: number | undefined | null, loaded: boolean): string | number {
  if (!loaded) return 0;
  if (n == null) return '—';
  return n.toLocaleString('en-ZA');
}

export default function NewslettersAdminPage() {
  const [dash, setDash] = useState<NewsletterDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await newsletterAdminApi.dashboard();
      setDash(d);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load newsletters';
      appToast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const chartData = useMemo(
    () =>
      (dash?.performance ?? []).map((row) => ({
        name: row.title.length > 22 ? `${row.title.slice(0, 20)}…` : row.title,
        accepted: row.accepted,
        delivered: row.delivered,
        uniqueOpens: row.uniqueOpens,
      })),
    [dash?.performance],
  );

  const recent = dash?.recentCampaigns ?? [];
  const loaded = !loading && !!dash;

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <AdminPageHeader
        title="Newsletter Manager"
        description="Marketing overview — live figures from your database."
        actions={
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
              dash?.sendingEnabled
                ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                : 'bg-amber-50 text-amber-900 ring-amber-200'
            }`}
          >
            <Zap className="size-3.5" />
            {loading ? '…' : dash?.sendingEnabled ? 'Sending enabled' : 'Sending disabled'}
          </span>
        }
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Audience</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AdminKpiCard
            label="Total subscribers"
            value={fmtCount(dash?.subscribers?.total, loaded)}
            icon={Users}
            tone="primary"
            loading={loading}
            showArrow={false}
            href="/admin/newsletters/subscribers"
          />
          <AdminKpiCard
            label="Eligible"
            value={fmtCount(dash?.subscribers?.eligible, loaded)}
            icon={UserCheck}
            tone="emerald"
            loading={loading}
            showArrow={false}
          />
          <AdminKpiCard
            label="Pending"
            value={fmtCount(dash?.subscribers?.pending, loaded)}
            icon={Mail}
            tone="amber"
            loading={loading}
            showArrow={false}
          />
          <AdminKpiCard
            label="Consent review"
            value={fmtCount(dash?.subscribers?.requiresConsentReview, loaded)}
            icon={ShieldAlert}
            tone="orange"
            loading={loading}
            showArrow={false}
          />
          <AdminKpiCard
            label="Unsubscribed"
            value={fmtCount(dash?.subscribers?.unsubscribed, loaded)}
            icon={XCircle}
            tone="slate"
            loading={loading}
            showArrow={false}
          />
          <AdminKpiCard
            label="Suppressed"
            value={fmtCount(dash?.subscribers?.suppressed, loaded)}
            icon={ShieldOff}
            tone="rose"
            loading={loading}
            showArrow={false}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Delivery & engagement</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AdminKpiCard
            label="Accepted"
            value={fmtCount(dash?.delivery?.accepted, loaded)}
            sub={dash?.delivery?.acceptedNote}
            icon={Send}
            tone="sky"
            loading={loading}
            showArrow={false}
          />
          <AdminKpiCard
            label="Delivered"
            value={fmtCount(dash?.delivery?.delivered, loaded)}
            sub={dash?.delivery?.deliveredNote}
            icon={Mail}
            tone="emerald"
            loading={loading}
            showArrow={false}
          />
          <AdminKpiCard
            label="Failed"
            value={fmtCount(dash?.delivery?.failed, loaded)}
            icon={XCircle}
            tone="red"
            loading={loading}
            showArrow={false}
          />
          <AdminKpiCard
            label="Open rate"
            value={loaded && dash?.engagement?.openRate != null ? `${dash.engagement.openRate}%` : loaded ? '—' : 0}
            sub={dash?.engagement?.openRateNote}
            icon={Eye}
            tone="primary"
            loading={loading}
            showArrow={false}
            href="/admin/newsletters/analytics"
          />
          <AdminKpiCard
            label="Click rate"
            value={loaded && dash?.engagement?.clickRate != null ? `${dash.engagement.clickRate}%` : loaded ? '—' : 0}
            icon={MousePointerClick}
            tone="teal"
            loading={loading}
            showArrow={false}
            href="/admin/newsletters/analytics"
          />
          <AdminKpiCard
            label="Scheduled campaigns"
            value={fmtCount(dash?.campaigns?.scheduled, loaded)}
            icon={CalendarClock}
            tone="amber"
            loading={loading}
            showArrow={false}
            href="/admin/newsletters/calendar"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-3">
          <h2 className="text-lg font-semibold text-gray-900">Campaign performance</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {loading ? (
              <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
            ) : chartData.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-sm text-gray-500">
                <BarChart3 className="size-8 text-gray-300" />
                <p>No sent campaigns with performance data yet.</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/newsletters/campaigns">Go to campaigns</Link>
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={56} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accepted" name="Accepted" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delivered" name="Delivered" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="uniqueOpens" name="Unique opens" fill="#003d7a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {loading &&
              [0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse space-y-2 p-4">
                  <div className="h-4 w-2/3 rounded bg-gray-100" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                </div>
              ))}
            {!loading && recent.length === 0 && (
              <p className="p-6 text-center text-sm text-gray-500">No recent campaigns.</p>
            )}
            {!loading &&
              recent.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/newsletters/campaigns/${c.id}`}
                      className="font-medium text-[#003d7a] hover:underline"
                    >
                      {c.title}
                    </Link>
                    <p className="truncate text-xs text-gray-500">{c.subject}</p>
                  </div>
                  <CampaignStatusBadge status={c.status} />
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Quick tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#003d7a]/30 hover:shadow-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#003d7a]/10 text-[#003d7a]">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="font-medium text-gray-900 group-hover:text-[#003d7a]">{item.label}</span>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}