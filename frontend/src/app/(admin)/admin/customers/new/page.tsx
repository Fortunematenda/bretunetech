'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, Mail, ExternalLink, RefreshCw, UserPlus, Users } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { ExportBar } from '@/components/admin/ExportBar';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminKpiCard from '@/components/admin/AdminKpiCard';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function NewCustomersDetailPage() {
  const { token } = useAuthStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSummary, setCustomerSummary] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(1);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [c, s, r] = await Promise.allSettled([
        analyticsApi.getNewCustomersDetailed(token, days),
        analyticsApi.getCustomerSummary(token),
        analyticsApi.getCustomerRegistrations(token, 30),
      ]);
      if (c.status === 'fulfilled') setCustomers(c.value);
      if (s.status === 'fulfilled') setCustomerSummary(s.value);
      if (r.status === 'fulfilled') setRegistrations(r.value);
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxReg = Math.max(...registrations.map(r => r.count), 1);

  const exportColumns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'createdAt', label: 'Date Registered' },
    { key: 'orderCount', label: 'Orders' },
    { key: 'totalSpend', label: 'Total Spend' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/admin/analytics">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <AdminPageHeader
            title="New Customers"
            description="Customer registration analytics and management"
            actions={
              <>
                <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                  <option value={1}>Today</option>
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={365}>All Time</option>
                </select>
                <Button type="button" variant="secondary" size="icon-sm" onClick={fetchData}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </>
            }
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminKpiCard
          label="New Today"
          value={loading ? '—' : (customerSummary?.newToday || 0).toLocaleString()}
          icon={UserPlus}
          tone="rose"
          loading={loading}
          showArrow={false}
        />
        <AdminKpiCard
          label="New This Week"
          value={loading ? '—' : (customerSummary?.newThisWeek || 0).toLocaleString()}
          icon={Users}
          tone="primary"
          loading={loading}
          showArrow={false}
        />
        <AdminKpiCard
          label="New This Month"
          value={loading ? '—' : (customerSummary?.newThisMonth || 0).toLocaleString()}
          icon={Users}
          tone="sky"
          loading={loading}
          showArrow={false}
        />
      </div>

      {/* Registrations Over Time */}
      {registrations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Registrations Over Time (30 days)</h2>
          <div className="flex items-end gap-1 h-28">
            {registrations.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-pink-500 rounded-t-sm hover:bg-pink-600 transition-colors min-h-[1px]"
                  style={{ height: `${(item.count / maxReg) * 100}%` }}
                />
                {i % 5 === 0 && (
                  <span className="text-[9px] text-gray-400 hidden lg:block">
                    {new Date(item.date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}
                  </span>
                )}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.count} registrations
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Customer List</h2>
          <ExportBar data={customers} filename="new-customers" columns={exportColumns} />
        </div>
        <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 bg-gray-50/50">
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Name</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Email</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Phone</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Registered</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Orders</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Spend</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Status</TableHead>
                <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {loading ? (
                <TableRow><TableCell colSpan={8} className="px-4 py-8 text-center text-gray-400 text-xs">Loading...</TableCell></TableRow>
              ) : customers.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="px-4 py-8 text-center text-gray-400 text-xs">No new customers in this period</TableCell></TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={c.id} className="hover:bg-gray-50/50">
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700 font-medium">{c.firstName} {c.lastName}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-500">{c.email}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-500">{c.phone || '—'}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-700">{c.orderCount}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs font-semibold text-gray-900">R {c.totalSpend.toFixed(2)}</TableCell>
                    <TableCell className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/customers?id=${c.id}`} className="p-1 text-gray-400 hover:text-primary rounded transition-colors" title="View Customer">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <a href={`mailto:${c.email}`} className="p-1 text-gray-400 hover:text-sky-600 rounded transition-colors" title="Email Customer">
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
