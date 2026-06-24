'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, RefreshCw, AlertTriangle, CheckCircle, XCircle, ChevronRight, Globe, Image, FileText, Tag, Zap, Activity, ShieldCheck, Cpu, Trash2, Download, Eye, Play } from 'lucide-react';
import { seoApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

interface ProductScore {
  id: string;
  name: string;
  slug: string;
  score: number;
  maxScore: number;
  issues: string[];
  imageCount: number;
  hasCategory: boolean;
  hasBrand: boolean;
}

interface Summary {
  avgScore: number;
  total: number;
  excellent: number;
  good: number;
  poor: number;
}

export default function SEOPage() {
  const { token } = useAuthStore();
  const [tab, setTab] = useState<'scores' | 'generator' | 'health' | 'specs' | 'cleanup'>('scores');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [products, setProducts] = useState<ProductScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'excellent' | 'good' | 'poor'>('all');

  // Bulk generator state
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<any>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [assigningBrands, setAssigningBrands] = useState(false);
  const [brandResult, setBrandResult] = useState<any>(null);

  // Health state
  const [healthLoading, setHealthLoading] = useState(false);
  const [health, setHealth] = useState<any>(null);

  // Specs extractor state
  const [extractingSpecs, setExtractingSpecs] = useState(false);
  const [specsResult, setSpecsResult] = useState<any>(null);
  const [specsOpts, setSpecsOpts] = useState({ onlyWithoutSpecs: true, replace: false, removeFromAdditionalInfo: false });

  // Content cleanup state
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [cleaning, setCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [cleanupOpts, setCleanupOpts] = useState({ onlyAffected: true, previewOnly: false });
  const [backupCreated, setBackupCreated] = useState(false);
  const [backupResult, setBackupResult] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await seoApi.getProductScores(token);
      setSummary(data.summary);
      setProducts(data.products);
    } catch (err: any) {
      console.error('Failed to load SEO scores:', err);
      setError(err?.status === 404 ? 'SEO endpoint not found. Please restart the backend server.' : (err?.message || 'Failed to load SEO scores.'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchHealth = useCallback(async () => {
    if (!token) return;
    setHealthLoading(true);
    try {
      const data = await seoApi.getHealth(token);
      setHealth(data);
    } catch (err: any) {
      console.error('Failed to load health:', err);
    } finally {
      setHealthLoading(false);
    }
  }, [token]);

  const handleGenerate = async () => {
    if (!token) return;
    setGenerating(true);
    setGenResult(null);
    try {
      const result = await seoApi.generateAll(token, overwrite);
      setGenResult(result);
      fetchData();
    } catch (err: any) {
      setGenResult({ error: err?.message || 'Generation failed' });
    } finally {
      setGenerating(false);
    }
  };

  const handleAssignBrands = async () => {
    if (!token) return;
    setAssigningBrands(true);
    setBrandResult(null);
    try {
      const result = await seoApi.assignBrands(token);
      setBrandResult(result);
      fetchData();
      if (tab === 'health') fetchHealth();
    } catch (err: any) {
      setBrandResult({ error: err?.message || 'Brand assignment failed' });
    } finally {
      setAssigningBrands(false);
    }
  };

  const handleExtractSpecs = async () => {
    if (!token) return;
    setExtractingSpecs(true);
    setSpecsResult(null);
    try {
      const result = await seoApi.extractSpecs(token, specsOpts);
      setSpecsResult(result);
      fetchData();
    } catch (err: any) {
      setSpecsResult({ error: err?.message || 'Extraction failed' });
    } finally {
      setExtractingSpecs(false);
    }
  };

  const handleScan = async () => {
    if (!token) return;
    setScanning(true);
    setScanResult(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seo/cleanup/scan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setScanResult(data);
    } catch (err: any) {
      setScanResult({ error: err?.message || 'Scan failed' });
    } finally {
      setScanning(false);
    }
  };

  const handleBackup = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seo/cleanup/backup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setBackupResult(data);
      setBackupCreated(true);
    } catch (err: any) {
      setBackupResult({ error: err?.message || 'Backup failed' });
    }
  };

  const handleClean = async () => {
    if (!token) return;
    setCleaning(true);
    setCleanResult(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seo/cleanup/execute`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanupOpts),
      });
      const data = await response.json();
      setCleanResult(data);
      if (!cleanupOpts.previewOnly) {
        setScanResult(null);
      }
    } catch (err: any) {
      setCleanResult({ error: err?.message || 'Cleanup failed' });
    } finally {
      setCleaning(false);
    }
  };

  const handleExportCSV = () => {
    if (!scanResult?.products) return;
    const headers = ['ID', 'Name', 'Field', 'Before', 'After'];
    const rows = scanResult.products.flatMap((p: any) =>
      p.changes.map((change: string) => [
        p.id,
        p.name,
        change,
        p.current[change]?.substring(0, 100) || '',
        p.proposed[change]?.substring(0, 100) || '',
      ])
    );
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleanup_preview_${Date.now()}.csv`;
    a.click();
  };

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (tab === 'health') fetchHealth(); }, [tab, fetchHealth]);

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'excellent') return p.score >= 80;
    if (filter === 'good') return p.score >= 60 && p.score < 80;
    if (filter === 'poor') return p.score < 60;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreBar = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">SEO Tools</h1>
          <p className="text-gray-500 text-sm mt-0.5">Automatic SEO generation, scoring, and health monitoring</p>
        </div>
        <button
          onClick={tab === 'health' ? fetchHealth : fetchData}
          disabled={loading || healthLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${(loading || healthLoading) ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {([
          { key: 'scores', label: 'Score Checker', icon: ShieldCheck },
          { key: 'generator', label: 'Bulk Generator', icon: Zap },
          { key: 'health', label: 'Health Dashboard', icon: Activity },
          { key: 'specs', label: 'Specs Extractor', icon: Cpu },
          { key: 'cleanup', label: 'Content Cleanup', icon: Trash2 },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && tab === 'scores' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <p className="font-semibold">Error loading SEO scores</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* ═══ TAB: SCORES ═══ */}
      {tab === 'scores' && (
        <>
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Avg Score</p>
                <p className={`text-2xl font-bold mt-1 ${getScoreColor(summary.avgScore)}`}>{summary.avgScore}/100</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Total Products</p>
                <p className="text-2xl font-bold mt-1 text-gray-900">{summary.total}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Excellent</p>
                </div>
                <p className="text-2xl font-bold mt-1 text-emerald-600">{summary.excellent}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Good</p>
                </div>
                <p className="text-2xl font-bold mt-1 text-amber-600">{summary.good}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Poor</p>
                </div>
                <p className="text-2xl font-bold mt-1 text-red-600">{summary.poor}</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900" />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'poor', 'good', 'excellent'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Product</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-24">Score</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase hidden lg:table-cell">Issues</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-16">Images</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-20">Category</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-20">Brand</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-xs">Loading SEO scores...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-xs">No products found</td></tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">{p.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">/{p.slug}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${getScoreBar(p.score)}`} style={{ width: `${p.score}%` }} />
                            </div>
                            <span className={`text-xs font-bold ${getScoreColor(p.score)}`}>{p.score}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {p.issues.slice(0, 3).map((issue, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded border border-red-100">
                                {issue.length > 40 ? issue.substring(0, 40) + '…' : issue}
                              </span>
                            ))}
                            {p.issues.length > 3 && <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded">+{p.issues.length - 3} more</span>}
                            {p.issues.length === 0 && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100">All good</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Image className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-700">{p.imageCount}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{p.hasCategory ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                        <td className="px-4 py-3">{p.hasBrand ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/products/${p.id}`} className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══ TAB: BULK GENERATOR ═══ */}
      {tab === 'generator' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-violet-600" />
                Generate SEO For All Products
              </h2>
              <p className="text-sm text-gray-500 mt-1">Automatically generate meta titles, descriptions, and focus keywords for products missing SEO data.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">What will be generated:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Meta Title: <code className="text-xs bg-white px-1 rounded">[Product Name] | BretuneTech South Africa</code></li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Meta Description: First 155 chars of description or auto-generated</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Focus Keyword: Brand + key product words</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Product Schema (JSON-LD) generated on page load</li>
              </ul>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
              Overwrite existing SEO fields (regenerate all)
            </label>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><Zap className="w-4 h-4" /> Generate SEO For All Products</>
              )}
            </button>
          </div>

          {/* Generation Results */}
          {genResult && (
            <div className={`border rounded-xl p-5 ${genResult.error ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              {genResult.error ? (
                <p className="text-sm text-red-700 font-medium">{genResult.error}</p>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-900">Generation Complete</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{genResult.processed}</p>
                      <p className="text-xs text-gray-500">Processed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">{genResult.success}</p>
                      <p className="text-xs text-gray-500">Success</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{genResult.errors}</p>
                      <p className="text-xs text-gray-500">Errors</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auto-Assign Brands */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" />
                Auto-Assign Brands to Products
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Automatically matches brand names found in product names and links them. Fixes the &quot;Missing Brand&quot; issue for 900+ products.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              Only assigns brands to products that currently have <strong>no brand set</strong>. Existing brand assignments will not be changed.
            </div>

            <button
              onClick={handleAssignBrands}
              disabled={assigningBrands}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {assigningBrands ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Assigning Brands...</>
              ) : (
                <><Tag className="w-4 h-4" /> Auto-Assign Brands</>
              )}
            </button>

            {brandResult && (
              <div className={`border rounded-xl p-5 ${brandResult.error ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                {brandResult.error ? (
                  <p className="text-sm text-red-700 font-medium">{brandResult.error}</p>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-amber-900">Brand Assignment Complete</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{brandResult.processed}</p>
                        <p className="text-xs text-gray-500">Processed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-600">{brandResult.assigned}</p>
                        <p className="text-xs text-gray-500">Brands Assigned</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-500">{brandResult.skipped}</p>
                        <p className="text-xs text-gray-500">No Match Found</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ TAB: HEALTH DASHBOARD ═══ */}
      {tab === 'health' && (
        <div className="space-y-6">
          {healthLoading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading health report...</div>
          ) : health ? (
            <>
              {/* Score Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Total Products</p>
                  <p className="text-2xl font-bold mt-1 text-gray-900">{health.totalProducts}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Avg SEO Score</p>
                  <p className={`text-2xl font-bold mt-1 ${getScoreColor(health.seoScore?.avgScore || 0)}`}>{health.seoScore?.avgScore || 0}/100</p>
                </div>
                <div className="bg-white border border-emerald-200 rounded-xl p-4 bg-emerald-50">
                  <p className="text-[11px] text-emerald-700 uppercase tracking-wider font-medium">Excellent (80+)</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-600">{health.seoScore?.excellent || 0}</p>
                </div>
                <div className="bg-white border border-red-200 rounded-xl p-4 bg-red-50">
                  <p className="text-[11px] text-red-700 uppercase tracking-wider font-medium">Poor (&lt;60)</p>
                  <p className="text-2xl font-bold mt-1 text-red-600">{health.seoScore?.poor || 0}</p>
                </div>
              </div>

              {/* Issue Sections */}
              {[
                { title: 'Products Missing Images', data: health.missingImages, color: 'red' },
                { title: 'Products Missing/Short Descriptions', data: health.missingDescriptions, color: 'amber' },
                { title: 'Products Missing Brand', data: health.missingBrand, color: 'amber' },
                { title: 'Products With Short Names (<10 chars)', data: health.shortNames, color: 'amber' },
              ].map((section) => (
                <div key={section.title} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      section.data?.length > 0 ? `bg-${section.color}-100 text-${section.color}-700` : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {section.data?.length || 0}
                    </span>
                  </div>
                  {section.data?.length > 0 ? (
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {section.data.slice(0, 20).map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50">
                          <span className="text-xs text-gray-700 truncate max-w-[300px]">{item.name}</span>
                          <Link href={`/admin/products/${item.id}`} className="text-xs text-cyan-600 hover:text-cyan-700">Edit</Link>
                        </div>
                      ))}
                      {section.data.length > 20 && <p className="text-xs text-gray-400 px-2">+{section.data.length - 20} more</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600">All products pass this check</p>
                  )}
                </div>
              ))}

              {/* Duplicate Descriptions */}
              {health.duplicateDescriptions?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Duplicate Descriptions ({health.duplicateDescriptions.length} groups)</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {health.duplicateDescriptions.slice(0, 10).map((dup: any, i: number) => (
                      <div key={i} className="p-2 bg-amber-50 rounded-lg">
                        <p className="text-xs text-gray-500 truncate">&ldquo;{dup.description.substring(0, 80)}...&rdquo;</p>
                        <p className="text-xs text-amber-700 font-medium mt-1">{dup.count} products share this description</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
      {/* ═══ TAB: SPECS EXTRACTOR ═══ */}
      {tab === 'specs' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-violet-600" />
                Extract Specifications From Additional Info
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Automatically parses spec text like <code className="bg-gray-100 px-1 rounded text-xs">Power: 80W;</code> or <code className="bg-gray-100 px-1 rounded text-xs">Voltage = 220V</code> from the Additional Info field into structured Product Specifications.
              </p>
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 text-xs text-violet-800 space-y-1">
              <p className="font-semibold">Supported formats:</p>
              <p><code>Power: 80W;</code> &nbsp;|&nbsp; <code>Voltage = 220V</code> &nbsp;|&nbsp; <code>Material - ABS Plastic</code></p>
              <p className="mt-2 font-semibold">Auto-normalized spec names:</p>
              <p>colour → Colour &nbsp;|&nbsp; wifi standard → WiFi Standard &nbsp;|&nbsp; weight → Weight &nbsp;|&nbsp; poe → PoE</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={specsOpts.onlyWithoutSpecs}
                  onChange={e => setSpecsOpts(o => ({ ...o, onlyWithoutSpecs: e.target.checked }))}
                  className="w-4 h-4 rounded accent-violet-600"
                />
                <span className="text-sm text-gray-700">Only process products without existing specifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={specsOpts.replace}
                  onChange={e => setSpecsOpts(o => ({ ...o, replace: e.target.checked }))}
                  className="w-4 h-4 rounded accent-violet-600"
                />
                <span className="text-sm text-gray-700">Replace existing specifications (delete and recreate)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={specsOpts.removeFromAdditionalInfo}
                  onChange={e => setSpecsOpts(o => ({ ...o, removeFromAdditionalInfo: e.target.checked }))}
                  className="w-4 h-4 rounded accent-violet-600"
                />
                <span className="text-sm text-gray-700">Remove extracted lines from Additional Info after extraction</span>
              </label>
            </div>

            <button
              onClick={handleExtractSpecs}
              disabled={extractingSpecs}
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {extractingSpecs
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Extracting Specs...</>
                : <><Cpu className="w-4 h-4" /> Extract Specifications From Additional Info</>}
            </button>

            {specsResult && (
              <div className={`border rounded-xl p-5 ${
                specsResult.error ? 'bg-red-50 border-red-200' : 'bg-violet-50 border-violet-200'
              }`}>
                {specsResult.error ? (
                  <p className="text-sm text-red-700 font-medium">{specsResult.error}</p>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-violet-900">Extraction Complete</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{specsResult.scanned}</p>
                        <p className="text-xs text-gray-500">Products Scanned</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-violet-600">{specsResult.specsCreated}</p>
                        <p className="text-xs text-gray-500">Specs Created</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-500">{specsResult.duplicatesSkipped}</p>
                        <p className="text-xs text-gray-500">Duplicates Skipped</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-500">{specsResult.errors}</p>
                        <p className="text-xs text-gray-500">Errors</p>
                      </div>
                    </div>

                    {specsResult.details?.filter((d: any) => d.extracted > 0).length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-violet-800 mb-2">Products with new specs ({specsResult.details.filter((d: any) => d.extracted > 0).length})</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {specsResult.details
                            .filter((d: any) => d.extracted > 0)
                            .map((d: any) => (
                              <div key={d.id} className="flex items-center justify-between px-2 py-1 bg-white rounded-lg border border-violet-100 text-xs">
                                <span className="text-gray-700 truncate max-w-[60%]">{d.name}</span>
                                <span className="text-violet-600 font-medium">+{d.extracted} specs</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">How Auto-Extraction Works</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="space-y-2">
                <p className="font-medium text-gray-800">On every product save:</p>
                <p>If Additional Info contains <code className="bg-gray-100 px-1 rounded">Key: Value;</code> entries, they are automatically converted into structured specifications — no manual action needed.</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-800">Duplicate prevention:</p>
                <p>Existing specifications with the same name are never overwritten unless you check &ldquo;Replace existing&rdquo; above. Safe to run multiple times.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: CONTENT CLEANUP ═══ */}
      {tab === 'cleanup' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-violet-600" />
                Remove Supplier Wording
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Automatically remove supplier branding (e.g., "Scoop's", "supplied by Scoop") from product descriptions and replace with BretuneTech wording.
              </p>
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 text-xs text-violet-800 space-y-2">
              <p className="font-semibold">Replacements:</p>
              <ul className="space-y-1 ml-4">
                <li>• Scoop is preserved as a brand name</li>
                <li>• No supplier wording replacements applied</li>
              </ul>
              <p className="font-semibold mt-3">Important:</p>
              <p>Brand names (Scoop, Ubiquiti, Reyee, Cudy, Ruijie, Linkbasic, etc.) are preserved in all content.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleScan}
                disabled={scanning}
                className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {scanning ? <><RefreshCw className="w-4 h-4 animate-spin" /> Scanning...</> : <><Eye className="w-4 h-4" /> Scan Products</>}
              </button>
              {scanResult && (
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              )}
            </div>

            {/* Scan Results */}
            {scanResult && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Scan Results</h3>
                  <span className="text-xs text-gray-500">{scanResult.scanned} products scanned, {scanResult.affected} affected</span>
                </div>
                {scanResult.affected > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {scanResult.products.slice(0, 10).map((p: any) => (
                      <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-3 text-xs">
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-gray-500 mt-1">Changes: {p.changes.join(', ')}</p>
                      </div>
                    ))}
                    {scanResult.products.length > 10 && <p className="text-xs text-gray-400">+{scanResult.products.length - 10} more products</p>}
                  </div>
                ) : (
                  <p className="text-sm text-emerald-600">No supplier wording found in any products.</p>
                )}
              </div>
            )}

            {/* Backup */}
            {scanResult && scanResult.affected > 0 && (
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Create Backup</h3>
                    <p className="text-xs text-gray-500">Recommended before making changes</p>
                  </div>
                  <button
                    onClick={handleBackup}
                    disabled={backupCreated}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    {backupCreated ? <><CheckCircle className="w-4 h-4" /> Backup Created</> : <><Download className="w-4 h-4" /> Create Backup</>}
                  </button>
                </div>
                {backupResult && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700">
                    Backup created: {backupResult.backupId} ({backupResult.count} products)
                  </div>
                )}
              </div>
            )}

            {/* Cleanup Options */}
            {scanResult && scanResult.affected > 0 && (
              <div className="border-t border-gray-200 pt-4 space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cleanupOpts.onlyAffected}
                      onChange={e => setCleanupOpts(o => ({ ...o, onlyAffected: e.target.checked }))}
                      className="w-4 h-4 rounded accent-violet-600"
                    />
                    <span className="text-sm text-gray-700">Only process products with supplier wording</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cleanupOpts.previewOnly}
                      onChange={e => setCleanupOpts(o => ({ ...o, previewOnly: e.target.checked }))}
                      className="w-4 h-4 rounded accent-violet-600"
                    />
                    <span className="text-sm text-gray-700">Preview only (don't save changes)</span>
                  </label>
                </div>

                <button
                  onClick={handleClean}
                  disabled={cleaning || (scanResult.affected > 0 && !backupCreated)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cleaning ? <><RefreshCw className="w-4 h-4 animate-spin" /> Cleaning...</> : <><Play className="w-4 h-4" /> {cleanupOpts.previewOnly ? 'Preview Changes' : 'Execute Cleanup'}</>}
                </button>
              </div>
            )}

            {/* Cleanup Results */}
            {cleanResult && (
              <div className={`border rounded-xl p-5 ${cleanResult.error ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                {cleanResult.error ? (
                  <p className="text-sm text-red-700 font-medium">{cleanResult.error}</p>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-emerald-900">Cleanup Complete</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{cleanResult.scanned}</p>
                        <p className="text-xs text-gray-500">Scanned</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-violet-600">{cleanResult.affected}</p>
                        <p className="text-xs text-gray-500">Affected</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-600">{cleanResult.updated}</p>
                        <p className="text-xs text-gray-500">Updated</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{cleanResult.errors}</p>
                        <p className="text-xs text-gray-500">Errors</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
