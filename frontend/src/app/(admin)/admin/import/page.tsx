'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertTriangle, X, Package } from 'lucide-react';
import { importApi, categoriesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';

type LogEntry = { type: 'success' | 'error' | 'warning'; msg: string };

export default function AdminImportPage() {
  const { token } = useAuthStore();
  const [globalMarkup, setGlobalMarkup] = useState(25);
  const [markupBusy, setMarkupBusy] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewErrors, setPreviewErrors] = useState<any[]>([]);
  const [csvBusy, setCsvBusy] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [manualBusy, setManualBusy] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: '', description: '', category: '', supplierName: '',
    supplierSku: '', costPrice: '', markupPercentage: '', imageUrl: '',
  });

  const addLog = (type: LogEntry['type'], msg: string) =>
    setLogs((prev) => [{ type, msg }, ...prev].slice(0, 50));

  const calculatedPrice = (() => {
    const cost = Number(manualForm.costPrice || 0);
    const markup = Number(manualForm.markupPercentage || globalMarkup || 0);
    return cost > 0 ? Math.round(cost * (1 + markup / 100)) : 0;
  })();

  const handleSaveMarkup = async () => {
    if (!token) return;
    setMarkupBusy(true);
    try {
      const data = await importApi.updateSettings(token, { globalMarkup });
      setGlobalMarkup(data.globalMarkup);
      addLog('success', `Global markup updated to ${data.globalMarkup}%`);
    } catch (err: any) {
      addLog('error', `Markup update failed: ${err.message}`);
    } finally {
      setMarkupBusy(false);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!token) return;
    try {
      const blob = await importApi.downloadTemplate(token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bretunetech-import-template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      addLog('error', `Template download failed: ${err.message}`);
    }
  };

  const handleCsvPreview = async () => {
    if (!token || !csvFile) return;
    setCsvBusy(true);
    try {
      const data = await importApi.previewCsv(token, csvFile, globalMarkup);
      setPreviewRows(data.rows || []);
      setPreviewErrors(data.errors || []);
      addLog('success', `Preview loaded — ${data.rows?.length || 0} rows`);
    } catch (err: any) {
      addLog('error', `Preview failed: ${err.message}`);
    } finally {
      setCsvBusy(false);
    }
  };

  const handleCsvImport = async () => {
    if (!token || !csvFile) return;
    setCsvBusy(true);
    try {
      const result = await importApi.importCsv(token, csvFile, { globalMarkup, skipDuplicates: true, uploadImages: true });
      addLog(result.failed > 0 ? 'warning' : 'success',
        `Import complete — ${result.imported} imported, ${result.skipped} skipped, ${result.failed} failed`);
      (result.parseErrors || []).forEach((e: any) => addLog('error', `Row ${e.row}: ${e.error}`));
      setCsvFile(null);
      setPreviewRows([]);
      setPreviewErrors([]);
    } catch (err: any) {
      addLog('error', `Import failed: ${err.message}`);
    } finally {
      setCsvBusy(false);
    }
  };

  const handleManualImport = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setManualBusy(true);
    try {
      const result = await importApi.importSingle(token, {
        name: manualForm.name,
        description: manualForm.description,
        category: manualForm.category,
        supplierName: manualForm.supplierName || undefined,
        supplierSku: manualForm.supplierSku || undefined,
        costPrice: Number(manualForm.costPrice),
        markupPercentage: manualForm.markupPercentage ? Number(manualForm.markupPercentage) : undefined,
        imageUrl: manualForm.imageUrl || undefined,
      });
      if (result.success) {
        addLog('success', `Imported: ${result.name}`);
        setManualForm({ name: '', description: '', category: '', supplierName: '', supplierSku: '', costPrice: '', markupPercentage: '', imageUrl: '' });
      } else {
        addLog('error', `Failed: ${result.name} — ${result.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      addLog('error', `Import failed: ${err.message}`);
    } finally {
      setManualBusy(false);
    }
  };

  const fm = (field: string, value: string) => setManualForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Product Import</h1>
        <p className="text-slate-500 text-sm mt-0.5">Import products via CSV or manually one at a time.</p>
      </div>

      {/* Global Markup Setting */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Global Markup Setting</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Default Markup %</label>
            <div className="relative">
              <input
                type="number" min={0} max={500} value={globalMarkup}
                onChange={(e) => setGlobalMarkup(Number(e.target.value || 0))}
                className="w-32 px-3 pr-7 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
            </div>
          </div>
          <button onClick={handleSaveMarkup} disabled={markupBusy}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
            {markupBusy ? 'Saving...' : 'Save'}
          </button>
          <button onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg border border-slate-700 transition-colors">
            <Download className="w-4 h-4" /> CSV Template
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Manual Import */}
        <form onSubmit={handleManualImport} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-violet-400" /> Manual Import
          </h2>
          <div className="space-y-3">
            <input required placeholder="Product name *" value={manualForm.name}
              onChange={(e) => fm('name', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
            <textarea required placeholder="Description *" rows={3} value={manualForm.description}
              onChange={(e) => fm('description', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Category *" value={manualForm.category}
                onChange={(e) => fm('category', e.target.value)}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
              <input placeholder="Supplier name" value={manualForm.supplierName}
                onChange={(e) => fm('supplierName', e.target.value)}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
              <input placeholder="Supplier SKU" value={manualForm.supplierSku}
                onChange={(e) => fm('supplierSku', e.target.value)}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono" />
              <input type="number" required min={0} step="0.01" placeholder="Cost price *" value={manualForm.costPrice}
                onChange={(e) => fm('costPrice', e.target.value)}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
              <input type="number" min={0} max={500} placeholder={`Markup % (default: ${globalMarkup}%)`} value={manualForm.markupPercentage}
                onChange={(e) => fm('markupPercentage', e.target.value)}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
              <input placeholder="Image URL" value={manualForm.imageUrl}
                onChange={(e) => fm('imageUrl', e.target.value)}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
            </div>
          </div>
          {calculatedPrice > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-violet-500/10 border border-violet-500/25 rounded-xl">
              <span className="text-xs text-violet-400">Calculated selling price</span>
              <span className="text-lg font-bold text-white">{formatPrice(calculatedPrice)}</span>
            </div>
          )}
          <button type="submit" disabled={manualBusy}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
            {manualBusy ? 'Importing...' : 'Import Product'}
          </button>
        </form>

        {/* CSV Import */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Bulk CSV Import
          </h2>

          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${csvFile ? 'border-violet-500/40 bg-violet-500/5' : 'border-slate-700 hover:border-slate-600'}`}>
            {csvFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  {csvFile.name}
                </div>
                <button onClick={() => { setCsvFile(null); setPreviewRows([]); setPreviewErrors([]); }}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Drop a CSV file here or</p>
                <label className="mt-2 inline-block cursor-pointer text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
                  browse files
                  <input type="file" accept=".csv,text/csv" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0] || null; setCsvFile(f); setPreviewRows([]); setPreviewErrors([]); }} />
                </label>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={handleCsvPreview} disabled={!csvFile || csvBusy}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors">
              Preview
            </button>
            <button onClick={handleCsvImport} disabled={!csvFile || csvBusy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              <Upload className="w-4 h-4" /> {csvBusy ? 'Importing...' : 'Import'}
            </button>
          </div>

          {previewRows.length > 0 && (
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Name', 'Category', 'SKU', 'Cost', 'Sell'].map((h) => (
                      <th key={h} className="text-left px-3 py-2 text-slate-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {previewRows.slice(0, 8).map((row, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-slate-300 max-w-[120px] truncate">{row.name}</td>
                      <td className="px-3 py-2 text-slate-500">{row.categorySlug}</td>
                      <td className="px-3 py-2 text-slate-500 font-mono">{row.supplier_sku || '—'}</td>
                      <td className="px-3 py-2 text-slate-400">{formatPrice(row.cost_price)}</td>
                      <td className="px-3 py-2 text-emerald-400 font-semibold">{formatPrice(row.sellingPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewRows.length > 8 && (
                <p className="px-3 py-2 text-xs text-slate-600">+{previewRows.length - 8} more rows</p>
              )}
            </div>
          )}
          {previewErrors.length > 0 && (
            <div className="space-y-1">
              {previewErrors.slice(0, 5).map((e, i) => (
                <p key={i} className="text-xs text-red-400">Row {e.row}: {e.error}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Import Logs</h2>
            <button onClick={() => setLogs([])} className="text-xs text-slate-500 hover:text-slate-400 transition-colors">Clear</button>
          </div>
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className={`flex items-start gap-2 text-xs py-1 ${
                log.type === 'success' ? 'text-emerald-400' :
                log.type === 'warning' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {log.type === 'success' ? <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" /> :
                 <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />}
                {log.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
