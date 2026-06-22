'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Layers, Plus, RefreshCw, Eye, Edit2, Trash2, X, Check, Minus, Upload, Image as ImageIcon } from 'lucide-react';
import { bundlesApi, productsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';

const emptyForm = { name: '', description: '', bundlePrice: '', imageUrl: '', isFeatured: false, isActive: true };

export default function AdminBundlesPage() {
  const { token } = useAuthStore();
  const [bundles, setBundles] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBundle, setEditBundle] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number; name: string; price: number; image?: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bundleData, prodData] = await Promise.allSettled([
        bundlesApi.list(),
        productsApi.list({ limit: '200' }),
      ]);
      if (bundleData.status === 'fulfilled') setBundles(Array.isArray(bundleData.value) ? bundleData.value : []);
      if (prodData.status === 'fulfilled') setProducts((prodData.value as any).products || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAdd = () => {
    setEditBundle(null);
    setForm({ ...emptyForm });
    setSelectedItems([]);
    setError('');
    setImagePreview('');
    setShowModal(true);
  };

  const openEdit = (b: any) => {
    setEditBundle(b);
    setForm({ name: b.name, description: b.description, bundlePrice: String(b.bundlePrice), imageUrl: b.imageUrl || '', isFeatured: b.isFeatured, isActive: b.isActive });
    setSelectedItems((b.items || []).map((i: any) => ({ productId: i.productId, quantity: i.quantity, name: i.product?.name || '', price: i.product?.sellingPrice || 0, image: i.product?.images?.[0]?.url || '' })));
    setError('');
    setImagePreview(b.imageUrl || '');
    setShowModal(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!token) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      setForm((p) => ({ ...p, imageUrl: data.url }));
      setImagePreview(data.url);
    } catch (e: any) {
      setError(e.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const addProduct = (prod: any) => {
    if (selectedItems.find((i) => i.productId === prod.id)) return;
    setSelectedItems((p) => [...p, { productId: prod.id, quantity: 1, name: prod.name, price: prod.sellingPrice, image: prod.images?.[0]?.url || '' }]);
  };

  const removeItem = (productId: string) => setSelectedItems((p) => p.filter((i) => i.productId !== productId));
  const setQty = (productId: string, qty: number) => setSelectedItems((p) => p.map((i) => i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i));

  const handleSave = async () => {
    if (!token) return;
    if (!form.name.trim() || !form.description.trim() || !form.bundlePrice) { setError('Name, description and price are required'); return; }
    if (selectedItems.length === 0) { setError('Add at least one product'); return; }
    setBusy(true); setError('');
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        bundlePrice: Number(form.bundlePrice),
        imageUrl: form.imageUrl.trim() || undefined,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        items: selectedItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };
      if (editBundle) {
        await bundlesApi.update(token, editBundle.id, payload);
      } else {
        await bundlesApi.create(token, payload);
      }
      setShowModal(false);
      fetchAll();
    } catch (e: any) {
      console.error('Bundle save error:', e);
      setError(e.message || 'Save failed');
    }
    finally { setBusy(false); }
  };

  const totalItemsPrice = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const bundlePrice = Number(form.bundlePrice) || 0;
  const savings = totalItemsPrice - bundlePrice;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bundles / Kits</h1>
          <p className="text-gray-500 text-sm mt-0.5">{bundles.length} bundles</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Bundle
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gray-300 rounded-2xl w-full max-w-2xl my-8 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">{editBundle ? 'Edit Bundle' : 'New Bundle'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Bundle Name *</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Bundle name"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Description *</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} placeholder="Bundle description"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Bundle Price (R) *</label>
                <input type="number" min={0} step="0.01" value={form.bundlePrice} onChange={(e) => setForm((p) => ({ ...p, bundlePrice: e.target.value }))} placeholder="0.00"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500" />
                {savings > 0 && <p className="text-xs text-emerald-600 mt-1">Customer saves {formatPrice(savings)}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Bundle Image</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input type="file" id="bundleImageUpload" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImagePreview(URL.createObjectURL(f)); handleImageUpload(f); } }} />
                    <label htmlFor="bundleImageUpload"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-700 hover:text-white text-sm font-medium rounded-lg cursor-pointer transition-colors border border-gray-300">
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </label>
                    {imagePreview && (
                      <button type="button" onClick={() => { setImagePreview(''); setForm((p) => ({ ...p, imageUrl: '' })); }}
                        className="text-xs text-red-600 hover:text-red-600">Remove</button>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="w-full h-32 bg-white rounded-lg overflow-hidden border border-gray-300">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500"><span>or enter URL:</span></div>
                  <input value={form.imageUrl} onChange={(e) => { setForm((p) => ({ ...p, imageUrl: e.target.value })); setImagePreview(e.target.value); }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))} className="accent-violet-500" />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="accent-violet-500" />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>

            {/* Product picker */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Products in Bundle *</label>
              <div className="border border-gray-300 rounded-xl overflow-hidden">
                <div className="max-h-40 overflow-y-auto divide-y divide-gray-100">
                  {products.map((prod) => {
                    const added = selectedItems.some((i) => i.productId === prod.id);
                    const thumb = prod.images?.[0]?.url;
                    return (
                      <div key={prod.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-100/50">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-md bg-gray-100 border border-gray-300 shrink-0 overflow-hidden">
                            {thumb
                              ? <img src={thumb} alt={prod.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon className="w-3.5 h-3.5" /></div>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-gray-900 truncate">{prod.name}</p>
                            <p className="text-xs text-gray-500">{formatPrice(prod.sellingPrice)}</p>
                          </div>
                        </div>
                        <button onClick={() => added ? removeItem(prod.id) : addProduct(prod)}
                          className={`ml-3 shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${added ? 'bg-red-50 text-red-600 hover:bg-red-50' : 'bg-violet-50 text-violet-600 hover:bg-violet-50'}`}>
                          {added ? 'Remove' : 'Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected items */}
            {selectedItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Selected ({selectedItems.length})</p>
                {selectedItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 bg-gray-100/50 rounded-lg px-3 py-2">
                    <div className="w-8 h-8 rounded-md bg-gray-100 border border-gray-300 shrink-0 overflow-hidden">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon className="w-3.5 h-3.5" /></div>
                      }
                    </div>
                    <span className="text-sm text-gray-900 flex-1 truncate">{item.name}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setQty(item.productId, item.quantity - 1)} className="w-6 h-6 rounded-md bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-700"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm text-gray-900 w-6 text-center">{item.quantity}</span>
                      <button onClick={() => setQty(item.productId, item.quantity + 1)} className="w-6 h-6 rounded-md bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-700"><Plus className="w-3 h-3" /></button>
                    </div>
                    <span className="text-xs text-gray-500 w-20 text-right">{formatPrice(item.price * item.quantity)}</span>
                    <button onClick={() => removeItem(item.productId)} className="text-gray-600 hover:text-red-600 transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <div className="flex justify-between text-xs px-1 pt-1">
                  <span className="text-gray-500">Total items value</span>
                  <span className="text-gray-700 font-semibold">{formatPrice(totalItemsPrice)}</span>
                </div>
              </div>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-700 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={busy} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                <Check className="w-4 h-4" /> {busy ? 'Saving...' : (editBundle ? 'Update Bundle' : 'Create Bundle')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bundle cards */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse space-y-3">
              <div className="h-4 bg-gray-100 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /><div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : bundles.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-20 text-center">
          <Layers className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No bundles yet</p>
          <button onClick={openAdd} className="mt-3 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">Create your first bundle</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {bundles.map((bundle) => (
            <div key={bundle.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                {/* Product image strip */}
                {bundle.items?.length > 0 ? (
                  <div className="flex -space-x-2">
                    {bundle.items.slice(0, 4).map((item: any, idx: number) => {
                      const thumb = item.product?.images?.[0]?.url;
                      return (
                        <div key={idx} className="w-10 h-10 rounded-xl border-2 border-[#1a1d27] bg-gray-100 overflow-hidden shrink-0">
                          {thumb
                            ? <img src={thumb} alt={item.product?.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center bg-violet-50"><Layers className="w-4 h-4 text-violet-600" /></div>
                          }
                        </div>
                      );
                    })}
                    {bundle.items.length > 4 && (
                      <div className="w-10 h-10 rounded-xl border-2 border-[#1a1d27] bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-semibold">
                        +{bundle.items.length - 4}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5 text-violet-600" />
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(bundle)} className="p-1.5 text-gray-500 hover:text-violet-600 rounded-lg hover:bg-gray-100 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <Link href={`/bundles/${bundle.slug}`} target="_blank" className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"><Eye className="w-4 h-4" /></Link>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{bundle.name}</h3>
              <div className="space-y-1.5 mt-3">
                <div className="flex justify-between text-xs"><span className="text-gray-500">Bundle price</span><span className="text-emerald-600 font-semibold">{formatPrice(bundle.bundlePrice)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">Items</span><span className="text-gray-700">{bundle.items?.length || 0}</span></div>
                {bundle.savings > 0 && <div className="flex justify-between text-xs"><span className="text-gray-500">Savings</span><span className="text-violet-600">{formatPrice(bundle.savings)}</span></div>}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${bundle.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-700 text-gray-500'}`}>{bundle.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
