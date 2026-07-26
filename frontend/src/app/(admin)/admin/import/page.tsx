'use client';

import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertTriangle, X, Package, ArrowRight, RefreshCw, Trash2, Info } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { importApi, categoriesApi, suppliersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useAdminConfirm } from '@/components/admin/useAdminConfirm';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { formatPrice } from '@/lib/utils';

type LogEntry = { id?: string; type: 'success' | 'error' | 'warning' | 'info'; msg: string };
type ImportJobStatus = {
  id: string;
  status: string;
  fileName?: string | null;
  totalRows: number;
  imported: number;
  skipped: number;
  failed: number;
  imageFailed: number;
  error?: string | null;
};

const SCHEMA_FIELDS = [
  { value: '',                   label: '— skip this column —' },
  // Core
  { value: 'name',               label: 'Product Name *' },
  { value: 'description',        label: 'Description' },
  { value: 'category',           label: 'Category' },
  { value: 'brand',              label: 'Brand' },
  { value: 'supplier_name',      label: 'Supplier Name' },
  { value: 'supplier_sku',       label: 'SKU / Product Code' },
  // Pricing
  { value: 'cost_price',         label: 'Cost Price *' },
  { value: 'selling_price',      label: 'Retail / Selling Price' },
  { value: 'markup_percentage',  label: 'Markup %' },
  { value: 'original_price',     label: 'Original / Compare-at Price' },
  // Stock
  { value: 'stock_quantity',     label: 'Stock Quantity (Total)' },
  { value: 'stock_cpt',          label: 'Stock — Cape Town' },
  { value: 'stock_jhb',          label: 'Stock — Johannesburg' },
  { value: 'stock_dbn',          label: 'Stock — Durban' },
  { value: 'low_stock_threshold',label: 'Low Stock Threshold' },
  // Media & meta
  { value: 'image_url',          label: 'Image URL' },
  { value: 'condition',          label: 'Condition (NEW / REFURB)' },
  { value: 'shipping_days',      label: 'Shipping Days' },
  { value: 'is_featured',        label: 'Featured (true/false)' },
  { value: 'tags',               label: 'Tags (comma-separated)' },
  // Additional info
  { value: 'additional_info',    label: 'Additional Info' },
  { value: 'specifications',     label: 'Specifications (key:value|key:value)' },
];

/* Auto-guess a schema field from a raw CSV header */
function guessField(header: string): string {
  const h = header.toLowerCase().trim().replace(/[_\-]+/g, ' ');
  // Name — exact or common patterns. "description" alone often IS the product name in supplier CSVs
  if (/^name$|^product name$|^item name$|^title$|^product$|^item$/.test(h)) return 'name';
  // Retail / selling price — check BEFORE generic price so it wins
  if (/retail price|retail|selling price|sell price|rrp|incl/.test(h)) return 'selling_price';
  // Dealer / cost price
  if (/dealer price|dealer|trade price|trade|cost price|cost|excl|wholesale|unit price|buy price/.test(h)) return 'cost_price';
  // Description / long text — NOT mapped to name by default
  if (/^description$|^desc$|detail|long desc/.test(h)) return 'description';
  if (/cat|type|group/.test(h)) return 'category';
  // Manufacturer is the product brand on most supplier sheets
  if (/^brand$|brand name|make|^manufacturer$|manufacturer name|^mfr$|^mfr name$/.test(h)) return 'brand';
  if (/supplier|vendor|distributor/.test(h)) return 'supplier_name';
  if (/^sku$|part number|part no|item code|product code|barcode|upc|mpn/.test(h)) return 'supplier_sku';
  if (/image|img|photo|picture/.test(h)) return 'image_url';
  if (/^cpt$|cape town|capetown/.test(h)) return 'stock_cpt';
  if (/^jhb$|^jnb$|johannesburg|joburg/.test(h)) return 'stock_jhb';
  if (/^dbn$|durban/.test(h)) return 'stock_dbn';
  if (/total stock|stock|qty|quantity|available/.test(h)) return 'stock_quantity';
  if (/condition|cond/.test(h)) return 'condition';
  if (/markup|margin/.test(h)) return 'markup_percentage';
  if (/tag/.test(h)) return 'tags';
  if (/additional|extra|notes|warranty|care/.test(h)) return 'additional_info';
  if (/spec|feature|attribute/.test(h)) return 'specifications';
  return '';
}

