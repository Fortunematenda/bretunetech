'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, X, Plus, Trash2, Image as ImageIcon, Loader2,
  DollarSign, Package, Tag, Layers, AlertCircle, CheckCircle,
} from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';

interface ProductFormProps {
  productId?: string;
  initialData?: any;
}

const conditions = ['NEW', 'REFURBISHED'];
const defaultTags = ['Best Seller', 'Best Value', 'Premium', 'Load Shedding Ready', 'New', 'Popular'];

const SUPPLIERS = [
  'Scoop Technologies',
  'PowerPro SA',
  'NetSolutions',
  'Rectron',
  'Tarsus Technology',
  'Pinnacle',
  'First Distribution',
  'Axiz',
  'Hypertec',
  'Mustek',
];

export default function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || initialData?.category?.id || '',
    condition: initialData?.condition || 'NEW',
    costPrice: initialData?.costPrice ? String(initialData.costPrice) : '',
    markupPercent: '',
    sellingPrice: initialData?.sellingPrice ? String(initialData.sellingPrice) : '',
    stockQuantity: initialData?.stockQuantity !== undefined ? String(initialData.stockQuantity) : '',
    lowStockThreshold: initialData?.lowStockThreshold !== undefined ? String(initialData.lowStockThreshold) : '5',
    supplierName: initialData?.supplierName || '',
    sku: initialData?.sku || '',
    isFeatured: initialData?.isFeatured || false,
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  });

  const [images, setImages] = useState<{ url: string; altText: string; isPrimary: boolean }[]>(
    initialData?.images?.map((img: any) => ({
      url: img.url,
      altText: img.altText || '',
      isPrimary: img.isPrimary || false,
    })) || []
  );
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const handleImageError = (idx: number) => {
    setImageErrors((prev) => ({ ...prev, [idx]: true }));
  };

  const [tags, setTags] = useState<string[]>(
    initialData?.tags?.map((t: any) => t.tag || t) || []
  );
  const [customTag, setCustomTag] = useState('');

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  // Auto-calculate selling price from cost + markup
  useEffect(() => {
    const cost = parseFloat(form.costPrice);
    const markup = parseFloat(form.markupPercent);
    if (cost > 0 && markup >= 0) {
      const sp = Math.round(cost * (1 + markup / 100));
      setForm((f) => ({ ...f, sellingPrice: String(sp) }));
    }
  }, [form.costPrice, form.markupPercent]);

  const set = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.description.trim() || form.description.length < 10) e.description = 'Description must be at least 10 characters';
    if (!form.categoryId) e.categoryId = 'Category is required';
    if (!form.costPrice || parseFloat(form.costPrice) <= 0) e.costPrice = 'Cost price must be positive';
    if (!form.sellingPrice || parseFloat(form.sellingPrice) <= 0) e.sellingPrice = 'Selling price must be positive';
    if (form.stockQuantity === '' || parseInt(form.stockQuantity) < 0) e.stockQuantity = 'Stock must be 0 or more';
    return e;
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!token) return;

    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId,
        condition: form.condition,
        costPrice: parseFloat(form.costPrice),
        sellingPrice: parseFloat(form.sellingPrice),
        stockQuantity: parseInt(form.stockQuantity || '0'),
        lowStockThreshold: parseInt(form.lowStockThreshold || '5'),
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };
      if (form.supplierName) payload.supplierName = form.supplierName.trim();
      if (form.sku) payload.sku = form.sku.trim();
      if (images.length > 0) payload.images = images;
      if (tags.length > 0) payload.tags = tags;

      if (productId) {
        await productsApi.update(token, productId, payload);
        showToast('success', 'Product updated successfully');
      } else {
        await productsApi.create(token, payload);
        showToast('success', 'Product created successfully');
        setTimeout(() => router.push('/admin/products'), 1200);
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const addImage = () => {
    setImages((prev) => [...prev, { url: '', altText: '', isPrimary: prev.length === 0 }]);
    setImageErrors((prev) => ({ ...prev, [images.length]: false }));
  };

  const updateImage = (idx: number, field: string, value: string | boolean) => {
    setImages((prev) => prev.map((img, i) => i === idx ? { ...img, [field]: value } : img));
    // Clear error when URL changes
    if (field === 'url') {
      setImageErrors((prev) => ({ ...prev, [idx]: false }));
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length > 0 && !next.some((i) => i.isPrimary)) next[0].isPrimary = true;
      return next;
    });
    // Clean up error state for removed image
    setImageErrors((prev) => {
      const newErrors: Record<number, boolean> = {};
      Object.keys(prev).forEach((key) => {
        const i = parseInt(key);
        if (i !== idx) {
          newErrors[i < idx ? i : i - 1] = prev[i];
        }
      });
      return newErrors;
    });
  };

  const setPrimary = (idx: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === idx })));
  };

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !tags.includes(t)) { setTags((prev) => [...prev, t]); }
    setCustomTag('');
  };

  const margin = form.costPrice && form.sellingPrice
    ? Math.round(((parseFloat(form.sellingPrice) - parseFloat(form.costPrice)) / parseFloat(form.costPrice)) * 100)
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border ${
          toast.type === 'success'
            ? 'bg-green-500/15 border-green-500/30 text-green-400'
            : 'bg-red-500/15 border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left Column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-violet-400" /> Basic Information
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Ubiquiti UniFi U6 Lite Access Point"
                className={`w-full px-3 py-2.5 bg-slate-800 border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors ${errors.name ? 'border-red-500' : 'border-slate-700'}`}
              />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Description *</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe the product features, specs, and benefits..."
                className={`w-full px-3 py-2.5 bg-slate-800 border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none ${errors.description ? 'border-red-500' : 'border-slate-700'}`}
              />
              <div className="flex justify-between mt-1">
                {errors.description ? <p className="text-xs text-red-400">{errors.description}</p> : <span />}
                <span className={`text-xs ${form.description.length < 10 ? 'text-red-400' : 'text-slate-500'}`}>{form.description.length}/5000</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Category *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => set('categoryId', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-slate-800 border rounded-lg text-sm text-slate-300 focus:outline-none focus:border-violet-500 transition-colors ${errors.categoryId ? 'border-red-500' : 'border-slate-700'}`}
                >
                  <option value="">Select category...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p className="text-xs text-red-400 mt-1">{errors.categoryId}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Condition *</label>
                <div className="flex gap-2">
                  {conditions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set('condition', c)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        form.condition === c
                          ? c === 'NEW'
                            ? 'bg-green-500/15 border-green-500/40 text-green-400'
                            : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-violet-400" /> Pricing
            </h2>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Cost Price (R) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(e) => set('costPrice', e.target.value)}
                    placeholder="0.00"
                    className={`w-full pl-7 pr-3 py-2.5 bg-slate-800 border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors ${errors.costPrice ? 'border-red-500' : 'border-slate-700'}`}
                  />
                </div>
                {errors.costPrice && <p className="text-xs text-red-400 mt-1">{errors.costPrice}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Markup %</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={form.markupPercent}
                    onChange={(e) => set('markupPercent', e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full pr-7 pl-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Auto-fills selling price</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Selling Price (R) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sellingPrice}
                    onChange={(e) => { set('sellingPrice', e.target.value); set('markupPercent', ''); }}
                    placeholder="0.00"
                    className={`w-full pl-7 pr-3 py-2.5 bg-slate-800 border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors ${errors.sellingPrice ? 'border-red-500' : 'border-slate-700'}`}
                  />
                </div>
                {errors.sellingPrice && <p className="text-xs text-red-400 mt-1">{errors.sellingPrice}</p>}
              </div>
            </div>

            {/* Margin indicator */}
            {margin !== null && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                margin < 0 ? 'bg-red-500/10 border-red-500/25 text-red-400'
                : margin < 15 ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                : 'bg-green-500/10 border-green-500/25 text-green-400'
              }`}>
                <DollarSign className="w-3.5 h-3.5" />
                Margin: {margin}% — Gross profit: {formatPrice(parseFloat(form.sellingPrice) - parseFloat(form.costPrice))}
                {margin < 10 && ' ⚠ Low margin'}
              </div>
            )}
          </section>

          {/* Inventory */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" /> Inventory & Supplier
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) => set('stockQuantity', e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2.5 bg-slate-800 border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors ${errors.stockQuantity ? 'border-red-500' : 'border-slate-700'}`}
                />
                {errors.stockQuantity && <p className="text-xs text-red-400 mt-1">{errors.stockQuantity}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Low Stock Alert</label>
                <input
                  type="number"
                  min="0"
                  value={form.lowStockThreshold}
                  onChange={(e) => set('lowStockThreshold', e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <p className="text-[10px] text-slate-500 mt-1">Alert when stock falls below this</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Supplier</label>
                <select
                  value={SUPPLIERS.includes(form.supplierName) ? form.supplierName : form.supplierName ? '__custom__' : ''}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') return;
                    set('supplierName', e.target.value);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="">— None —</option>
                  {SUPPLIERS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  {form.supplierName && !SUPPLIERS.includes(form.supplierName) && (
                    <option value={form.supplierName}>{form.supplierName}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => set('sku', e.target.value)}
                  placeholder="e.g. UBQ-U6-LITE"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-violet-400" /> Product Images
              </h2>
              <button
                type="button"
                onClick={addImage}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-400 border border-violet-500/30 rounded-lg hover:bg-violet-600/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Image URL
              </button>
            </div>

            {images.length === 0 ? (
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center">
                <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No images yet</p>
                <p className="text-slate-600 text-xs mt-1">Add image URLs from your hosting or CDN</p>
                <button
                  type="button"
                  onClick={addImage}
                  className="mt-3 text-xs text-violet-400 hover:text-cyan-300 transition-colors"
                >
                  + Add first image
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {images.map((img, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 bg-slate-800 rounded-xl border border-slate-700">
                    {/* Preview */}
                    <div className="w-14 h-14 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-700 flex items-center justify-center relative">
                      {img.url && !imageErrors[idx] ? (
                        <img 
                          src={img.url} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={() => handleImageError(idx)} 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full">
                          <ImageIcon className={`w-5 h-5 ${imageErrors[idx] ? 'text-red-400' : 'text-slate-600'}`} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <input
                        type="text"
                        value={img.url}
                        onChange={(e) => updateImage(idx, 'url', e.target.value)}
                        placeholder="https://example.com/image.jpg or /assets/products-pics/image.jpg"
                        className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 ${imageErrors[idx] ? 'border-red-500/50' : 'border-slate-600'}`}
                      />
                      {imageErrors[idx] && (
                        <p className="text-xs text-red-400">Image failed to load. Check URL or use a different image host.</p>
                      )}
                      <input
                        type="text"
                        value={img.altText}
                        onChange={(e) => updateImage(idx, 'altText', e.target.value)}
                        placeholder="Alt text (for accessibility)"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-xs text-slate-400 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPrimary(idx)}
                        title="Set as primary"
                        className={`p-1.5 rounded-lg text-xs transition-colors ${img.isPrimary ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-amber-400'}`}
                      >
                        ★
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="space-y-6">

          {/* Publish */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white">Publish Settings</h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <div>
                  <p className="text-sm text-slate-300 font-medium">Active</p>
                  <p className="text-xs text-slate-500">Visible on store</p>
                </div>
                <button
                  type="button"
                  onClick={() => set('isActive', !form.isActive)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-violet-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </label>

              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <div>
                  <p className="text-sm text-slate-300 font-medium">Featured</p>
                  <p className="text-xs text-slate-500">Show on homepage</p>
                </div>
                <button
                  type="button"
                  onClick={() => set('isFeatured', !form.isFeatured)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isFeatured ? 'bg-amber-500' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </label>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-900 disabled:text-slate-400 text-sm font-semibold rounded-lg transition-colors"
              >
                {saving ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <><Save className="w-4 h-4" /> {productId ? 'Update Product' : 'Create Product'}</>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white text-sm rounded-lg transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </section>

          {/* Tags */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-violet-400" /> Product Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {defaultTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    tags.includes(tag)
                      ? 'bg-violet-600/15 border-violet-500/40 text-violet-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                placeholder="Custom tag..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.filter((t) => !defaultTags.includes(t)).map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">
                    {tag}
                    <button type="button" onClick={() => toggleTag(tag)} className="hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <section className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Fix these errors:
              </p>
              <ul className="space-y-1">
                {Object.values(errors).map((e, i) => (
                  <li key={i} className="text-xs text-red-300">• {e}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </form>
  );
}
