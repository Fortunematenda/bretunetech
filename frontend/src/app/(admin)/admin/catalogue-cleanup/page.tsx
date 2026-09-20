'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  RefreshCw, Download, CheckSquare, Square, Archive, ShieldCheck,
  Filter, ExternalLink, RotateCcw, AlertTriangle, Trash2,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';
import { appToast } from '@/lib/toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useAdminConfirm } from '@/components/admin/useAdminConfirm';
import { Button } from '@/components/ui/button';

type Bucket = 'KEEP' | 'REVIEW' | 'REMOVE';

type Row = {
  id: string;
  name: string;
  sku: string | null;
  brand: string;
  category: string;
  price: number;
  stock: number;
  inStock: boolean;
  status: string;
  isActive: boolean;
  discontinued: boolean;
  classification: Bucket;
  reason: string;
  matchedRule?: string;
  confidence?: string;
  focusArea?: string;
  url: string;
  slug: string;
};

const bucketStyle: Record<Bucket, string> = {
  KEEP: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REVIEW: 'bg-amber-50 text-amber-800 border-amber-200',
  REMOVE: 'bg-red-50 text-red-700 border-red-200',
};

export default function CatalogueCleanupPage() {
  const { token } = useAuthStore();
  const { confirm, dialog } = useAdminConfirm();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [products, setProducts] = useState<Row[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [totals, setTotals] = useState({ total: 0, KEEP: 0, REVIEW: 0, REMOVE: 0, alreadyArchived: 0 });
  const [breakdown, setBreakdown] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const [classification, setClassification] = useState<string>('REMOVE');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('ALL');
  const [stock, setStock] = useState('ALL');
  const [search, setSearch] = useState('');

  const queryParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (classification && classification !== 'ALL') p.classification = classification;
    if (brand) p.brand = brand;
    if (category) p.category = category;
    if (status && status !== 'ALL') p.status = status;
    if (stock && stock !== 'ALL') p.stock = stock;
    if (search.trim()) p.search = search.trim();
    return p;
  }, [classification, brand, category, status, stock, search]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [dry, batchRes] = await Promise.all([
        adminApi.catalogueCleanupDryRun(token, queryParams),
        adminApi.catalogueCleanupBatches(token),
      ]);
      setProducts(dry.products || []);
      setTotals(dry.totals);
      setBreakdown((dry as any).breakdown || null);
      setBrands(dry.brands || []);
      setCategories(dry.categories || []);
      setBatches(batchRes.batches || []);
      setSelected([]);
    } catch (e: any) {
      appToast.error(e?.message || 'Failed to load dry-run');
    } finally {
      setLoading(false);
    }
  }, [token, queryParams]);

  useEffect(() => {
    load();
  }, [load]);

  const allVisibleSelected =
    products.length > 0 && products.every((p) => selected.includes(p.id));

  const toggleAll = () => {
    if (allVisibleSelected) setSelected([]);
    else setSelected(products.map((p) => p.id));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectBucket = (bucket: Bucket) => {
    setSelected(products.filter((p) => p.classification === bucket).map((p) => p.id));
  };

  const exportCsv = async () => {
    if (!token) return;
    try {
      const url = adminApi.catalogueCleanupExportUrl(queryParams);
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `catalogue-cleanup-${classification.toLowerCase()}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      appToast.success('CSV downloaded');
    } catch (e: any) {
      appToast.error(e?.message || 'CSV export failed');
    }
  };

  const archiveSelected = async () => {
    if (!token || selected.length === 0) return;
    const ok = await confirm({
      title: 'Archive selected products?',
      description: `This will archive ${selected.length} product(s) (DRAFT + inactive + catalogue-archived tag). They leave the shop, search, and sitemap but stay in the database for restore. Orders are untouched.`,
      confirmLabel: 'Archive selected',
      variant: 'danger',
    });
    if (!ok) return;

    setBusy(true);
    try {
      const result = await adminApi.catalogueCleanupArchive(token, selected, 'ARCHIVE');
      appToast.success(`Archived ${result.archived} products (batch ${result.batchId.slice(0, 8)}…)`);
      await load();
    } catch (e: any) {
      appToast.error(e?.message || 'Archive failed');
    } finally {
      setBusy(false);
    }
  };

  const restoreBatch = async (batchId: string, count: number) => {
    if (!token) return;
    const ok = await confirm({
      title: 'Restore archive batch?',
      description: `Restore ${count} product(s) from batch ${batchId} to their previous visibility state.`,
      confirmLabel: 'Restore batch',
    });
    if (!ok) return;
    setBusy(true);
    try {
      const result = await adminApi.catalogueCleanupRestore(token, batchId, 'RESTORE');
      appToast.success(`Restored ${result.restored} products`);
      await load();
    } catch (e: any) {
      appToast.error(e?.message || 'Restore failed');
    } finally {
      setBusy(false);
    }
  };

  const deletePermanentBatch = async (batchId: string, count: number) => {
    if (!token) return;
    const ok = await confirm({
      title: 'Permanently delete batch?',
      description: `This permanently deletes up to ${count} product(s) from the database. Order history keeps product name/price but loses the product link. This cannot be undone.`,
      confirmLabel: 'Delete permanent',
      variant: 'danger',
    });
    if (!ok) return;
    setBusy(true);
    try {
      const result = await adminApi.catalogueCleanupDeletePermanent(token, batchId, 'DELETE PERMANENT');
      appToast.success(`Permanently deleted ${result.deleted} products`);
      await load();
    } catch (e: any) {
      appToast.error(e?.message || 'Permanent delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {dialog}
      <AdminPageHeader
        title="Catalogue Cleanup"
        description="Dry-run classifier for Networking / CCTV / Wi-Fi focus. Archive is reversible — nothing is hard-deleted."
      />

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-2">
        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Dry-run by default</p>
          <p className="mt-0.5">
            Loading this page does not change products. Archiving requires confirmation and sets
            products to DRAFT + inactive + <code className="text-xs">catalogue-archived</code> tag.
            They leave the shop, search, and sitemap but stay in the database for restore. Take a DB backup before large archives.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: 'Total (scope)', value: totals.total, tone: 'text-gray-900' },
          { label: 'KEEP', value: totals.KEEP, tone: 'text-emerald-700' },
          { label: 'REVIEW', value: totals.REVIEW, tone: 'text-amber-700' },
          { label: 'REMOVE', value: totals.REMOVE, tone: 'text-red-700' },
          { label: 'Already archived', value: totals.alreadyArchived, tone: 'text-gray-500' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.tone}`}>{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {breakdown ? (
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          {(['KEEP', 'REVIEW', 'REMOVE'] as const).map((key) => (
            <div key={key} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="font-semibold text-gray-900 mb-2">{key} breakdown</p>
              <ul className="space-y-1 text-gray-600">
                {Object.entries(breakdown[key] || {}).map(([label, count]) => (
                  <li key={label} className="flex justify-between gap-3">
                    <span>{label}</span>
                    <span className="font-medium text-gray-900">{Number(count).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Filter className="size-4" /> Filters
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <label className="text-xs text-gray-500">
            Classification
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="ALL">All</option>
              <option value="KEEP">KEEP</option>
              <option value="REVIEW">REVIEW</option>
              <option value="REMOVE">REMOVE</option>
            </select>
          </label>
          <label className="text-xs text-gray-500">
            Brand
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-gray-500">
            Category slug
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-gray-500">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="ALL">All</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </label>
          <label className="text-xs text-gray-500">
            Stock
            <select
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="ALL">All</option>
              <option value="in">In stock</option>
              <option value="out">Out of stock</option>
            </select>
          </label>
          <label className="text-xs text-gray-500">
            Search
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, SKU, brand…"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={toggleAll} disabled={loading || products.length === 0}>
          {allVisibleSelected ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
          Select all ({products.length})
        </Button>
        <Button type="button" variant="outline" onClick={() => selectBucket('KEEP')} disabled={loading}>
          <ShieldCheck className="size-4" /> Keep (select KEEP rows)
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={archiveSelected}
          disabled={busy || selected.length === 0}
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          <Archive className="size-4" /> Archive selected ({selected.length})
        </Button>
        <Button type="button" variant="outline" onClick={exportCsv} disabled={loading}>
          <Download className="size-4" /> Export CSV
        </Button>
        <Button type="button" variant="outline" onClick={load} disabled={loading || busy}>
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-3 w-10" />
                <th className="px-3 py-3">Class</th>
                <th className="px-3 py-3">Reason</th>
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">SKU</th>
                <th className="px-3 py-3">Brand</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-gray-500">Loading dry-run…</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-gray-500">No products match filters</td>
                </tr>
              ) : (
                products.map((p) => {
                  const checked = selected.includes(p.id);
                  return (
                    <tr key={p.id} className={checked ? 'bg-blue-50/40' : 'hover:bg-gray-50'}>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => toggleOne(p.id)} aria-label="Select product">
                          {checked ? <CheckSquare className="size-4 text-[#003d7a]" /> : <Square className="size-4 text-gray-400" />}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold ${bucketStyle[p.classification]}`}>
                          {p.classification}
                        </span>
                        {p.confidence ? (
                          <p className="mt-1 text-[10px] text-gray-400">{p.confidence}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 max-w-[220px]">
                        <p className="text-xs text-gray-800">{p.reason}</p>
                        {p.matchedRule ? (
                          <p className="mt-0.5 text-[10px] font-mono text-gray-400">{p.matchedRule}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-medium text-gray-900 line-clamp-2 max-w-[260px]">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{p.id.slice(0, 8)}…</p>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{p.sku || '—'}</td>
                      <td className="px-3 py-2">{p.brand || '—'}</td>
                      <td className="px-3 py-2 text-xs text-gray-600 max-w-[160px] truncate">{p.category || '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatPrice(p.price)}</td>
                      <td className="px-3 py-2">
                        <span className={p.inStock ? 'text-emerald-700' : 'text-red-600'}>
                          {p.inStock ? `In (${p.stock})` : 'Out'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {p.status}{p.isActive ? '' : ' · inactive'}
                      </td>
                      <td className="px-3 py-2">
                        <Link href={`/products/${p.slug}`} target="_blank" className="inline-flex items-center gap-1 text-[#003d7a] hover:underline">
                          Open <ExternalLink className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Recent archive batches</h2>
        {batches.length === 0 ? (
          <p className="text-sm text-gray-500">No archive batches yet.</p>
        ) : (
          <ul className="space-y-2">
            {batches.slice(0, 15).map((b) => (
              <li
                key={b.batchId || b.key}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-semibold">{b.action}</span>
                  {' · '}
                  <span className="text-gray-600">{b.count} products</span>
                  {' · '}
                  <span className="text-xs text-gray-400">{b.createdAt}</span>
                  {b.adminEmail ? <span className="text-xs text-gray-400"> · {b.adminEmail}</span> : null}
                  {b.permanentDeletedAt ? (
                    <span className="ml-2 text-xs font-semibold text-red-600">Permanently deleted</span>
                  ) : null}
                </div>
                {b.action === 'ARCHIVE' && b.batchId && !b.permanentDeletedAt ? (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => restoreBatch(b.batchId, b.count || 0)}
                    >
                      <RotateCcw className="size-3.5" /> Restore
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => deletePermanentBatch(b.batchId, b.count || 0)}
                    >
                      <Trash2 className="size-3.5" /> Delete permanent
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
