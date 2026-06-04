'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, RefreshCw, Edit2, X, Check, Image as ImageIcon } from 'lucide-react';
import { categoriesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

function BrandLogo({ url, name }: { url?: string; name: string }) {
  const [broken, setBroken] = useState(false);
  if (!url || broken) return <Tag className="w-4 h-4 text-violet-400" />;
  return (
    <img
      src={url}
      alt={name}
      className="w-full h-full object-contain p-1"
      onError={() => setBroken(true)}
    />
  );
}

export default function AdminBrandsPage() {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', imageUrl: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.list();
      setCategories(Array.isArray(data) ? data : []);
    } catch { setCategories([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', slug: '', description: '', imageUrl: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (cat: any) => {
    setEditItem(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', imageUrl: cat.imageUrl || '' });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!token || !form.name.trim()) return;
    setBusy(true); setError('');
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: form.description.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
      };
      if (editItem) {
        await categoriesApi.update(token, editItem.id, payload);
      } else {
        await categoriesApi.create(token, payload);
      }
      setShowForm(false);
      fetchCategories();
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Brands / Categories</h1>
          <p className="text-slate-500 text-sm mt-0.5">{categories.length} categories</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchCategories} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Brand
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-[#1a1d27] border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">{editItem ? 'Edit Brand' : 'Add Brand'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Logo preview */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Logo preview"
                      className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-600" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-1 block">Logo URL</label>
                  <input
                    value={form.imageUrl}
                    onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="e.g. /assets/brands/mikrotik.svg"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      { label: 'MikroTik', path: '/assets/brands/mikrotik.svg' },
                      { label: 'Ubiquiti', path: '/assets/brands/ubiquiti.png' },
                      { label: 'MUST (svg)', path: '/assets/brands/must.svg' },
                      { label: 'MUST (png)', path: '/assets/brands/must.png' },
                    ].map((b) => (
                      <button
                        key={b.path}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, imageUrl: b.path }))}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                          form.imageUrl === b.path
                            ? 'bg-violet-600 border-violet-500 text-white'
                            : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Name *</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. MikroTik"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Slug <span className="text-slate-600">(auto-generated if empty)</span></label>
                <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="e.g. mikrotik"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2} placeholder="Optional description"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={busy || !form.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                <Check className="w-4 h-4" /> {busy ? 'Saving...' : editItem ? 'Save Changes' : 'Add Brand'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Logo', 'Name', 'Slug', 'Description', 'Products', ''].map((h) => (
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
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <Tag className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No brands yet</p>
                  <button onClick={openAdd} className="mt-3 text-sm text-violet-400 hover:text-violet-300 inline-flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add your first brand
                  </button>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-800/30 transition-colors">
                  {/* Logo cell */}
                  <td className="px-5 py-4">
                    <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                      <BrandLogo url={cat.imageUrl} name={cat.name} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-slate-200 font-medium">{cat.name}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{cat.slug}</td>
                  <td className="px-5 py-4 text-slate-400 text-sm max-w-[180px] truncate">{cat.description || '—'}</td>
                  <td className="px-5 py-4 text-slate-400 text-sm">{cat._count?.products ?? '—'}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => openEdit(cat)}
                      className="p-1.5 text-slate-500 hover:text-violet-400 rounded-lg hover:bg-slate-800 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
