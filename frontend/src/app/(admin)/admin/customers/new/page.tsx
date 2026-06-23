'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, UserPlus, RefreshCw, Mail, ExternalLink } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { ExportBar } from '@/components/admin/ExportBar';

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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/analytics" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">New Customers</h1>
            <p className="text-gray-500 text-sm mt-0.5">Customer registration analytics and management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value={1}>Today</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={365}>All Time</option>
          </select>
          <button onClick={fetchData} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'New Today', value: customerSummary?.newToday || 0, color: 'text-pink-600' },
          { label: 'New This Week', value: customerSummary?.newThisWeek || 0, color: 'text-violet-600' },
          { label: 'New This Month', value: customerSummary?.newThisMonth || 0, color: 'text-sky-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{loading ? '—' : s.value.toLocaleString()}</p>
          </div>
        ))}
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Name</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Email</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Phone</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Registered</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Orders</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Spend</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Status</th>
                <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-xs">Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-xs">No new customers in this period</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-xs text-gray-700 font-medium">{c.firstName} {c.lastName}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{c.email}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{c.phone || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-700">{c.orderCount}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-gray-900">R {c.totalSpend.toFixed(2)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/customers?id=${c.id}`} className="p-1 text-gray-400 hover:text-violet-600 rounded transition-colors" title="View Customer">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <a href={`mailto:${c.email}`} className="p-1 text-gray-400 hover:text-sky-600 rounded transition-colors" title="Email Customer">
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
