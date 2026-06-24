'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck, Plus, Search, X, Edit, Trash2, Mail, Phone,
  Globe, MapPin, ChevronRight, CheckCircle, AlertTriangle, Columns, CheckSquare,
  MoreVertical, Eye, ExternalLink, Check,
} from 'lucide-react';
import { suppliersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  notes: string;
  isActive: boolean;
  createdAt?: string;
}

const empty = (): Omit<Supplier, 'id'> => ({
  name: '', contactPerson: '', email: '', phone: '',
  website: '', address: '', city: '', notes: '', isActive: true,
});

export default function AdminSuppliersPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [colOpen, setColOpen] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  type ColKey = 'contactPerson' | 'email' | 'phone' | 'website' | 'city' | 'address' | 'notes' | 'status' | 'createdAt';
  const ALL_COLS: { key: ColKey; label: string }[] = [
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'email',         label: 'Email' },
    { key: 'phone',         label: 'Phone' },
    { key: 'website',       label: 'Website' },
    { key: 'city',          label: 'City' },
    { key: 'address',       label: 'Address' },
    { key: 'notes',         label: 'Notes' },
    { key: 'status',        label: 'Status' },
    { key: 'createdAt',     label: 'Created' },
  ];
  const DEFAULT_COLS: ColKey[] = ['contactPerson', 'email', 'city', 'status'];
  const [visibleCols, setVisibleCols] = useState<ColKey[]>(DEFAULT_COLS);
  useEffect(() => {
    try { const s = localStorage.getItem('admin_suppliers_cols'); if (s) setVisibleCols(JSON.parse(s)); } catch { /* ignore */ }
  }, []);
  const toggleCol = (key: ColKey) => setVisibleCols((prev) => {
    const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
    localStorage.setItem('admin_suppliers_cols', JSON.stringify(next)); return next;
  });
  const col = (key: ColKey) => visibleCols.includes(key);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await suppliersApi.list();
      setSuppliers(data);
    } catch {
      showToast('error', 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const openAdd = () => {
    setEditing(null);
    setForm(empty());
    setModalOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ name: s.name, contactPerson: s.contactPerson || '', email: s.email || '', phone: s.phone || '', website: s.website || '', address: s.address || '', city: s.city || '', notes: s.notes || '', isActive: s.isActive });
    setSelected(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return showToast('error', 'Supplier name is required');
    if (!token) return;
    setSaving(true);
    try {
      if (editing) {
        await suppliersApi.update(token, editing.id, form);
        showToast('success', `"${form.name}" updated`);
      } else {
        await suppliersApi.create(token, form);
        showToast('success', `"${form.name}" added`);
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save supplier');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: Supplier) => {
    if (!confirm(`Delete "${s.name}"?`)) return;
    if (!token) return;
    try {
      await suppliersApi.delete(token, s.id);
      if (selected?.id === s.id) setSelected(null);
      showToast('success', `"${s.name}" deleted`);
      fetchSuppliers();
    } catch {
      showToast('error', 'Failed to delete supplier');
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
      setSelectedIds(new Set(filtered.map(s => s.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!token || selectedIds.size === 0) return;
    setDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => suppliersApi.delete(token, id)));
      setSuppliers(suppliers.filter(s => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
      showToast('success', `${selectedIds.size} supplier${selectedIds.size !== 1 ? 's' : ''} deleted`);
    } catch {
      showToast('error', 'Failed to delete suppliers');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{suppliers.length} suppliers (manage manually)</p>
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
                    <button onClick={() => { const all = ALL_COLS.map(c => c.key); setVisibleCols(all); localStorage.setItem('admin_suppliers_cols', JSON.stringify(all)); }} className="flex-1 py-2 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">Show all</button>
                    <div className="w-px bg-gray-700" />
                    <button onClick={() => { setVisibleCols(DEFAULT_COLS); localStorage.setItem('admin_suppliers_cols', JSON.stringify(DEFAULT_COLS)); }} className="flex-1 py-2 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">Reset</button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500"
        />
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-violet-700 font-medium">{selectedIds.size} supplier{selectedIds.size !== 1 ? 's' : ''} selected</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedIds(new Set())} className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={() => setBulkDeleteConfirm(true)} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-5 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
                {col('contactPerson') && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>}
                {col('email')         && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>}
                {col('phone')         && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>}
                {col('website')       && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Website</th>}
                {col('city')          && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">City</th>}
                {col('address')       && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>}
                {col('notes')         && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>}
                {col('status')        && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>}
                {col('createdAt')     && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>}
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-4" /></td>
                    <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-28" /></td>
                    {col('contactPerson') && <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>}
                    {col('email')         && <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-32" /></td>}
                    {col('phone')         && <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>}
                    {col('website')       && <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>}
                    {col('city')          && <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-16" /></td>}
                    {col('address')       && <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-28" /></td>}
                    {col('notes')         && <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>}
                    {col('status')        && <td className="px-5 py-4"><div className="h-5 bg-gray-100 rounded-full w-14" /></td>}
                    {col('createdAt')     && <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-20" /></td>}
                    <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-4" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-5 py-20 text-center">
                    <Truck className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No suppliers found</p>
                    <p className="text-gray-600 text-xs mt-1">Add suppliers manually below</p>
                    <button onClick={openAdd} className="mt-3 text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1 mx-auto">
                      <Plus className="w-4 h-4" /> Add your first supplier
                    </button>
                  </td>
                </tr>
              ) : filtered.map((s, rowIndex) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s.id)}
                      onChange={() => toggleSelect(s.id)}
                      className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                  </td>
                  <td className="px-5 py-4 cursor-pointer" onClick={() => router.push(`/admin/suppliers/${s.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 font-bold text-sm shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    </div>
                  </td>
                  {col('contactPerson') && <td className="px-5 py-4 text-sm text-gray-700">{s.contactPerson || '—'}</td>}
                  {col('email')         && <td className="px-5 py-4 text-xs text-gray-500">{s.email ? <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-gray-600" />{s.email}</span> : '—'}</td>}
                  {col('phone')         && <td className="px-5 py-4 text-xs text-gray-500">{s.phone ? <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-600" />{s.phone}</span> : '—'}</td>}
                  {col('website')       && <td className="px-5 py-4 text-xs text-violet-600">{s.website ? <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" />{s.website}</span> : '—'}</td>}
                  {col('city')          && <td className="px-5 py-4 text-sm text-gray-500">{s.city || '—'}</td>}
                  {col('address')       && <td className="px-5 py-4 text-xs text-gray-500">{s.address || '—'}</td>}
                  {col('notes')         && <td className="px-5 py-4 text-xs text-gray-500 max-w-[160px] truncate">{s.notes || '—'}</td>}
                  {col('status') && (
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-700 text-gray-500'
                      }`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                  )}
                  {col('createdAt')     && <td className="px-5 py-4 text-xs text-gray-500">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>}
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="relative flex justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === s.id ? null : s.id); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === s.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className={`absolute right-0 z-20 w-48 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden ${
                            rowIndex >= filtered.length - 3 ? 'bottom-8' : 'top-8'
                          }`}>
                            <button
                              onClick={() => { setOpenMenuId(null); setSelected(s); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Quick Preview
                            </button>
                            <button
                              onClick={() => { setOpenMenuId(null); router.push(`/admin/suppliers/${s.id}`); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-violet-600 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View Details
                            </button>
                            <button
                              onClick={() => { setOpenMenuId(null); openEdit(s); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit Supplier
                            </button>
                            <div className="border-t border-gray-200 mx-2" />
                            <button
                              onClick={() => { setOpenMenuId(null); handleDelete(s); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 font-bold">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{selected.name}</h2>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${selected.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-700 text-gray-500'}`}>
                    {selected.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Contact */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Contact</p>
                <p className="text-sm text-gray-900 font-medium">{selected.contactPerson}</p>
                {selected.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <a href={`mailto:${selected.email}`} className="text-sm text-violet-600 hover:text-violet-700">{selected.email}</a>
                  </div>
                )}
                {selected.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <a href={`tel:${selected.phone}`} className="text-sm text-gray-700">{selected.phone}</a>
                  </div>
                )}
                {selected.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <a href={`https://${selected.website}`} target="_blank" rel="noreferrer" className="text-sm text-violet-600 hover:text-violet-700">{selected.website}</a>
                  </div>
                )}
              </div>

              {/* Address */}
              {(selected.address || selected.city) && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 mt-0.5 shrink-0" />
                    <div className="text-sm text-gray-700">
                      {selected.address && <p>{selected.address}</p>}
                      {selected.city && <p>{selected.city}</p>}
                    </div>
                  </div>
                </div>
              )}


              {/* Notes */}
              {selected.notes && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Notes</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{selected.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openEdit(selected)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(selected)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-sm font-medium rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => { setSelected(null); router.push(`/admin/suppliers/${selected.id}`); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Open Full Page
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
            <div className="bg-white border border-gray-300 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {field('Supplier Name *', 'name', 'text', 'Company name')}
                {field('Contact Person', 'contactPerson', 'text', 'Full name')}
                <div className="grid grid-cols-2 gap-3">
                  {field('Email', 'email', 'email', 'Email address')}
                  {field('Phone', 'phone', 'text', 'Phone number')}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {field('Website', 'website', 'text', 'Website URL')}
                  {field('City', 'city', 'text', 'City')}
                </div>
                {field('Address', 'address', 'text', 'Street address')}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    placeholder="Internal notes"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-violet-600' : 'bg-gray-700'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-sm text-gray-700">Active supplier</span>
                </div>
              </div>

              <div className="flex gap-3 px-5 py-4 border-t border-gray-200">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Supplier'}
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
                  <h3 className="text-lg font-semibold text-gray-900">Delete Selected Suppliers</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to delete <strong>{selectedIds.size} supplier{selectedIds.size !== 1 ? 's' : ''}</strong>? This will permanently remove their accounts and all associated data.
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
