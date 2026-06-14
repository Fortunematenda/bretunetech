'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Truck, Plus, Search, X, Edit, Trash2, Mail, Phone,
  Globe, MapPin, ChevronRight, CheckCircle, AlertTriangle,
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
}

const empty = (): Omit<Supplier, 'id'> => ({
  name: '', contactPerson: '', email: '', phone: '',
  website: '', address: '', city: '', notes: '', isActive: true,
});

export default function AdminSuppliersPage() {
  const { token } = useAuthStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

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

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border ${
          toast.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-red-500/15 border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Suppliers</h1>
          <p className="text-slate-500 text-sm mt-0.5">{suppliers.length} suppliers (manage manually)</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Supplier', 'Contact', 'Location', 'Products', 'Status', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-3 bg-slate-800 rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-20 text-center">
                    <Truck className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No suppliers found</p>
                    <p className="text-slate-600 text-xs mt-1">Add suppliers manually below</p>
                    <button onClick={openAdd} className="mt-3 text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 mx-auto">
                      <Plus className="w-4 h-4" /> Add your first supplier
                    </button>
                  </td>
                </tr>
              ) : filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400 font-bold text-sm shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <p className="text-sm font-medium text-white">{s.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-300">{s.contactPerson}</p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400">{s.city}</td>
                  <td className="px-5 py-4 text-sm text-slate-300">—</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#13151c] border-l border-slate-800 z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400 font-bold">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{selected.name}</h2>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${selected.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {selected.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Contact */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Contact</p>
                <p className="text-sm text-white font-medium">{selected.contactPerson}</p>
                {selected.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <a href={`mailto:${selected.email}`} className="text-sm text-violet-400 hover:text-violet-300">{selected.email}</a>
                  </div>
                )}
                {selected.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <a href={`tel:${selected.phone}`} className="text-sm text-slate-300">{selected.phone}</a>
                  </div>
                )}
                {selected.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <a href={`https://${selected.website}`} target="_blank" rel="noreferrer" className="text-sm text-violet-400 hover:text-violet-300">{selected.website}</a>
                  </div>
                )}
              </div>

              {/* Address */}
              {(selected.address || selected.city) && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                    <div className="text-sm text-slate-300">
                      {selected.address && <p>{selected.address}</p>}
                      {selected.city && <p>{selected.city}</p>}
                    </div>
                  </div>
                </div>
              )}


              {/* Notes */}
              {selected.notes && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Notes</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{selected.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openEdit(selected)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(selected)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 text-sm font-medium rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
            <div className="bg-[#13151c] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                <h2 className="text-base font-semibold text-white">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {field('Supplier Name *', 'name', 'text', 'e.g. Scoop Technologies')}
                {field('Contact Person', 'contactPerson', 'text', 'e.g. John Smith')}
                <div className="grid grid-cols-2 gap-3">
                  {field('Email', 'email', 'email', 'sales@supplier.co.za')}
                  {field('Phone', 'phone', 'text', '+27 11 555 0000')}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {field('Website', 'website', 'text', 'supplier.co.za')}
                  {field('City', 'city', 'text', 'Johannesburg')}
                </div>
                {field('Address', 'address', 'text', '12 Business Park, Sandton')}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    placeholder="Additional notes about this supplier..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-violet-600' : 'bg-slate-700'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-sm text-slate-300">Active supplier</span>
                </div>
              </div>

              <div className="flex gap-3 px-5 py-4 border-t border-slate-800">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors">
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
    </div>
  );
}
