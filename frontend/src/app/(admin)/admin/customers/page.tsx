'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Mail, Phone, X, ShoppingBag, Calendar, ChevronRight, RefreshCw } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { adminApi } from '@/lib/api';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  orders: number;
  totalSpent: number;
  lastActive: string;
  role: string;
}

export default function CustomersPage() {
  const { token } = useAuthStore();
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  // Fetch real customers from API
  const fetchCustomers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getCustomers(token);
      // Transform API data to match our interface
      const customerData = data.map((user: any) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || 'N/A',
        orders: user._count?.orders || 0,
        totalSpent: user.orders?.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0) || 0,
        lastActive: user.updatedAt || user.createdAt,
        role: user.role,
      }));
      setCustomers(customerData);
    } catch (err: any) {
      console.error('Failed to fetch customers:', err);
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filtered = customers.filter((c) =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Customers</h1>
          <p className="text-sm text-slate-500">{customers.length} registered customers</p>
        </div>
        <button onClick={fetchCustomers} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Customer', 'Contact', 'Orders', 'Total Spent', 'Last Active', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-3 bg-slate-800 rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-500 text-sm">No customers found</td></tr>
              ) : filtered.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => setSelected(customer)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400 font-bold text-sm shrink-0">
                        {customer.firstName?.charAt(0) || customer.email.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{customer.firstName} {customer.lastName}</p>
                        <p className="text-xs text-slate-500">Individual Customer</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-slate-400 flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-600" />{customer.email}</p>
                    {customer.phone && customer.phone !== 'N/A' && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3 text-slate-600" />{customer.phone}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-300 text-sm">{customer.orders}</td>
                  <td className="px-5 py-4 text-white font-semibold text-sm">{formatPrice(customer.totalSpent)}</td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{formatDate(customer.lastActive)}</td>
                  <td className="px-5 py-4">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#13151c] border-l border-slate-800 z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400 font-bold">
                  {selected.firstName?.charAt(0) || selected.email.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{selected.firstName} {selected.lastName}</h2>
                  <p className="text-xs text-slate-500">Individual Customer</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Contact */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Contact Information</p>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <a href={`mailto:${selected.email}`} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">{selected.email}</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <a href={`tel:${selected.phone}`} className="text-sm text-slate-300">{selected.phone}</a>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                  <ShoppingBag className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{selected.orders}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Total Orders</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-emerald-400">{formatPrice(selected.totalSpent)}</p>
                  <p className="text-xs text-slate-500 mt-1">Total Spent</p>
                </div>
              </div>

              {/* Activity */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Activity</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4 text-slate-600" /> Last active
                  </div>
                  <span className="text-sm text-slate-300">{formatDate(selected.lastActive)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Role</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700 text-slate-300">{selected.role || 'CUSTOMER'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <a href={`mailto:${selected.email}`}
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors">
                  <Mail className="w-4 h-4" /> Email
                </a>
                {selected.phone && selected.phone !== 'N/A' && (
                  <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 text-emerald-400 text-sm font-medium rounded-lg transition-colors">
                    <Phone className="w-4 h-4" /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