/* ── PreviewTable — scrollable, inline-editable ─────────────────── */
function PreviewTable({
  rows,
  columnMap,
  categories,
  suppliers,
  onChange,
}: {
  rows: any[];
  columnMap: Record<string, string>;
  categories: any[];
  suppliers: any[];
  onChange: (rows: any[]) => void;
}) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState<any>({});

  const mappedFields = new Set(Object.values(columnMap).filter(Boolean));

  const startEdit = (i: number) => {
    setEditingIdx(i);
    setDraft({ ...rows[i] });
  };

  const saveEdit = () => {
    if (editingIdx === null) return;
    const updated = [...rows];
    updated[editingIdx] = { ...draft };
    onChange(updated);
    setEditingIdx(null);
  };

  const cancelEdit = () => setEditingIdx(null);

  const deleteRow = (i: number) => {
    const updated = rows.filter((_, idx) => idx !== i);
    onChange(updated);
    if (editingIdx === i) setEditingIdx(null);
  };

  const set = (field: string, value: any) => setDraft((d: any) => ({ ...d, [field]: value }));

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-100/40 border-b border-gray-200">
        <p className="text-xs text-gray-500"><span className="text-gray-900 font-semibold">{rows.length}</span> products ready — click a row to edit</p>
        <p className="text-xs text-gray-600">Scroll to view all</p>
      </div>

      {/* Scrollable container — shows all rows */}
      <div className="overflow-auto max-h-[480px]">
        <Table className="text-xs min-w-[800px]">
          <TableHeader className="sticky top-0 z-10 bg-white">
            <TableRow className="border-b border-gray-200">
              <TableHead className="text-left px-3 py-2 text-gray-500 font-medium w-8">#</TableHead>
              <TableHead className="text-left px-3 py-2 text-gray-500 font-medium min-w-[180px]">Name</TableHead>
              <TableHead className="text-left px-3 py-2 text-gray-500 font-medium">Category</TableHead>
              <TableHead className="text-left px-3 py-2 text-gray-500 font-medium">Supplier</TableHead>
              {mappedFields.has('brand') && <TableHead className="text-left px-3 py-2 text-gray-500 font-medium">Brand</TableHead>}
              {mappedFields.has('supplier_sku') && <TableHead className="text-left px-3 py-2 text-gray-500 font-medium">SKU</TableHead>}
              <TableHead className="text-left px-3 py-2 text-gray-500 font-medium">Cost</TableHead>
              <TableHead className="text-left px-3 py-2 text-gray-500 font-medium">Sell</TableHead>
              {mappedFields.has('stock_quantity') && <TableHead className="text-left px-3 py-2 text-gray-500 font-medium">Stock</TableHead>}
              {mappedFields.has('condition') && <TableHead className="text-left px-3 py-2 text-gray-500 font-medium">Cond.</TableHead>}
              <TableHead className="px-3 py-2 w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100/50">
            {rows.map((row, i) => (
              editingIdx === i ? (
                /* ── Inline edit row ── */
                <TableRow key={i} className="bg-gray-100/60">
                  <TableCell className="px-3 py-2 text-gray-600">{i + 1}</TableCell>
                  <TableCell className="px-2 py-1.5">
                    <input value={draft.name || ''} onChange={(e) => set('name', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-primary rounded text-xs text-gray-900 focus:outline-none" />
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <select value={draft.category || ''} onChange={(e) => set('category', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-primary">
                      <option value="">— none —</option>
                      {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <select value={draft.supplier_name || ''} onChange={(e) => set('supplier_name', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-primary">
                      <option value="">— none —</option>
                      {suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </TableCell>
                  {mappedFields.has('brand') && (
                    <TableCell className="px-2 py-1.5">
                      <input value={draft.brand || ''} onChange={(e) => set('brand', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-primary" />
                    </TableCell>
                  )}
                  {mappedFields.has('supplier_sku') && (
                    <TableCell className="px-2 py-1.5">
                      <input value={draft.supplier_sku || ''} onChange={(e) => set('supplier_sku', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-900 font-mono focus:outline-none focus:border-primary" />
                    </TableCell>
                  )}
                  <TableCell className="px-2 py-1.5">
                    <input type="number" value={draft.cost_price ?? ''} onChange={(e) => set('cost_price', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-primary" />
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <input type="number" value={draft.sellingPrice ?? ''} onChange={(e) => set('sellingPrice', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 bg-white border border-gray-300 rounded text-xs text-emerald-600 focus:outline-none focus:border-primary" />
                  </TableCell>
                  {mappedFields.has('stock_quantity') && (
                    <TableCell className="px-2 py-1.5">
                      <input type="number" value={draft.stock_quantity ?? ''} onChange={(e) => set('stock_quantity', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-primary" />
                    </TableCell>
                  )}
                  {mappedFields.has('condition') && (
                    <TableCell className="px-2 py-1.5">
                      <select value={draft.condition || 'NEW'} onChange={(e) => set('condition', e.target.value)}
                        className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-primary">
                        <option value="NEW">NEW</option>
                        <option value="REFURBISHED">REFURB</option>
                      </select>
                    </TableCell>
                  )}
                  <TableCell className="px-2 py-1.5">
                    <div className="flex gap-1">
                      <button onClick={saveEdit} className="px-2 py-1 bg-primary hover:bg-primary/90 text-white rounded text-[10px] font-semibold transition-colors">Save</button>
                      <button onClick={cancelEdit} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-700 rounded text-[10px] transition-colors">✕</button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                /* ── Read-only row ── */
                <TableRow key={i} className="hover:bg-gray-100/40 cursor-pointer group" onClick={() => startEdit(i)}>
                  <TableCell className="px-3 py-2 text-gray-600">{i + 1}</TableCell>
                  <TableCell className="px-3 py-2 text-gray-700 max-w-[200px] truncate">{row.name}</TableCell>
                  <TableCell className="px-3 py-2 text-gray-500">{row.category || row.categorySlug || '—'}</TableCell>
                  <TableCell className="px-3 py-2 text-gray-500">{row.supplier_name || '—'}</TableCell>
                  {mappedFields.has('brand') && <TableCell className="px-3 py-2 text-gray-500">{row.brand || '—'}</TableCell>}
                  {mappedFields.has('supplier_sku') && <TableCell className="px-3 py-2 text-gray-500 font-mono">{row.supplier_sku || '—'}</TableCell>}
                  <TableCell className="px-3 py-2 text-gray-500">{formatPrice(row.cost_price)}</TableCell>
                  <TableCell className="px-3 py-2 text-emerald-600 font-semibold">{formatPrice(row.sellingPrice)}</TableCell>
                  {mappedFields.has('stock_quantity') && <TableCell className="px-3 py-2 text-gray-500">{row.stock_quantity ?? 0}</TableCell>}
                  {mappedFields.has('condition') && <TableCell className="px-3 py-2 text-gray-500">{row.condition || 'NEW'}</TableCell>}
                  <TableCell className="px-3 py-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRow(i); }}
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 text-red-600 hover:text-red-600 hover:bg-red-50 rounded text-[10px] transition-all"
                    >✕</button>
                  </TableCell>
                </TableRow>
              )
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function AdminImportPage() {
  const { confirm, dialog } = useAdminConfirm();
  const { token } = useAuthStore();

  /* Settings */
  const [globalMarkup, setGlobalMarkup] = useState(35);
  const [markupBusy, setMarkupBusy] = useState(false);
  const [addVatToCost, setAddVatToCost] = useState(false);
  const [vatRate, setVatRate] = useState(15);
  const [uploadImages, setUploadImages] = useState(false);

  /* DB lists for preview row editors */
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    categoriesApi.list(true).then(setCategories).catch(() => {});
    suppliersApi.list(true).then(setSuppliers).catch(() => {});
  }, []);

  /* CSV flow — step: 'upload' | 'map' | 'preview' | 'importing' */
  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'importing'>('upload');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewErrors, setPreviewErrors] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [activeJob, setActiveJob] = useState<ImportJobStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Manual import */
  const [manualBusy, setManualBusy] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: '', description: '', category: '', supplierName: '',
    supplierSku: '', costPrice: '', markupPercentage: '', imageUrl: '',
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const addLog = (type: LogEntry['type'], msg: string, id?: string) =>
    setLogs((prev) => [{ id, type, msg }, ...prev].slice(0, 80));
  const upsertLog = (id: string, type: LogEntry['type'], msg: string) =>
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { id, type, msg };
        return next;
      }
      return [{ id, type, msg }, ...prev].slice(0, 80);
    });

  const stopJobPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const resetWizard = useCallback(() => {
    setCsvFile(null);
    setStep('upload');
    setDetectedHeaders([]);
    setColumnMap({});
    setPreviewRows([]);
    setPreviewErrors([]);
    setActiveJob(null);
  }, []);

  useEffect(() => () => stopJobPolling(), [stopJobPolling]);

  /* ── Cleanup soft-deleted products ── */
  const handleCleanupDeleted = async () => {
    if (!token) return;
    if (!(await confirm({
      title: 'Clean up deleted products',
      description: 'This will permanently remove all previously soft-deleted products from the database, freeing their SKUs for re-import. Continue?',
      confirmLabel: 'Continue',
      variant: 'danger',
    }))) return;
    setBusy(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/import/cleanup-deleted`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      addLog('success', data.message || `Cleaned up ${data.deleted} deleted products`);
    } catch (err: any) {
      addLog('error', `Cleanup failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  /* ── Step 1: detect headers from file ── */
  const handleFileChange = async (file: File | null) => {
    setCsvFile(file);
    setStep('upload');
    setDetectedHeaders([]);
    setColumnMap({});
    setPreviewRows([]);
    setPreviewErrors([]);
    if (!file || !token) return;
    setBusy(true);
    try {
      const data = await importApi.previewCsv(token, file, globalMarkup);
      const headers: string[] = data.detectedHeaders || [];
      setDetectedHeaders(headers);
      // Auto-guess mappings
      const guessed: Record<string, string> = {};
      headers.forEach((h: string) => { guessed[h] = guessField(h); });
      setColumnMap(guessed);
      setPreviewRows(data.rows || []);
      setPreviewErrors(data.errors || []);
      setStep('map');
    } catch (err: any) {
      addLog('error', `Failed to read CSV: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  /* ── Step 2: apply mapping and re-preview ── */
  const handleApplyMap = async () => {
    if (!csvFile || !token) return;
    setBusy(true);
    try {
      const data = await importApi.previewCsvMapped(token, csvFile, columnMap, globalMarkup);
      const rows = data.rows || [];
      setPreviewRows(rows);
      setPreviewErrors(data.errors || []);
      setStep('preview');
      addLog('success', `Preview: ${rows.length} valid rows${data.errors?.length ? `, ${data.errors.length} skipped` : ''}`);
    } catch (err: any) {
      addLog('error', `Preview failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  /* ── Step 3: start background import and keep progress on this page ── */
  const handleImport = async () => {
    if (!token || previewRows.length === 0) return;
    setBusy(true);
    try {
      const totalRows = previewRows.length;
      const skippedPreview = previewErrors.length;
      const job = await importApi.importRows(token, previewRows, {
        globalMarkup,
        skipDuplicates: true,
        uploadImages,
        addVatToCost,
        vatRate,
        fileName: csvFile?.name,
      });

      const jobId = job.jobId as string;
      addLog(
        'success',
        `Import started — ${totalRows} products queued${skippedPreview ? ` (${skippedPreview} preview rows skipped)` : ''}${csvFile?.name ? ` from ${csvFile.name}` : ''}.`
      );
      upsertLog(
        `job-${jobId}`,
        'info',
        `Import running… 0 / ${totalRows} processed (0 imported, 0 updated, 0 failed)`
      );

      setActiveJob({
        id: jobId,
        status: job.status || 'PENDING',
        fileName: csvFile?.name || null,
        totalRows: job.totalRows ?? totalRows,
        imported: 0,
        skipped: 0,
        failed: 0,
        imageFailed: 0,
      });
      setStep('importing');
      setBusy(false);

      stopJobPolling();
      const poll = async () => {
        try {
          const status = await importApi.getImportJob(token, jobId);
          setActiveJob(status);
          const processed = (status.imported || 0) + (status.skipped || 0) + (status.failed || 0);
          const total = status.totalRows || totalRows;

          if (status.status === 'COMPLETED') {
            stopJobPolling();
            upsertLog(
              `job-${jobId}`,
              status.failed > 0 ? 'warning' : 'success',
              `Import complete — ${status.imported} imported, ${status.skipped} updated/skipped, ${status.failed} failed` +
                (status.imageFailed ? `, ${status.imageFailed} without image` : '') +
                ` (${total} total)`
            );
            return;
          }

          if (status.status === 'FAILED') {
            stopJobPolling();
            upsertLog(`job-${jobId}`, 'error', `Import failed: ${status.error || 'Unknown error'}`);
            return;
          }

          upsertLog(
            `job-${jobId}`,
            'info',
            `Import running… ${processed} / ${total} processed (${status.imported || 0} imported, ${status.skipped || 0} updated, ${status.failed || 0} failed)`
          );
        } catch (err: any) {
          addLog('warning', `Could not refresh import status: ${err.message}`);
        }
      };

      await poll();
      pollRef.current = setInterval(poll, 2000);
    } catch (err: any) {
      addLog('error', `Import failed to start: ${err.message}`);
      setBusy(false);
    }
  };

  /* ── Manual import ── */
  const calculatedPrice = (() => {
    const cost = Number(manualForm.costPrice || 0);
    const markup = Number(manualForm.markupPercentage || globalMarkup || 0);
    return cost > 0 ? Math.round(cost * (1 + markup / 100)) : 0;
  })();

  const handleManualImport = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setManualBusy(true);
    try {
      const result = await importApi.importSingle(token, {
        name: manualForm.name, description: manualForm.description,
        category: manualForm.category, supplierName: manualForm.supplierName || undefined,
        supplierSku: manualForm.supplierSku || undefined, costPrice: Number(manualForm.costPrice),
        markupPercentage: manualForm.markupPercentage ? Number(manualForm.markupPercentage) : undefined,
        imageUrl: manualForm.imageUrl || undefined,
      });
      if (result.success) {
        addLog('success', `Imported: ${result.name}`);
        setManualForm({ name: '', description: '', category: '', supplierName: '', supplierSku: '', costPrice: '', markupPercentage: '', imageUrl: '' });
      } else {
        addLog('error', `Failed: ${result.name} — ${result.error}`);
      }
    } catch (err: any) {
      addLog('error', `Import failed: ${err.message}`);
    } finally {
      setManualBusy(false);
    }
  };

  const fm = (f: string, v: string) => setManualForm((p) => ({ ...p, [f]: v }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Product Import"
        description="Upload a supplier CSV and map columns to import products."
        actions={
          <>
          <div className="relative">
            <input type="number" min={0} max={500} value={globalMarkup}
              onChange={(e) => setGlobalMarkup(Number(e.target.value || 0))}
              className="w-28 px-3 pr-7 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-primary" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">% markup</span>
          </div>
          <Button type="button" variant="secondary" onClick={async () => {
            if (!token) return;
            setMarkupBusy(true);
            try { const d = await importApi.updateSettings(token, { globalMarkup }); setGlobalMarkup(d.globalMarkup); addLog('success', `Markup set to ${d.globalMarkup}%`); }
            catch (e: any) { addLog('error', e.message); } finally { setMarkupBusy(false); }
          }} disabled={markupBusy}>
            {markupBusy ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save'}
          </Button>
          {/* VAT on cost toggle */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none transition-colors ${addVatToCost ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
            onClick={() => setAddVatToCost(v => !v)}
            title="Enable if your cost price is excl. VAT — will add VAT to cost before applying markup">
            <span className={`w-8 h-4 rounded-full relative transition-colors ${addVatToCost ? 'bg-amber-500' : 'bg-gray-600'}`}>
              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${addVatToCost ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </span>
            <span className="text-xs font-semibold whitespace-nowrap">Cost excl. VAT</span>
          </div>
          {addVatToCost && (
            <div className="relative">
              <input type="number" min={0} max={100} value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value || 15))}
                className="w-24 px-3 pr-7 py-2 bg-gray-100 border border-amber-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-amber-500" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-500 text-xs font-bold">% VAT</span>
            </div>
          )}
          {/* Upload Images toggle */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none transition-colors ${uploadImages ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
            onClick={() => setUploadImages(v => !v)}
            title="When OFF, images are stored as supplier URLs (not re-hosted). Turn ON only for small batches to avoid timeouts.">
            <span className={`w-8 h-4 rounded-full relative transition-colors ${uploadImages ? 'bg-blue-500' : 'bg-gray-400'}`}>
              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${uploadImages ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </span>
            <span className="text-xs font-semibold whitespace-nowrap">Upload Images</span>
          </div>
          <Button type="button" variant="secondary" onClick={async () => {
            if (!token) return;
            try { const blob = await importApi.downloadTemplate(token); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'import-template.csv'; a.click(); URL.revokeObjectURL(url); }
            catch (e: any) { addLog('error', e.message); }
          }}>
            <Download className="w-4 h-4" /> Template
          </Button>
          <Button type="button" variant="destructive" onClick={handleCleanupDeleted} disabled={busy} title="Hard-delete all soft-deleted products to free up their SKUs for re-import">
            <Trash2 className="w-4 h-4" /> Purge Deleted
          </Button>
          </>
        }
      />

      {/* ── CSV Import wizard ── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Step indicators */}
        <div className="flex border-b border-gray-200">
          {([
            { key: 'upload', label: 'Upload CSV' },
            { key: 'map', label: 'Map Columns' },
            { key: 'preview', label: 'Preview & Import' },
            { key: 'importing', label: 'Importing' },
          ] as const).map((s, i) => {
            const isActive = step === s.key;
            return (
              <div key={s.key} className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors ${isActive ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</span>
                {s.label}
              </div>
            );
          })}
        </div>

        <div className="p-5">
          {/* ── Step 1: Upload ── */}
          {step === 'upload' && (
            <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${busy ? 'border-primary/20 bg-primary/5' : 'border-gray-300 hover:border-gray-300'}`}>
              {busy ? (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <RefreshCw className="w-7 h-7 animate-spin text-primary" />
                  <p className="text-sm">Reading CSV headers…</p>
                </div>
              ) : (
                <>
                  <FileSpreadsheet className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-1">Drop your supplier CSV here or</p>
                  <label className="cursor-pointer text-primary hover:text-primary text-sm font-semibold transition-colors">
                    browse files
                    <input type="file" accept=".csv,text/csv" className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                  </label>
                  <p className="text-gray-600 text-xs mt-3">Any CSV format — you'll map the columns in the next step</p>
                </>
              )}
            </div>
          )}

          {/* ── Step 2: Map Columns ── */}
          {step === 'map' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{csvFile?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{detectedHeaders.length} columns detected — map each one to a product field</p>
                </div>
                <button onClick={() => { setCsvFile(null); setStep('upload'); }} className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors">
                  <X className="w-3 h-3" /> Change file
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                {detectedHeaders.map((header) => (
                  <div key={header} className="flex items-center gap-2 bg-gray-100/60 rounded-lg px-3 py-2 border border-gray-300">
                    <span className="text-xs text-gray-700 font-mono flex-1 truncate min-w-0" title={header}>{header}</span>
                    <ArrowRight className="w-3 h-3 text-gray-600 shrink-0" />
                    <select
                      value={columnMap[header] || ''}
                      onChange={(e) => setColumnMap({ ...columnMap, [header]: e.target.value })}
                      className="flex-1 min-w-0 bg-white border border-gray-300 rounded text-xs text-gray-900 px-2 py-1.5 focus:outline-none focus:border-primary"
                    >
                      {SCHEMA_FIELDS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep('upload')} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-700 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                  ← Back
                </button>
                <Button type="button" className="flex-1" onClick={handleApplyMap} disabled={busy}>
                  {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Apply Mapping & Preview</>}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Preview & Import ── */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{csvFile?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="text-emerald-600 font-semibold">{previewRows.length} valid rows</span>
                    {previewErrors.length > 0 && <span className="text-amber-700 ml-2">{previewErrors.length} rows skipped</span>}
                  </p>
                </div>
                <button onClick={() => setStep('map')} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                  ← Edit mapping
                </button>
              </div>

              {previewRows.length > 0 && <PreviewTable
                rows={previewRows}
                columnMap={columnMap}
                categories={categories}
                suppliers={suppliers}
                onChange={setPreviewRows}
              />}

              {previewErrors.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-500/20 rounded-lg space-y-1">
                  <p className="text-xs font-semibold text-amber-700">{previewErrors.length} rows will be skipped</p>
                  {previewErrors.slice(0, 4).map((e, i) => (
                    <p key={i} className="text-[11px] text-gray-500">Row {e.row}: {e.error}</p>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={() => setStep('map')} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-700 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                  ← Back
                </button>
                <Button type="button" className="flex-1" onClick={handleImport} disabled={busy || previewRows.length === 0}>
                  {busy
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Starting…</>
                    : <><Upload className="w-4 h-4" /> Import {previewRows.length} products</>}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 4: Live import progress ── */}
          {step === 'importing' && activeJob && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{activeJob.fileName || csvFile?.name || 'Import job'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Status:{' '}
                    <span className={
                      activeJob.status === 'COMPLETED' ? 'text-emerald-600 font-semibold'
                        : activeJob.status === 'FAILED' ? 'text-red-600 font-semibold'
                        : 'text-primary font-semibold'
                    }>
                      {activeJob.status}
                    </span>
                    {(activeJob.status === 'PENDING' || activeJob.status === 'RUNNING') && (
                      <span className="text-gray-500"> — you can leave this page; progress stays in Import Logs and the bell</span>
                    )}
                  </p>
                </div>
                {(activeJob.status === 'COMPLETED' || activeJob.status === 'FAILED') && (
                  <button onClick={resetWizard} className="text-xs text-primary hover:text-primary font-medium transition-colors">
                    Import another file
                  </button>
                )}
              </div>

              {(() => {
                const processed = (activeJob.imported || 0) + (activeJob.skipped || 0) + (activeJob.failed || 0);
                const total = activeJob.totalRows || 1;
                const pct = Math.min(100, Math.round((processed / total) * 100));
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{processed} / {total} processed</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${activeJob.status === 'FAILED' ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${activeJob.status === 'COMPLETED' ? 100 : pct}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-2 py-2">
                        <p className="text-lg font-semibold text-emerald-700">{activeJob.imported}</p>
                        <p className="text-[10px] text-emerald-700/80">Imported</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 border border-amber-100 px-2 py-2">
                        <p className="text-lg font-semibold text-amber-700">{activeJob.skipped}</p>
                        <p className="text-[10px] text-amber-700/80">Updated</p>
                      </div>
                      <div className="rounded-lg bg-red-50 border border-red-100 px-2 py-2">
                        <p className="text-lg font-semibold text-red-700">{activeJob.failed}</p>
                        <p className="text-[10px] text-red-700/80">Failed</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {(activeJob.status === 'PENDING' || activeJob.status === 'RUNNING') && (
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                  Importing in the background — live counts update every few seconds below.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Manual Import ── */}
      <form onSubmit={handleManualImport} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" /> Add Single Product Manually
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input required placeholder="Product name *" value={manualForm.name} onChange={(e) => fm('name', e.target.value)}
            className="px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary" />
          <input placeholder="Category" value={manualForm.category} onChange={(e) => fm('category', e.target.value)}
            className="px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary" />
          <input placeholder="Supplier name" value={manualForm.supplierName} onChange={(e) => fm('supplierName', e.target.value)}
            className="px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary" />
          <input placeholder="Supplier SKU / Code" value={manualForm.supplierSku} onChange={(e) => fm('supplierSku', e.target.value)}
            className="px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary font-mono" />
          <input type="number" required min={0} step="0.01" placeholder="Cost price *" value={manualForm.costPrice} onChange={(e) => fm('costPrice', e.target.value)}
            className="px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary" />
          <input type="number" min={0} max={500} placeholder={`Markup % (default ${globalMarkup}%)`} value={manualForm.markupPercentage} onChange={(e) => fm('markupPercentage', e.target.value)}
            className="px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary" />
          <input placeholder="Image URL" value={manualForm.imageUrl} onChange={(e) => fm('imageUrl', e.target.value)}
            className="px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary sm:col-span-2 lg:col-span-2" />
        </div>
        <textarea placeholder="Description" rows={2} value={manualForm.description} onChange={(e) => fm('description', e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary resize-none" />
        <div className="flex items-center gap-3">
          {calculatedPrice > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-xs text-primary">Sell:</span>
              <span className="text-sm font-bold text-white">{formatPrice(calculatedPrice)}</span>
            </div>
          )}
          <Button type="submit" disabled={manualBusy} className="ml-auto">
            {manualBusy ? 'Importing...' : 'Import Product'}
          </Button>
        </div>
      </form>

      {/* ── Logs ── */}
      {(logs.length > 0 || step === 'importing') && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Import Logs</h2>
            <button onClick={() => setLogs([])} className="text-xs text-gray-500 hover:text-gray-500 transition-colors">Clear</button>
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-500 py-2">Waiting for import updates…</p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={log.id || i}
                  className={`flex items-start gap-2 text-xs py-1 ${
                    log.type === 'success' ? 'text-emerald-600'
                      : log.type === 'warning' ? 'text-amber-700'
                      : log.type === 'info' ? 'text-primary'
                      : 'text-red-600'
                  }`}
                >
                  {log.type === 'success'
                    ? <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    : log.type === 'info'
                    ? <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    : <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />}
                  {log.msg}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {dialog}
    </div>
  );
}

