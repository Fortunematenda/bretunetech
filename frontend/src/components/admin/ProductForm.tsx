'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, X, Plus, Trash2, Image as ImageIcon, Loader2,
  DollarSign, Package, Tag, Layers, AlertCircle, CheckCircle,
  FileText, File, BookOpen, Search, Sparkles, Globe,
} from 'lucide-react';
import { productsApi, categoriesApi, brandsApi, suppliersApi, seoApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';

interface ProductFormProps {
  productId?: string;
  initialData?: any;
}

const conditions = ['NEW', 'REFURBISHED'];
const defaultTags = ['Best Seller', 'Best Value', 'Premium', 'Load Shedding Ready', 'New', 'Popular'];

export default function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
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
    originalPrice: initialData?.originalPrice ? String(initialData.originalPrice) : '',
    discountExpiresAt: initialData?.discountExpiresAt ? new Date(initialData.discountExpiresAt).toISOString().slice(0, 16) : '',
    stockQuantity: initialData?.stockQuantity !== undefined ? String(initialData.stockQuantity) : '',
    stockCpt: initialData?.stockCpt !== undefined ? String(initialData.stockCpt) : '0',
    stockJhb: initialData?.stockJhb !== undefined ? String(initialData.stockJhb) : '0',
    stockDbn: initialData?.stockDbn !== undefined ? String(initialData.stockDbn) : '0',
    lowStockThreshold: initialData?.lowStockThreshold !== undefined ? String(initialData.lowStockThreshold) : '5',
    supplierName: initialData?.supplierName || '',
    sku: initialData?.sku || '',
    shippingDays: initialData?.shippingDays !== undefined ? String(initialData.shippingDays) : '3',
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

  const [brandId, setBrandId] = useState<string>(initialData?.brandId || initialData?.brand?.id || '');
  const [tags, setTags] = useState<string[]>(
    initialData?.tags?.map((t: any) => t.tag || t) || []
  );
  const [customTag, setCustomTag] = useState('');

  // Specifications state (key-value pairs)
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>(
    initialData?.specifications?.length
      ? initialData.specifications
      : []
  );
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  // Manual/document URL
  const [manualUrl, setManualUrl] = useState(initialData?.manualUrl || '');
  const [docUploading, setDocUploading] = useState(false);
  const [docUploadError, setDocUploadError] = useState('');

  const handleDocUpload = async (file: File) => {
    if (!token) return;
    setDocUploading(true);
    setDocUploadError('');
    try {
      const formData = new FormData();
      formData.append('document', file);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${API_URL}/products/upload-document`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setManualUrl(data.url);
    } catch (err: any) {
      setDocUploadError(err?.message || 'Upload failed');
    } finally {
      setDocUploading(false);
    }
  };

  // Additional Information
  const [additionalInfo, setAdditionalInfo] = useState(initialData?.additionalInfo || '');

  // SEO fields
  const [seoFields, setSeoFields] = useState({
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    focusKeyword: initialData?.focusKeyword || '',
  });
  const [seoScore] = useState<number | null>(initialData?.seoScore ?? null);
  const [seoStatus] = useState<string | null>(initialData?.seoStatus ?? null);
  const [generatingSeo, setGeneratingSeo] = useState(false);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
    brandsApi.list().then(setBrands).catch(() => {});
    suppliersApi.list(true).then(setSuppliers).catch(() => {});
  }, []);

  // Sync additional fields when initialData changes (fixes first-load issue)
  useEffect(() => {
    if (initialData) {
      setSpecifications(initialData.specifications?.length ? initialData.specifications : []);
      setManualUrl(initialData.manualUrl || '');
      setAdditionalInfo(initialData.additionalInfo || '');
      setSeoFields({
        metaTitle: initialData.metaTitle || '',
        metaDescription: initialData.metaDescription || '',
        focusKeyword: initialData.focusKeyword || '',
      });
    }
  }, [initialData?.id, initialData?.specifications, initialData?.manualUrl, initialData?.additionalInfo]);

  const handleGenerateSeo = async () => {
    if (!productId || !token) return;
    setGeneratingSeo(true);
    try {
      const data = await seoApi.getProductSeo(productId);
      setSeoFields({
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        focusKeyword: data.focusKeyword || '',
      });
    } catch {
      // fallback: generate locally from form values
      const name = form.name.trim();
      if (name) {
        const brand = brands.find(b => b.id === brandId);
        const cat = categories.find(c => c.id === form.categoryId);
        const title = `${name} | BretuneTech South Africa`;
        const desc = form.description.replace(/<[^>]*>/g, '').substring(0, 155).trim();
        setSeoFields({
          metaTitle: title.length > 65 ? `${name.substring(0, 50).trim()} | BretuneTech` : title,
          metaDescription: desc || `Shop ${brand?.name || ''} ${name} from BretuneTech. Fast delivery across South Africa.`,
          focusKeyword: `${brand?.name || ''} ${name.split(' ').slice(0, 3).join(' ')}`.trim(),
        });
      }
    } finally {
      setGeneratingSeo(false);
    }
  };

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
        stockCpt: parseInt(form.stockCpt || '0'),
        stockJhb: parseInt(form.stockJhb || '0'),
        stockDbn: parseInt(form.stockDbn || '0'),
        lowStockThreshold: parseInt(form.lowStockThreshold || '5'),
        shippingDays: parseInt(form.shippingDays || '3'),
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };
      if (form.originalPrice) payload.originalPrice = parseFloat(form.originalPrice);
      if (form.discountExpiresAt) payload.discountExpiresAt = new Date(form.discountExpiresAt).toISOString();
      if (form.supplierName) payload.supplierName = form.supplierName.trim();
      if (form.sku) payload.sku = form.sku.trim();
      // Filter out images with empty URLs
      const validImages = images.filter((img) => img.url && img.url.trim() !== '');
      if (validImages.length > 0) payload.images = validImages;
      payload.brandId = brandId || null;
      if (tags.length > 0) payload.tags = tags;
      // Add specifications, manual URL, and additional info
      if (specifications.length > 0) payload.specifications = specifications;
      if (manualUrl.trim()) payload.manualUrl = manualUrl.trim();
      if (additionalInfo.trim()) payload.additionalInfo = additionalInfo.trim();
      if (seoFields.metaTitle.trim()) payload.metaTitle = seoFields.metaTitle.trim();
      if (seoFields.metaDescription.trim()) payload.metaDescription = seoFields.metaDescription.trim();
      if (seoFields.focusKeyword.trim()) payload.focusKeyword = seoFields.focusKeyword.trim();

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
            ? 'bg-green-50 border-green-500/30 text-green-600'
            : 'bg-red-50 border-red-500/30 text-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left Column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-violet-600" /> Basic Information
            </h2>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Product name"
                className={`w-full px-3 py-2.5 bg-gray-100 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Description *</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Product description"
                className={`w-full px-3 py-2.5 bg-gray-100 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              />
              <div className="flex justify-between mt-1">
                {errors.description ? <p className="text-xs text-red-600">{errors.description}</p> : <span />}
                <span className={`text-xs ${form.description.length < 10 ? 'text-red-600' : 'text-gray-500'}`}>{form.description.length}/5000</span>
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Additional Info <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={4}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Warranty info, care instructions, additional notes..."
                className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors resize-none"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">Free-text notes shown on the product page</p>
                <span className={`text-xs ${additionalInfo.length > 10000 ? 'text-red-600' : 'text-gray-500'}`}>{additionalInfo.length}/10000</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Category *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => set('categoryId', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-gray-100 border rounded-lg text-sm text-gray-700 focus:outline-none focus:border-violet-500 transition-colors ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select category...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p className="text-xs text-red-600 mt-1">{errors.categoryId}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Condition *</label>
                <div className="flex gap-2">
                  {conditions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set('condition', c)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        form.condition === c
                          ? c === 'NEW'
                            ? 'bg-green-50 border-green-200 text-green-600'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-gray-100 border-gray-300 text-gray-500 hover:text-gray-900'
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
          <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-violet-600" /> Pricing
            </h2>

            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Cost Price (R) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(e) => set('costPrice', e.target.value)}
                    placeholder="0.00"
                    className={`w-full pl-7 pr-3 py-2.5 bg-gray-100 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors ${errors.costPrice ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                {errors.costPrice && <p className="text-xs text-red-600 mt-1">{errors.costPrice}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Markup %</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={form.markupPercent}
                    onChange={(e) => set('markupPercent', e.target.value)}
                    placeholder="Markup %"
                    className="w-full pr-7 pl-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Auto-fills selling price</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Selling Price (R) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sellingPrice}
                    onChange={(e) => { set('sellingPrice', e.target.value); set('markupPercent', ''); }}
                    placeholder="0.00"
                    className={`w-full pl-7 pr-3 py-2.5 bg-gray-100 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors ${errors.sellingPrice ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                {errors.sellingPrice && <p className="text-xs text-red-600 mt-1">{errors.sellingPrice}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Original Price (R)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.originalPrice}
                    onChange={(e) => set('originalPrice', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Shows strikethrough price</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Discount Expires At</label>
                <input
                  type="datetime-local"
                  value={form.discountExpiresAt}
                  onChange={(e) => set('discountExpiresAt', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <p className="text-[10px] text-gray-500 mt-1">Optional: When the original price discount expires</p>
              </div>
            </div>

            {/* Margin indicator */}
            {margin !== null && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                margin < 0 ? 'bg-red-500/10 border-red-200 text-red-600'
                : margin < 15 ? 'bg-amber-500/10 border-amber-200 text-amber-700'
                : 'bg-green-500/10 border-green-200 text-green-600'
              }`}>
                <DollarSign className="w-3.5 h-3.5" />
                Margin: {margin}% — Gross profit: {formatPrice(parseFloat(form.sellingPrice) - parseFloat(form.costPrice))}
                {margin < 10 && ' ⚠ Low margin'}
              </div>
            )}
          </section>

          {/* Inventory */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-600" /> Inventory & Supplier
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Total Stock *</label>
                <input
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) => set('stockQuantity', e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2.5 bg-gray-100 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors ${errors.stockQuantity ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.stockQuantity && <p className="text-xs text-red-600 mt-1">{errors.stockQuantity}</p>}
              </div>

              <div />

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Cape Town</span>
                </label>
                <input type="number" min="0" value={form.stockCpt} onChange={(e) => set('stockCpt', e.target.value)} placeholder="0"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Johannesburg</span>
                </label>
                <input type="number" min="0" value={form.stockJhb} onChange={(e) => set('stockJhb', e.target.value)} placeholder="0"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Durban</span>
                </label>
                <input type="number" min="0" value={form.stockDbn} onChange={(e) => set('stockDbn', e.target.value)} placeholder="0"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Low Stock Alert</label>
                <input
                  type="number"
                  min="0"
                  value={form.lowStockThreshold}
                  onChange={(e) => set('lowStockThreshold', e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <p className="text-[10px] text-gray-500 mt-1">Alert when stock falls below this</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Shipping Days</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={form.shippingDays}
                  onChange={(e) => set('shippingDays', e.target.value)}
                  placeholder="3"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <p className="text-[10px] text-gray-500 mt-1">Business days to ship (1-30)</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Supplier</label>
                <select
                  value={form.supplierName}
                  onChange={(e) => set('supplierName', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="">— None —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => set('sku', e.target.value)}
                  placeholder="SKU code"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-violet-600" /> Product Images
              </h2>
              <button
                type="button"
                onClick={addImage}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-600/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Image URL
              </button>
            </div>

            {images.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No images yet</p>
                <p className="text-gray-600 text-xs mt-1">Add image URLs from your hosting or CDN</p>
                <button
                  type="button"
                  onClick={addImage}
                  className="mt-3 text-xs text-violet-600 hover:text-cyan-700 transition-colors"
                >
                  + Add first image
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {images.map((img, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 bg-gray-100 rounded-xl border border-gray-300">
                    {/* Preview */}
                    <div className="w-14 h-14 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-300 flex items-center justify-center relative">
                      {img.url && !imageErrors[idx] ? (
                        <img 
                          src={img.url} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={() => handleImageError(idx)} 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full">
                          <ImageIcon className={`w-5 h-5 ${imageErrors[idx] ? 'text-red-600' : 'text-gray-600'}`} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <input
                        type="text"
                        value={img.url}
                        onChange={(e) => updateImage(idx, 'url', e.target.value)}
                        placeholder="https://example.com/image.jpg or /assets/products-pics/image.jpg"
                        className={`w-full px-3 py-2 bg-white border rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 ${imageErrors[idx] ? 'border-red-500/50' : 'border-gray-300'}`}
                      />
                      {imageErrors[idx] && (
                        <p className="text-xs text-red-600">Image failed to load. Check URL or use a different image host.</p>
                      )}
                      <input
                        type="text"
                        value={img.altText}
                        onChange={(e) => updateImage(idx, 'altText', e.target.value)}
                        placeholder="Alt text (for accessibility)"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-500 placeholder-gray-400 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPrimary(idx)}
                        title="Set as primary"
                        className={`p-1.5 rounded-lg text-xs transition-colors ${img.isPrimary ? 'text-amber-700 bg-amber-500/10' : 'text-gray-500 hover:text-amber-700'}`}
                      >
                        ★
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Specifications */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-600" /> Specifications
                <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </h2>
            </div>
            
            {/* Add Spec Form */}
            <div className="flex gap-2">
              <input
                type="text"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                placeholder="Spec name (e.g. Color)"
                className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500"
              />
              <input
                type="text"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                placeholder="Value (e.g. Black)"
                className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (specKey.trim() && specValue.trim()) {
                    setSpecifications([...specifications, { key: specKey.trim(), value: specValue.trim() }]);
                    setSpecKey('');
                    setSpecValue('');
                  }
                }}
                disabled={!specKey.trim() || !specValue.trim()}
                className="px-3 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Specs List */}
            {specifications.length > 0 && (
              <div className="space-y-2">
                {specifications.map((spec, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{spec.key}:</span>
                      <span className="text-sm text-gray-500">{spec.value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSpecifications(specifications.filter((_, i) => i !== idx))}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Manual / Documentation URL */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-600" /> User Manual / Datasheet
              <span className="text-xs font-normal text-gray-500">(Optional)</span>
            </h2>

            <div className="space-y-3">
              {/* Upload button */}
              <label className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                docUploading ? 'border-violet-300 bg-violet-50' : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50'
              }`}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,application/pdf"
                  className="hidden"
                  disabled={docUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDocUpload(file);
                    e.target.value = '';
                  }}
                />
                {docUploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-violet-600" /><span className="text-sm text-violet-700">Uploading to Cloudinary...</span></>
                ) : (
                  <><File className="w-4 h-4 text-violet-500" /><span className="text-sm text-gray-600">Click to upload PDF / Datasheet</span><span className="text-xs text-gray-400">(max 20 MB)</span></>
                )}
              </label>

              {docUploadError && (
                <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{docUploadError}</p>
              )}

              {/* Resulting URL — editable fallback */}
              {manualUrl ? (
                <div className="flex items-center gap-2 p-2.5 bg-violet-50 border border-violet-200 rounded-lg">
                  <File className="w-4 h-4 text-violet-600 shrink-0" />
                  <a href={manualUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-700 hover:underline truncate flex-1">
                    {manualUrl}
                  </a>
                  <button type="button" onClick={() => setManualUrl('')} className="p-1 text-gray-400 hover:text-red-600 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="Or paste a URL manually"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500"
                />
              )}
            </div>
          </section>
        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="space-y-6">

          {/* Publish */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Publish Settings</h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <div>
                  <p className="text-sm text-gray-700 font-medium">Active</p>
                  <p className="text-xs text-gray-500">Visible on store</p>
                </div>
                <button
                  type="button"
                  onClick={() => set('isActive', !form.isActive)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-violet-600' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </label>

              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <div>
                  <p className="text-sm text-gray-700 font-medium">Featured</p>
                  <p className="text-xs text-gray-500">Show on homepage</p>
                </div>
                <button
                  type="button"
                  onClick={() => set('isFeatured', !form.isFeatured)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isFeatured ? 'bg-amber-500' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </label>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white disabled:text-gray-500 text-sm font-semibold rounded-lg transition-colors"
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
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-500 hover:text-gray-900 text-sm rounded-lg transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </section>

          {/* Brand */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-violet-600" /> Brand
            </h2>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="">— No brand —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </section>

          {/* Tags */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-violet-600" /> Product Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {defaultTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    tags.includes(tag)
                      ? 'bg-violet-600/15 border-violet-200 text-violet-600'
                      : 'bg-gray-100 border-gray-300 text-gray-500 hover:text-white'
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
                className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.filter((t) => !defaultTags.includes(t)).map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-gray-700 text-gray-700 text-xs rounded-full">
                    {tag}
                    <button type="button" onClick={() => toggleTag(tag)} className="hover:text-red-600 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* ── SEO Section ── */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-600" /> SEO Optimization
              </h2>
              <div className="flex items-center gap-2">
                {seoScore !== null && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    seoScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                    seoScore >= 60 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    SEO Score: {seoScore}/100 — {seoStatus}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleGenerateSeo}
                  disabled={generatingSeo}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {generatingSeo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Generate SEO Content
                </button>
              </div>
            </div>

            {/* Google Search Preview */}
            {(seoFields.metaTitle || form.name) && (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-2 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Google Search Preview
                </p>
                <div className="space-y-0.5">
                  <p className="text-[13px] text-blue-700 font-medium leading-snug truncate">
                    {seoFields.metaTitle || `${form.name} | BretuneTech South Africa`}
                  </p>
                  <p className="text-[11px] text-emerald-700 truncate">
                    https://bretunetech.com/products/{initialData?.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                  </p>
                  <p className="text-[12px] text-gray-600 leading-relaxed line-clamp-2">
                    {seoFields.metaDescription || form.description.replace(/<[^>]*>/g, '').substring(0, 155) || 'No meta description set.'}
                  </p>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-500">SEO Title</label>
                <span className={`text-[10px] font-medium ${seoFields.metaTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                  {seoFields.metaTitle.length}/60
                </span>
              </div>
              <input
                type="text"
                value={seoFields.metaTitle}
                onChange={(e) => setSeoFields(f => ({ ...f, metaTitle: e.target.value }))}
                placeholder={`${form.name || 'Product Name'} | BretuneTech South Africa`}
                className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-500">Meta Description</label>
                <span className={`text-[10px] font-medium ${
                  seoFields.metaDescription.length > 160 ? 'text-red-500' :
                  seoFields.metaDescription.length >= 150 ? 'text-emerald-500' :
                  'text-gray-400'
                }`}>
                  {seoFields.metaDescription.length}/160
                </span>
              </div>
              <textarea
                rows={3}
                value={seoFields.metaDescription}
                onChange={(e) => setSeoFields(f => ({ ...f, metaDescription: e.target.value }))}
                placeholder="Write a compelling 150-160 character description for Google search results..."
                className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 resize-none"
              />
              {seoFields.metaDescription.length > 0 && seoFields.metaDescription.length < 150 && (
                <p className="text-[10px] text-amber-500 mt-1">Recommended: 150–160 characters for best results</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Focus Keyword</label>
              <input
                type="text"
                value={seoFields.focusKeyword}
                onChange={(e) => setSeoFields(f => ({ ...f, focusKeyword: e.target.value }))}
                placeholder="e.g. MikroTik Router South Africa"
                className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">Main keyword this product page should rank for</p>
            </div>
          </section>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <section className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1.5">
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
