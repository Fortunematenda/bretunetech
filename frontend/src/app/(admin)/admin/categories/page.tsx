'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutGrid, Plus, RefreshCw, Edit2, X, Check, MoreVertical, Trash2, Upload, AlertCircle } from 'lucide-react';
import { categoriesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

export default function AdminCategoriesPage() {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', parentId: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [filters, setFilters] = useState({ name: '', parent: '' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importBusy, setImportBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.list(true);
      const sorted = Array.isArray(data) ? data.sort((a, b) => a.name.localeCompare(b.name)) : [];
      setCategories(sorted);
      setAllCategories(sorted);
    } catch { setCategories([]); setAllCategories([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', slug: '', description: '', parentId: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (cat: any) => {
    setEditItem(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', parentId: cat.parentId || '' });
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
        parentId: form.parentId || undefined,
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

  const handleDelete = async () => {
    if (!token || !deleteConfirm) return;
    setBusy(true);
    try {
      await categoriesApi.delete(token, deleteConfirm.id);
      setDeleteConfirm(null);
      setActionMenuOpen(null);
      fetchCategories();
    } catch (e: any) {
      setError(e.message || 'Failed to delete');
    } finally { setBusy(false); }
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
    if (selectedIds.size === filteredCategories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCategories.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!token || selectedIds.size === 0) return;
    setBusy(true);
    try {
      await categoriesApi.bulkDelete(token, Array.from(selectedIds));
      setBulkDeleteConfirm(false);
      setSelectedIds(new Set());
      fetchCategories();
    } catch (e: any) {
      setError(e.message || 'Failed to bulk delete');
    } finally { setBusy(false); }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setImportBusy(true);
    setError('');
    try {
      const result = await categoriesApi.bulkImport(token, file);
      setImportResult(result);
      fetchCategories();
    } catch (e: any) {
      setError(e.message || 'Failed to import categories');
    } finally {
      setImportBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredCategories = categories.filter(cat => {
    const nameMatch = cat.name.toLowerCase().includes(filters.name.toLowerCase());
    const parentMatch = !filters.parent || 
      (cat.parent?.name?.toLowerCase().includes(filters.parent.toLowerCase())) ||
      (!cat.parent && filters.parent.toLowerCase() === 'none');
    return nameMatch && parentMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Product Categories</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} categories</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchCategories} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importBusy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" /> {importBusy ? 'Importing...' : 'Import CSV'}
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white border border-gray-300 rounded-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">{editItem ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Parent Category</label>
                <select
                  name="parentId"
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-violet-500"
                >
                  <option value="">None (Main Category)</option>
                  {allCategories.filter(c => !c.parentId).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                <input
                  name="name"
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))}
                  placeholder="Category name"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Slug</label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="power-solutions"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description..."
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500"
                />
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
                <Check className="w-4 h-4" /> {busy ? 'Saving...' : editItem ? 'Save Changes' : 'Add Category'}
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
                <h2 className="text-base font-semibold text-gray-900">Delete Category</h2>
                <p className="text-gray-500 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              Are you sure you want to delete <span className="text-gray-900 font-medium">{deleteConfirm.name}</span>?
              {deleteConfirm._count?.products > 0 && (
                <span className="text-red-600 block mt-1">This category has {deleteConfirm._count.products} product(s) — they will lose their category.</span>
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

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-lg px-4 py-3">
          <span className="text-sm text-violet-900 font-medium">
            {selectedIds.size} categor{selectedIds.size === 1 ? 'y' : 'ies'} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
            >
              Clear selection
            </button>
            <button
              onClick={() => setBulkDeleteConfirm(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Import Result Modal */}
      {importResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setImportResult(null)}>
          <div className="bg-white border border-gray-300 rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Import Results</h2>
              <button onClick={() => setImportResult(null)} className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{importResult.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                <div className="text-xs text-gray-500">Imported</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                <div className="text-xs text-gray-500">Failed</div>
              </div>
            </div>
            {importResult.results?.some((r: any) => !r.success) && (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {importResult.results.filter((r: any) => !r.success).map((r: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>{r.name}</strong>: {r.error}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setImportResult(null)} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setBulkDeleteConfirm(false)}>
          <div className="bg-white border border-gray-300 rounded-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Delete {selectedIds.size} Categories</h2>
                <p className="text-gray-500 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              Are you sure you want to delete <span className="text-gray-900 font-medium">{selectedIds.size} categor{selectedIds.size === 1 ? 'y' : 'ies'}</span>?
              Products in these categories will lose their category reference.
            </p>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setBulkDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleBulkDelete} disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" /> {busy ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-visible">
        <div className="px-5 py-3 border-b border-gray-200 flex gap-3">
          <input
            placeholder="Filter by name..."
            value={filters.name}
            onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500 placeholder:text-gray-500"
          />
          <input
            placeholder="Filter by parent..."
            value={filters.parent}
            onChange={(e) => setFilters(f => ({ ...f, parent: e.target.value }))}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500 placeholder:text-gray-500"
          />
          {(filters.name || filters.parent) && (
            <button
              onClick={() => setFilters({ name: '', parent: '' })}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-5 py-3 text-left">
                <input
                  type="checkbox"
                  checked={filteredCategories.length > 0 && selectedIds.size === filteredCategories.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
              </th>
              {['Name', 'Slug', 'Parent', 'Description', 'Products', ''].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <LayoutGrid className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No categories match your filters</p>
                  <button onClick={() => setFilters({ name: '', parent: '' })} className="mt-3 text-sm text-violet-600 hover:text-violet-700 inline-flex items-center gap-1">
                    Clear filters
                  </button>
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id} className={`hover:bg-gray-100/30 transition-colors ${selectedIds.has(cat.id) ? 'bg-violet-50/50' : ''}`}>
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(cat.id)}
                      onChange={() => toggleSelect(cat.id)}
                      className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-900 font-medium">{cat.name}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-500">{cat.slug}</td>
                  <td className="px-5 py-4 text-gray-500 text-sm">{cat.parentId ? allCategories.find(c => c.id === cat.parentId)?.name || '—' : '—'}</td>
                  <td className="px-5 py-4 text-gray-500 text-sm max-w-[200px] truncate">{cat.description || '—'}</td>
                  <td className="px-5 py-4 text-gray-500 text-sm">{cat._count?.products ?? '—'}</td>
                  <td className="px-5 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === cat.id ? null : cat.id)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                      {actionMenuOpen === cat.id && (
                        <div className="absolute right-0 top-full mt-1 bg-gray-100 border border-gray-300 rounded-lg shadow-xl z-[999] min-w-[120px]">
                          <button
                            onClick={() => { setActionMenuOpen(null); openEdit(cat); }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:text-white hover:bg-gray-700 flex items-center gap-2 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => { setDeleteConfirm(cat); setActionMenuOpen(null); }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:text-red-600 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
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
