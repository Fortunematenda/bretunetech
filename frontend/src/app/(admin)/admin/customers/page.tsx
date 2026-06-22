'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mail, Phone, X, ShoppingBag, Calendar, ChevronRight, RefreshCw, Columns, CheckSquare, Eye, ExternalLink, MoreVertical } from 'lucide-react';
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
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [colOpen, setColOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  type ColKey = 'contact' | 'phone' | 'orders' | 'spent' | 'lastActive' | 'role' | 'verified';
  const ALL_COLS: { key: ColKey; label: string }[] = [
    { key: 'contact',    label: 'Email' },
    { key: 'phone',      label: 'Phone' },
    { key: 'orders',     label: 'Orders' },
    { key: 'spent',      label: 'Total Spent' },
    { key: 'lastActive', label: 'Last Active' },
    { key: 'role',       label: 'Role' },
    { key: 'verified',   label: 'Verified' },
  ];
  const DEFAULT_COLS: ColKey[] = ['contact', 'orders', 'spent', 'lastActive'];
  const [visibleCols, setVisibleCols] = useState<ColKey[]>(DEFAULT_COLS);
  useEffect(() => {
    try { const s = localStorage.getItem('admin_customers_cols'); if (s) setVisibleCols(JSON.parse(s)); } catch { /* ignore */ }
  }, []);
  const toggleCol = (key: ColKey) => setVisibleCols((prev) => {
    const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
    localStorage.setItem('admin_customers_cols', JSON.stringify(next)); return next;
  });
  const col = (key: ColKey) => visibleCols.includes(key);

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
          <h1 className="text-xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">{customers.length} registered customers</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setColOpen((o) => !o)} className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors">
              <Columns className="w-4 h-4" /> Columns
            </button>
            {colOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setColOpen(false)} />
                <div className="absolute right-0 top-10 z-20 w-48 bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden">
                  <div className="py-1">
                    {ALL_COLS.map(({ key, label }) => (
                      <button key={key} onClick={() => toggleCol(key)} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${col(key) ? 'bg-violet-600 border-violet-500' : 'border-gray-300'}`}>
                          {col(key) && <CheckSquare className="w-3 h-3 text-gray-900" />}
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-300 flex">
                    <button onClick={() => { const all = ALL_COLS.map(c => c.key); setVisibleCols(all); localStorage.setItem('admin_customers_cols', JSON.stringify(all)); }} className="flex-1 py-2 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">Show all</button>
                    <div className="w-px bg-gray-700" />
                    <button onClick={() => { setVisibleCols(DEFAULT_COLS); localStorage.setItem('admin_customers_cols', JSON.stringify(DEFAULT_COLS)); }} className="flex-1 py-2 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">Reset</button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button onClick={fetchCustomers} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                {col('contact')    && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>}
                {col('phone')      && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>}
                {col('orders')     && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>}
                {col('spent')      && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spent</th>}
                {col('lastActive') && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>}
                {col('role')       && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>}
                {col('verified')   && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified</th>}
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-32" /></td>
                    {col('contact')    && <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-32" /></td>}
                    {col('phone')      && <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>}
                    {col('orders')     && <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-10" /></td>}
                    {col('spent')      && <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-20" /></td>}
                    {col('lastActive') && <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>}
                    {col('role')       && <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded-full w-16" /></td>}
                    {col('verified')   && <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded-full w-14" /></td>}
                    <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-4" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-16 text-center text-gray-500 text-sm">No customers found</td></tr>
              ) : filtered.map((customer, rowIndex) => (
                <tr key={customer.id} onClick={() => router.push(`/admin/customers/${customer.id}`)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 font-bold text-sm shrink-0">
                        {customer.firstName?.charAt(0) || customer.email.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
                      </div>
                    </div>
                  </td>
                  {col('contact')    && <td className="px-5 py-4 text-xs text-gray-500"><span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-gray-600" />{customer.email}</span></td>}
                  {col('phone')      && <td className="px-5 py-4 text-xs text-gray-500">{customer.phone && customer.phone !== 'N/A' ? <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-600" />{customer.phone}</span> : '—'}</td>}
                  {col('orders')     && <td className="px-5 py-4 text-gray-700 text-sm">{customer.orders}</td>}
                  {col('spent')      && <td className="px-5 py-4 text-gray-900 font-semibold text-sm">{formatPrice(customer.totalSpent)}</td>}
                  {col('lastActive') && <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(customer.lastActive)}</td>}
                  {col('role')       && <td className="px-5 py-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">{customer.role}</span></td>}
                  {col('verified')   && <td className="px-5 py-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">Yes</span></td>}
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="relative flex justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === customer.id ? null : customer.id); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === customer.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className={`absolute right-0 z-20 w-48 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden ${
                            rowIndex >= filtered.length - 3 ? 'bottom-8' : 'top-8'
                          }`}>
                            <button
                              onClick={() => { setOpenMenuId(null); setSelected(customer); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Quick Preview
                            </button>
                            <button
                              onClick={() => { setOpenMenuId(null); router.push(`/admin/customers/${customer.id}`); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-violet-600 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View Profile
                            </button>
                            <button
                              onClick={() => { setOpenMenuId(null); router.push(`/admin/orders?search=${encodeURIComponent(customer.email)}`); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" /> View Orders
                            </button>
                            <div className="border-t border-gray-200 mx-2" />
                            <a
                              href={`mailto:${customer.email}`}
                              onClick={() => setOpenMenuId(null)}
                              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" /> Send Email
                            </a>
                          </div>
                        </>
                      )}
                    </div>
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
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 font-bold">
                  {selected.firstName?.charAt(0) || selected.email.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{selected.firstName} {selected.lastName}</h2>
                  <p className="text-xs text-gray-500">Individual Customer</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Contact */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Contact Information</p>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                  <a href={`mailto:${selected.email}`} className="text-sm text-violet-600 hover:text-violet-700 transition-colors">{selected.email}</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                  <a href={`tel:${selected.phone}`} className="text-sm text-gray-700">{selected.phone}</a>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <ShoppingBag className="w-5 h-5 text-violet-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-900">{selected.orders}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Total Orders</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-emerald-600">{formatPrice(selected.totalSpent)}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Spent</p>
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Activity</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4 text-gray-600" /> Last active
                  </div>
                  <span className="text-sm text-gray-700">{formatDate(selected.lastActive)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Role</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-700 text-gray-700">{selected.role || 'CUSTOMER'}</span>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="grid grid-cols-2 gap-2">
                <a href={`mailto:${selected.email}`}
                  className="flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                  <Mail className="w-4 h-4" /> Email
                </a>
                {selected.phone && selected.phone !== 'N/A' && (
                  <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 text-emerald-600 text-sm font-medium rounded-lg transition-colors">
                    <Phone className="w-4 h-4" /> WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => { setSelected(null); router.push(`/admin/customers/${selected.id}`); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Open Full Profile
              </button>
              <button
                onClick={() => { setSelected(null); router.push(`/admin/orders?search=${encodeURIComponent(selected.email)}`); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> View Orders
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
