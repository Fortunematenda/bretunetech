'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Truck, Mail, Phone, Globe, MapPin, Package,
  ChevronRight, CheckCircle, AlertCircle, StickyNote, XCircle,
  FileText, ExternalLink, Image as ImageIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { suppliersApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

type TabKey = 'overview' | 'products' | 'documents' | 'notes';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'overview',  label: 'Overview',  icon: Truck },
  { key: 'products',  label: 'Products',  icon: Package },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'notes',     label: 'Notes',     icon: StickyNote },
];

export default function SupplierDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSupplier = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const data = await suppliersApi.getById(token, id as string);
      setSupplier(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load supplier');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => { fetchSupplier(); }, [fetchSupplier]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
      <div className="h-6 bg-gray-100 rounded w-48" />
      <div className="h-32 bg-gray-100 rounded-2xl" />
      <div className="h-10 bg-gray-100 rounded-xl w-96" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-gray-100 rounded-2xl" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );

  if (error || !supplier) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-gray-700 font-medium mb-4">{error || 'Supplier not found'}</p>
      <button onClick={() => router.push('/admin/suppliers')} className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-800">
        <ArrowLeft className="w-4 h-4" /> Back to Suppliers
      </button>
    </div>
  );

  const productCount = supplier.products?.length || 0;
  const totalStockValue = supplier.products?.reduce((sum: number, p: any) => sum + ((p.costPrice || 0) * (p.stockQuantity || 0)), 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => router.push('/admin/suppliers')} className="hover:text-gray-800 transition-colors">Suppliers</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800 font-medium">{supplier.name}</span>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-violet-50 border-2 border-violet-200 flex items-center justify-center text-violet-600 font-bold text-2xl shrink-0">
            {supplier.name.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{supplier.name}</h1>
              <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${
                supplier.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}>
                {supplier.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
              {supplier.contactPerson && <span className="flex items-center gap-1.5">Contact: {supplier.contactPerson}</span>}
              {supplier.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{supplier.email}</span>}
              {supplier.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{supplier.phone}</span>}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {supplier.email && (
              <a href={`mailto:${supplier.email}`}
                className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </a>
            )}
            {supplier.phone && (
              <a href={`tel:${supplier.phone}`}
                className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
            )}
            {supplier.website && (
              <a href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`} target="_blank" rel="noreferrer"
                className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Website
              </a>
            )}
            <button onClick={() => router.push(`/admin/products?search=${encodeURIComponent(supplier.name)}`)}
              className="px-3 py-2 text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> View Products
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-gray-100 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/50">
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500">Products</p>
            <p className="text-lg font-bold text-gray-900">{productCount}</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500">Stock Value (Cost)</p>
            <p className="text-lg font-bold text-emerald-600">{formatPrice(totalStockValue)}</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-sm font-semibold text-gray-700">{supplier.isActive ? 'Active' : 'Inactive'}</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500">Added</p>
            <p className="text-sm font-semibold text-gray-700">{supplier.createdAt ? formatDate(supplier.createdAt) : '—'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === 'products' && <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-semibold">{productCount}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab supplier={supplier} />}
      {activeTab === 'products' && <ProductsTab supplier={supplier} />}
      {activeTab === 'documents' && <DocumentsTab />}
      {activeTab === 'notes' && <NotesTab supplier={supplier} />}
    </div>
  );
}

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ supplier }: { supplier: any }) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-5">
        {/* Company Information */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-400" /> Supplier Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoRow label="Company Name" value={supplier.name} />
            <InfoRow label="Contact Person" value={supplier.contactPerson || '—'} />
            <InfoRow label="Email" value={supplier.email || '—'} />
            <InfoRow label="Phone" value={supplier.phone || '—'} />
            <InfoRow label="Website" value={supplier.website || '—'} />
            <InfoRow label="Status" value={supplier.isActive ? 'Active' : 'Inactive'} />
            <InfoRow label="Date Added" value={supplier.createdAt ? formatDate(supplier.createdAt) : '—'} />
            <InfoRow label="Last Updated" value={supplier.updatedAt ? formatDate(supplier.updatedAt) : '—'} />
          </div>
        </div>

        {/* Address */}
        {(supplier.address || supplier.city) && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" /> Address
            </h3>
            <div className="text-sm text-gray-700 space-y-0.5">
              {supplier.address && <p>{supplier.address}</p>}
              {supplier.city && <p>{supplier.city}</p>}
            </div>
          </div>
        )}

        {/* Product Summary */}
        {supplier.products?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" /> Recent Products
              </h3>
              <span className="text-xs text-gray-500">{supplier.products.length} total</span>
            </div>
            <div className="divide-y divide-gray-100">
              {supplier.products.slice(0, 5).map((product: any) => (
                <Link key={product.id} href={`/admin/products/${product.id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-300" /></div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-violet-600 transition-colors">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sku || '—'} · {product.category?.name || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Cost: {formatPrice(product.costPrice || 0)}</p>
                      <p className="text-xs font-semibold text-gray-800">Sell: {formatPrice(product.sellingPrice || 0)}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      product.stockQuantity > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {product.stockQuantity} in stock
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="space-y-5">
        {/* Contact Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Contact</h3>
          <div className="space-y-3">
            {supplier.email && (
              <a href={`mailto:${supplier.email}`} className="flex items-center gap-2.5 text-sm text-violet-600 hover:text-violet-700 transition-colors">
                <Mail className="w-4 h-4 text-gray-400" /> {supplier.email}
              </a>
            )}
            {supplier.phone && (
              <a href={`tel:${supplier.phone}`} className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                <Phone className="w-4 h-4 text-gray-400" /> {supplier.phone}
              </a>
            )}
            {supplier.website && (
              <a href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 text-sm text-violet-600 hover:text-violet-700 transition-colors">
                <Globe className="w-4 h-4 text-gray-400" /> {supplier.website}
              </a>
            )}
            {(supplier.address || supplier.city) && (
              <div className="flex items-start gap-2.5 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  {supplier.address && <p>{supplier.address}</p>}
                  {supplier.city && <p>{supplier.city}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {supplier.notes && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-gray-400" /> Notes
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{supplier.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── PRODUCTS TAB ─── */
function ProductsTab({ supplier }: { supplier: any }) {
  const products = supplier.products || [];

  if (products.length === 0) return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-16 text-center">
      <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">No products linked</p>
      <p className="text-gray-400 text-sm mt-1">No products are associated with this supplier yet.</p>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Cost</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Sell</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Stock</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product: any) => (
              <tr key={product.id} onClick={() => window.location.href = `/admin/products/${product.id}`}
                className="hover:bg-gray-50 cursor-pointer transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-300" /></div>
                    )}
                    <span className="text-sm font-medium text-gray-800 group-hover:text-violet-600 transition-colors truncate max-w-[200px]">{product.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{product.sku || '—'}</td>
                <td className="px-5 py-3.5 text-xs text-gray-500">{product.category?.name || '—'}</td>
                <td className="px-5 py-3.5 text-right text-xs text-gray-600">{formatPrice(product.costPrice || 0)}</td>
                <td className="px-5 py-3.5 text-right text-sm font-semibold text-gray-900">{formatPrice(product.sellingPrice || 0)}</td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                    product.stockQuantity > 5 ? 'bg-emerald-50 text-emerald-600' :
                    product.stockQuantity > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {product.stockQuantity}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                    product.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-600 transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── DOCUMENTS TAB ─── */
function DocumentsTab() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-16 text-center">
      <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">No documents yet</p>
      <p className="text-gray-400 text-sm mt-1">Supplier invoices, agreements, and price lists will appear here.</p>
    </div>
  );
}

/* ─── NOTES TAB ─── */
function NotesTab({ supplier }: { supplier: any }) {
  if (supplier.notes) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-gray-400" /> Supplier Notes
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{supplier.notes}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-16 text-center">
      <StickyNote className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">No notes yet</p>
      <p className="text-gray-400 text-sm mt-1">Supplier notes and internal comments will appear here.</p>
    </div>
  );
}

/* ─── HELPER ─── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 font-medium">{value}</p>
    </div>
  );
}
