'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mail, Phone, X, ShoppingBag, Calendar, ChevronRight, RefreshCw, Columns, CheckSquare, Eye, ExternalLink, MoreVertical, Trash2, Check } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { adminApi } from '@/lib/api';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [colOpen, setColOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleDelete = async () => {
    if (!deleteConfirm || !token) return;
    setDeleting(true);
    try {
      await adminApi.deleteCustomer(token, deleteConfirm.id);
      setCustomers(customers.filter(c => c.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      setOpenMenuId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!token || selectedIds.size === 0) return;
    setDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => adminApi.deleteCustomer(token, id)));
      setCustomers(customers.filter(c => !selectedIds.has(c.id)));
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete customers');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers"
        description={`${customers.length} registered customers`}
        actions={
          <>
          <div className="relative">
            <Button type="button" variant="secondary" size="sm" onClick={() => setColOpen((o) => !o)}>
              <Columns className="h-4 w-4" /> Columns
            </Button>
            {colOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setColOpen(false)} />
                <div className="absolute right-0 top-10 z-20 w-48 bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden">
                  <div className="py-1">
                    {ALL_COLS.map(({ key, label }) => (
                      <button key={key} onClick={() => toggleCol(key)} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${col(key) ? 'bg-primary border-primary' : 'border-gray-300'}`}>
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
          <Button type="button" variant="outline" size="icon" onClick={fetchCustomers} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          </>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary" />
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-primary font-medium">{selectedIds.size} customer{selectedIds.size !== 1 ? 's' : ''} selected</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedIds(new Set())} className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={() => setBulkDeleteConfirm(true)} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="px-5 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginated.length && paginated.length > 0}
                    onChange={() => {
                      if (selectedIds.size === paginated.length) {
                        setSelectedIds(new Set());
                      } else {
                        setSelectedIds(new Set(paginated.map(c => c.id)));
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </TableHead>
                <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</TableHead>
                {col('contact')    && <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</TableHead>}
                {col('phone')      && <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</TableHead>}
                {col('orders')     && <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</TableHead>}
                {col('spent')      && <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spent</TableHead>}
                {col('lastActive') && <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</TableHead>}
                {col('role')       && <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</TableHead>}
                {col('verified')   && <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified</TableHead>}
                <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-4" /></TableCell>
                    <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-32" /></TableCell>
                    {col('contact')    && <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-32" /></TableCell>}
                    {col('phone')      && <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></TableCell>}
                    {col('orders')     && <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-10" /></TableCell>}
                    {col('spent')      && <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-20" /></TableCell>}
                    {col('lastActive') && <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></TableCell>}
                    {col('role')       && <TableCell className="px-5 py-4"><div className="h-4 bg-gray-100 rounded-full w-16" /></TableCell>}
                    {col('verified')   && <TableCell className="px-5 py-4"><div className="h-4 bg-gray-100 rounded-full w-14" /></TableCell>}
                    <TableCell className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-4" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="px-5 py-16 text-center text-gray-500 text-sm">No customers found</TableCell></TableRow>
              ) : paginated.map((customer, rowIndex) => (
                <TableRow key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(customer.id)}
                      onChange={() => toggleSelect(customer.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </TableCell>
                  <TableCell className="px-5 py-4 cursor-pointer" onClick={() => router.push(`/admin/customers/${customer.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {customer.firstName?.charAt(0) || customer.email.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
                      </div>
                    </div>
                  </TableCell>
                  {col('contact')    && <TableCell className="px-5 py-4 text-xs text-gray-500"><span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-gray-600" />{customer.email}</span></TableCell>}
                  {col('phone')      && <TableCell className="px-5 py-4 text-xs text-gray-500">{customer.phone && customer.phone !== 'N/A' ? <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-600" />{customer.phone}</span> : '—'}</TableCell>}
                  {col('orders')     && <TableCell className="px-5 py-4 text-gray-700 text-sm">{customer.orders}</TableCell>}
                  {col('spent')      && <TableCell className="px-5 py-4 text-gray-900 font-semibold text-sm">{formatPrice(customer.totalSpent)}</TableCell>}
                  {col('lastActive') && <TableCell className="px-5 py-4 text-gray-500 text-xs">{formatDate(customer.lastActive)}</TableCell>}
                  {col('role')       && <TableCell className="px-5 py-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">{customer.role}</span></TableCell>}
                  {col('verified')   && <TableCell className="px-5 py-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">Yes</span></TableCell>}
                  <TableCell className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
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
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
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
                            <div className="border-t border-gray-200 mx-2" />
                            <button
                              onClick={() => { setOpenMenuId(null); setDeleteConfirm(customer); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete Customer
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 text-sm border rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold">
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
                  <a href={`mailto:${selected.email}`} className="text-sm text-primary hover:text-primary transition-colors">{selected.email}</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                  <a href={`tel:${selected.phone}`} className="text-sm text-gray-700">{selected.phone}</a>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <ShoppingBag className="w-5 h-5 text-primary mx-auto mb-1" />
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeleteConfirm(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Customer</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to delete <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong> ({deleteConfirm.email})? This will permanently remove their account and all associated data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete Customer'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setBulkDeleteConfirm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Selected Customers</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to delete <strong>{selectedIds.size} customer{selectedIds.size !== 1 ? 's' : ''}</strong>? This will permanently remove their accounts and all associated data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setBulkDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete Selected'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
