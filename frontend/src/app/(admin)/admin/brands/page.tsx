'use client';

import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import Link from 'next/link';
import { Tag, Plus, RefreshCw, Edit2, X, Check, Image as ImageIcon, MoreVertical, Trash2, Upload, ChevronDown, ChevronRight, Package, ExternalLink } from 'lucide-react';
import { brandsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

function formatPrice(v: number) {
  return `R ${v.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

function BrandLogo({ url, name }: { url?: string; name: string }) {
  const [broken, setBroken] = useState(false);
  if (!url || broken) return <Tag className="w-4 h-4 text-violet-600" />;
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
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [brandProducts, setBrandProducts] = useState<Record<string, any[]>>({});
  const [loadingProducts, setLoadingProducts] = useState<string | null>(null);

  const handleLogoUpload = async (file: File) => {
    if (!token) return;
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_URL}/brands/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (data.url) setForm((p) => ({ ...p, imageUrl: data.url }));
      else setError(data.error || 'Upload failed');
    } catch {
      setError('Upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await brandsApi.list();
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
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', imageUrl: cat.logoUrl || '' });
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
        logoUrl: form.imageUrl.trim() || undefined,
      };
      if (editItem) {
        await brandsApi.update(token, editItem.id, payload);
      } else {
        await brandsApi.create(token, payload);
      }
      setShowForm(false);
      fetchCategories();
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!token || !deleteConfirm) return;
    setBusy(true);
    try {
      await brandsApi.delete(token, deleteConfirm.id);
      setDeleteConfirm(null);
      setActionMenuOpen(null);
      fetchCategories();
    } catch (e: any) {
      setError(e.message || 'Failed to delete');
    } finally { setBusy(false); }
  };

  const toggleExpand = async (brandId: string) => {
    if (expandedBrand === brandId) { setExpandedBrand(null); return; }
    setExpandedBrand(brandId);
    if (brandProducts[brandId]) return; // already loaded
    if (!token) return;
    setLoadingProducts(brandId);
    try {
      const products = await brandsApi.getProducts(token, brandId);
      setBrandProducts(prev => ({ ...prev, [brandId]: products || [] }));
    } catch { setBrandProducts(prev => ({ ...prev, [brandId]: [] })); }
    finally { setLoadingProducts(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} brands</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchCategories} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
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
          <div className="bg-white border border-gray-300 rounded-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">{editItem ? 'Edit Brand' : 'Add Brand'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Logo preview */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Logo preview"
                      className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs text-gray-500 block">Logo URL</label>
                  <input
                    value={form.imageUrl}
                    onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://... or leave empty to upload"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">— or —</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingLogo ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }}
                    />
                    {form.imageUrl && (
                      <button type="button" onClick={() => setForm((p) => ({ ...p, imageUrl: '' }))} className="text-xs text-gray-500 hover:text-red-600 transition-colors">
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Name *</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Brand name"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Slug <span className="text-gray-600">(auto-generated if empty)</span></label>
                <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="brand-slug"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 font-mono" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2} placeholder="Optional description"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-700 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors">
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white border border-gray-300 rounded-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Delete Brand</h2>
                <p className="text-gray-500 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              Are you sure you want to delete <span className="text-gray-900 font-medium">{deleteConfirm.name}</span>?
              {deleteConfirm._count?.products > 0 && (
                <span className="text-red-600 block mt-1">This brand has {deleteConfirm._count.products} product(s) associated with it.</span>
              )}
            </p>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-700 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" /> {busy ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-visible">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {['Logo', 'Brand', 'Slug', 'Description', 'Products', ''].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <Tag className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No brands yet</p>
                  <button onClick={openAdd} className="mt-3 text-sm text-violet-600 hover:text-violet-700 inline-flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add your first brand
                  </button>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <Fragment key={cat.id}>
                  {/* Brand row */}
                  <tr className={`hover:bg-gray-50 transition-colors ${expandedBrand === cat.id ? 'bg-violet-50/40' : ''}`}>
                    {/* Logo */}
                    <td className="px-5 py-4">
                      <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                        <BrandLogo url={cat.logoUrl} name={cat.name} />
                      </div>
                    </td>
                    {/* Name */}
                    <td className="px-5 py-4">
                      <span className="text-gray-900 font-semibold">{cat.name}</span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-400">{cat.slug}</td>
                    <td className="px-5 py-4 text-gray-500 text-sm max-w-[180px] truncate">{cat.description || '—'}</td>
                    {/* Products count — clickable to expand */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleExpand(cat.id)}
                        disabled={(cat._count?.products ?? 0) === 0}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                          (cat._count?.products ?? 0) === 0
                            ? 'text-gray-400 cursor-default'
                            : 'text-violet-600 hover:text-violet-800'
                        }`}
                      >
                        <Package className="w-3.5 h-3.5" />
                        {cat._count?.products ?? 0}
                        {(cat._count?.products ?? 0) > 0 && (
                          expandedBrand === cat.id
                            ? <ChevronDown className="w-3.5 h-3.5" />
                            : <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === cat.id ? null : cat.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {actionMenuOpen === cat.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[999] min-w-[120px]">
                            <button
                              onClick={() => { setActionMenuOpen(null); openEdit(cat); }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors rounded-t-lg"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => { setDeleteConfirm(cat); setActionMenuOpen(null); }}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors rounded-b-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded products panel */}
                  {expandedBrand === cat.id && (
                    <tr>
                      <td colSpan={6} className="px-0 py-0 bg-violet-50/30 border-t border-violet-100">
                        <div className="px-6 py-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-violet-800 flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5" /> Products under {cat.name}
                            </p>
                            <Link
                              href={`/admin/products?brand=${cat.id}`}
                              className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors"
                            >
                              View all <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>

                          {loadingProducts === cat.id ? (
                            <div className="space-y-2">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-10 bg-white rounded-lg animate-pulse border border-violet-100" />
                              ))}
                            </div>
                          ) : (brandProducts[cat.id] ?? []).length === 0 ? (
                            <p className="text-xs text-gray-400 py-2">No products found</p>
                          ) : (
                            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                              {(brandProducts[cat.id] ?? []).map((p: any) => (
                                <div
                                  key={p.id}
                                  className="flex items-center gap-3 bg-white border border-violet-100 rounded-lg px-3 py-2"
                                >
                                  {/* Thumbnail */}
                                  <div className="w-8 h-8 rounded-md bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                    {p.images?.[0]?.url
                                      ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                                      : <Package className="w-4 h-4 text-gray-400" />
                                    }
                                  </div>
                                  {/* Name + category */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                                    <p className="text-[10px] text-gray-400">{p.category?.name ?? '—'}</p>
                                  </div>
                                  {/* Price */}
                                  <span className="text-xs font-semibold text-gray-700 shrink-0">
                                    {formatPrice(p.sellingPrice)}
                                  </span>
                                  {/* Stock */}
                                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                                    p.stockQuantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                                  }`}>
                                    {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of stock'}
                                  </span>
                                  {/* Status */}
                                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                                    p.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {p.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                  {/* Edit link */}
                                  <Link
                                    href={`/admin/products/${p.id}/edit`}
                                    className="p-1 text-gray-400 hover:text-violet-600 transition-colors shrink-0"
                                    title="Edit product"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
