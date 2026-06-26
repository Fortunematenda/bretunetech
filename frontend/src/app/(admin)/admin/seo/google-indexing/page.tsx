'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { googleIndexingApi, seoApi } from '@/lib/api';
import {
  Globe, Search, RefreshCw, ExternalLink, AlertTriangle, CheckCircle, XCircle,
  Clock, FileSearch, BarChart3, Zap, Image, Link as LinkIcon, Tag, Trash2,
  ShieldCheck, Activity, List, Bell, CheckSquare, Square, Loader2,
} from 'lucide-react';

interface DashboardSummary {
  indexedPages: number;
  notIndexedPages: number;
  crawledButNotIndexed: number;
  discoveredButNotIndexed: number;
  duplicatePages: number;
  pagesWithErrors: number;
  totalInspected: number;
  lastChecked: string | null;
  apiEnabled: boolean;
}

interface InspectionRecord {
  url: string;
  pageType: string;
  status: string | null;
  coverageState: string | null;
  indexedStatus?: string | null;
  lastCrawlTime: string | null;
  googleCanonical: string | null;
  userCanonical: string | null;
  robotsState: string | null;
  pageFetchState: string | null;
  mobileUsability: string | null;
  richResults: string | null;
  issue: string | null;
  recommendedFix: string | null;
  checkedAt: string | null;
  lastChecked?: string | null;
  notes?: string | null;
  needsFollowUp?: boolean;
  gscUrl?: string;
  seoScore?: number | null;
}

interface PriorityProduct {
  id: string;
  name: string;
  slug: string;
  url: string;
  priorityScore: number;
  views: number;
  margin: number;
  stockQuantity: number;
  isFeatured: boolean;
  seoScore: number | null;
  status?: string | null;
  coverageState?: string | null;
  checkedAt?: string | null;
  gscUrl?: string;
  needsFollowUp?: boolean;
}

const CHECKLIST_ITEMS = [
  { key: 'sitemapSubmitted', label: 'Sitemap submitted to Google Search Console' },
  { key: 'sitemapStatusSuccess', label: 'Sitemap status success / no errors' },
  { key: 'robotsTxtWorking', label: 'Robots.txt working and not blocking important pages' },
  { key: 'homepageInspected', label: 'Homepage inspected' },
  { key: 'productsInspected', label: '10–20 important products inspected' },
] as const;

const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'important', label: 'Important Pages', icon: ShieldCheck },
  { key: 'products', label: 'Priority Products', icon: Activity },
  { key: 'followups', label: 'Follow-Ups', icon: Bell },
  { key: 'reports', label: 'Health Report', icon: FileSearch },
  { key: 'tools', label: 'Bulk SEO Tools', icon: Zap },
] as const;

export default function GoogleIndexingPage() {
  const { token } = useAuthStore();
  const [tab, setTab] = useState<'dashboard' | 'important' | 'products' | 'followups' | 'reports' | 'tools'>('dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('googleIndexingTab');
    if (saved && tabs.some((t) => t.key === saved)) {
      setTab(saved as any);
    }
  }, []);

  const changeTab = (key: typeof tab) => {
    setTab(key);
    localStorage.setItem('googleIndexingTab', key);
  };
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [importantPages, setImportantPages] = useState<InspectionRecord[]>([]);
  const [priorityProducts, setPriorityProducts] = useState<PriorityProduct[]>([]);
  const [followUps, setFollowUps] = useState<InspectionRecord[]>([]);
  const [report, setReport] = useState<InspectionRecord[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [gscBaseUrl, setGscBaseUrl] = useState<string>('');
  const [sitemapUrl, setSitemapUrl] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [toolResult, setToolResult] = useState<any>(null);
  const [runningTool, setRunningTool] = useState<string | null>(null);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    setLoading((l) => ({ ...l, dashboard: true }));
    try {
      const data = await googleIndexingApi.getDashboard(token);
      setDashboard(data);
    } catch (err: any) {
      showMessage(err?.message || 'Failed to load dashboard', 'error');
    } finally {
      setLoading((l) => ({ ...l, dashboard: false }));
    }
  }, [token]);

  const loadImportantPages = useCallback(async () => {
    if (!token) return;
    setLoading((l) => ({ ...l, important: true }));
    try {
      const data = await googleIndexingApi.getImportantPages(token);
      setImportantPages(data.pages);
      setGscBaseUrl(data.gscBaseUrl);
    } catch (err: any) {
      showMessage(err?.message || 'Failed to load important pages', 'error');
    } finally {
      setLoading((l) => ({ ...l, important: false }));
    }
  }, [token]);

  const loadPriorityProducts = useCallback(async () => {
    if (!token) return;
    setLoading((l) => ({ ...l, products: true }));
    try {
      const data = await googleIndexingApi.getPriorityProducts(token);
      setPriorityProducts(data.products);
      setGscBaseUrl(data.gscBaseUrl);
    } catch (err: any) {
      showMessage(err?.message || 'Failed to load priority products', 'error');
    } finally {
      setLoading((l) => ({ ...l, products: false }));
    }
  }, [token]);

  const loadFollowUps = useCallback(async () => {
    if (!token) return;
    setLoading((l) => ({ ...l, followups: true }));
    try {
      const data = await googleIndexingApi.getFollowUps(token);
      setFollowUps(data.followUps);
      setGscBaseUrl(data.gscBaseUrl);
    } catch (err: any) {
      showMessage(err?.message || 'Failed to load follow-ups', 'error');
    } finally {
      setLoading((l) => ({ ...l, followups: false }));
    }
  }, [token]);

  const loadReport = useCallback(async () => {
    if (!token) return;
    setLoading((l) => ({ ...l, reports: true }));
    try {
      const data = await googleIndexingApi.getHealthReport(token);
      setReport(data.report);
    } catch (err: any) {
      showMessage(err?.message || 'Failed to load health report', 'error');
    } finally {
      setLoading((l) => ({ ...l, reports: false }));
    }
  }, [token]);

  const loadChecklist = useCallback(async () => {
    if (!token) return;
    try {
      const data = await googleIndexingApi.getChecklist(token);
      setChecklist(data);
      setSitemapUrl(data.sitemapUrl);
    } catch (err: any) {
      showMessage(err?.message || 'Failed to load checklist', 'error');
    }
  }, [token]);

  const loadAll = useCallback(async () => {
    await Promise.all([
      loadDashboard(),
      loadImportantPages(),
      loadPriorityProducts(),
      loadFollowUps(),
      loadReport(),
      loadChecklist(),
    ]);
  }, [loadDashboard, loadImportantPages, loadPriorityProducts, loadFollowUps, loadReport, loadChecklist]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const inspectUrl = async (url: string, pageType: string = 'page') => {
    if (!token) return;
    setLoading((l) => ({ ...l, [url]: true }));
    try {
      await googleIndexingApi.inspectUrl(token, url, pageType);
      showMessage(`Inspected ${url}`);
      await loadAll();
    } catch (err: any) {
      showMessage(err?.message || `Failed to inspect ${url}`, 'error');
    } finally {
      setLoading((l) => ({ ...l, [url]: false }));
    }
  };

  const inspectImportantPages = async () => {
    if (!token) return;
    const urls = importantPages.map((p) => ({ url: p.url, pageType: p.pageType }));
    if (urls.length === 0) {
      showMessage('No important pages to inspect', 'error');
      return;
    }
    setLoading((l) => ({ ...l, importantBatch: true }));
    try {
      await googleIndexingApi.inspectBatch(token, urls, 'Important page batch check');
      showMessage('Important pages checked');
      await loadAll();
    } catch (err: any) {
      showMessage(err?.message || 'Failed to inspect important pages', 'error');
    } finally {
      setLoading((l) => ({ ...l, importantBatch: false }));
    }
  };

  const inspectPriorityProducts = async () => {
    if (!token) return;
    const urls = priorityProducts.map((p) => ({ url: p.url, pageType: 'product' }));
    if (urls.length === 0) {
      showMessage('No priority products to inspect', 'error');
      return;
    }
    setLoading((l) => ({ ...l, productBatch: true }));
    try {
      await googleIndexingApi.inspectBatch(token, urls.slice(0, 20), 'Priority product batch check');
      showMessage('Priority products checked');
      await loadAll();
    } catch (err: any) {
      showMessage(err?.message || 'Failed to inspect priority products', 'error');
    } finally {
      setLoading((l) => ({ ...l, productBatch: false }));
    }
  };

  const toggleChecklist = async (key: string) => {
    if (!token) return;
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    try {
      await googleIndexingApi.updateChecklist(token, { [key]: next[key] });
    } catch (err: any) {
      showMessage(err?.message || 'Failed to save checklist', 'error');
    }
  };

  const openGsc = (url?: string) => {
    const target = url || gscBaseUrl;
    if (target) window.open(target, '_blank', 'noopener,noreferrer');
  };

  const runTool = async (name: string, fn: () => Promise<any>) => {
    if (!token) return;
    setRunningTool(name);
    setToolResult(null);
    try {
      const result = await fn();
      setToolResult({ name, result });
      showMessage(`${name} completed`);
    } catch (err: any) {
      setToolResult({ name, error: err?.message || `${name} failed` });
      showMessage(err?.message || `${name} failed`, 'error');
    } finally {
      setRunningTool(null);
    }
  };

  const getStatusColor = (state?: string | null) => {
    if (!state) return 'text-gray-500';
    if (state === 'Indexed' || state === 'IndexingAllowed') return 'text-emerald-600';
    if (state === 'CrawledNotIndexed') return 'text-amber-600';
    if (state === 'DiscoveredNotIndexed') return 'text-blue-600';
    if (state === 'Duplicate') return 'text-violet-600';
    return 'text-red-600';
  };

  const getStatusBadge = (state?: string | null) => {
    if (!state) return 'bg-gray-100 text-gray-700';
    if (state === 'Indexed' || state === 'IndexingAllowed') return 'bg-emerald-100 text-emerald-700';
    if (state === 'CrawledNotIndexed') return 'bg-amber-100 text-amber-700';
    if (state === 'DiscoveredNotIndexed') return 'bg-blue-100 text-blue-700';
    if (state === 'Duplicate') return 'bg-violet-100 text-violet-700';
    return 'bg-red-100 text-red-700';
  };

  const renderRefreshButton = () => (
    <button
      onClick={loadAll}
      disabled={loading.dashboard}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${loading.dashboard ? 'animate-spin' : ''}`} />
      Refresh
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-600" />
            Google Indexing Manager
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Monitor indexing status, inspect priority URLs, and improve SEO without overloading Google.
          </p>
        </div>
        {renderRefreshButton()}
      </div>

      {dashboard && !dashboard.apiEnabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Google Search Console API is not configured
          </p>
          <p className="mt-1">
            Set <code className="bg-white px-1 rounded">GOOGLE_SERVICE_ACCOUNT_EMAIL</code>,{' '}
            <code className="bg-white px-1 rounded">GOOGLE_PRIVATE_KEY</code>, and{' '}
            <code className="bg-white px-1 rounded">GSC_SITE_URL</code> in the backend <code className="bg-white px-1 rounded">.env</code>{' '}
            to enable automated URL Inspection. Until then, you can still use manual links and store check records.
          </p>
        </div>
      )}

      {message && (
        <div className={`border rounded-xl p-4 text-sm ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key as typeof tab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {dashboard && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Indexed Pages</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600">{dashboard.indexedPages}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Not Indexed</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{dashboard.notIndexedPages}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Crawled / Not Indexed</p>
                <p className="text-2xl font-bold mt-1 text-amber-600">{dashboard.crawledButNotIndexed}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Discovered / Not Indexed</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{dashboard.discoveredButNotIndexed}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Duplicate Pages</p>
                <p className="text-2xl font-bold mt-1 text-violet-600">{dashboard.duplicatePages}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Pages With Errors</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{dashboard.pagesWithErrors}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Total Inspected</p>
                <p className="text-2xl font-bold mt-1 text-gray-900">{dashboard.totalInspected}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Last Checked</p>
                <p className="text-sm font-semibold mt-2 text-gray-700">
                  {dashboard.lastChecked ? new Date(dashboard.lastChecked).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          )}

          {/* Sitemap Checklist */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-violet-600" />
                Sitemap & Submission Checklist
              </h2>
              <a
                href={sitemapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Sitemap
              </a>
            </div>
            <div className="space-y-2">
              {CHECKLIST_ITEMS.map((item) => (
                <label key={item.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  {checklist[item.key] ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={!!checklist[item.key]}
                    onChange={() => toggleChecklist(item.key)}
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => openGsc()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                <ExternalLink className="w-4 h-4" /> Open Search Console Settings
              </button>
              <button
                onClick={() => openGsc(`https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(gscBaseUrl || 'https://www.bretunetech.com')}`)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                <List className="w-4 h-4" /> Manage Sitemaps
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORTANT PAGES TAB */}
      {tab === 'important' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Important Pages</h2>
            <div className="flex gap-2">
              <button
                onClick={inspectImportantPages}
                disabled={loading.importantBatch}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {loading.importantBatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Inspect All Important Pages
              </button>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">URL</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-40">Status</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-48">Last Crawl</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-40">Issue</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-52">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {importantPages.map((p) => (
                    <tr key={p.url} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">{p.url}</p>
                        <p className="text-[11px] text-gray-400">{p.pageType}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getStatusBadge(p.coverageState)}`}>
                          {p.coverageState || 'Not checked'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {p.lastCrawlTime ? new Date(p.lastCrawlTime).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {p.issue ? <span className="text-xs text-red-600">{p.issue}</span> : <span className="text-xs text-emerald-600">No issue</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => inspectUrl(p.url, p.pageType)}
                            disabled={loading[p.url]}
                            className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Inspect URL via API"
                          >
                            {loading[p.url] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openGsc(p.gscUrl)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Open URL Inspection in Search Console"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRIORITY PRODUCTS TAB */}
      {tab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Priority Products To Check</h2>
            <button
              onClick={inspectPriorityProducts}
              disabled={loading.productBatch}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {loading.productBatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Inspect Top 20 Products
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Product</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-24">Priority</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-20">SEO</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-32">Status</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-52">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {priorityProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <Link href={`/admin/products/${p.id}`} className="text-sm font-medium text-gray-900 hover:text-violet-600 truncate max-w-[300px] block">
                          {p.name}
                        </Link>
                        <p className="text-[11px] text-gray-400">/{p.slug}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          views {p.views} · stock {p.stockQuantity} · margin R{p.margin.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-violet-600">{p.priorityScore}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${p.seoScore && p.seoScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {p.seoScore ?? '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getStatusBadge(p.coverageState)}`}>
                          {p.coverageState || 'Not checked'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => inspectUrl(p.url, 'product')}
                            disabled={loading[p.url]}
                            className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Inspect product URL"
                          >
                            {loading[p.url] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openGsc(p.gscUrl)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Open URL Inspection"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <Link href={`/admin/products/${p.id}`} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Tag className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FOLLOW-UPS TAB */}
      {tab === 'followups' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">URLs Needing Follow-Up</h2>
          {followUps.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              No follow-ups due. Check back 48 hours after requesting indexing.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">URL</th>
                      <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-32">Status</th>
                      <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-48">Checked</th>
                      <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Notes</th>
                      <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-40">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {followUps.map((r) => (
                      <tr key={r.url} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">{r.url}</p>
                          <p className="text-[11px] text-gray-400">{r.pageType}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getStatusBadge(r.coverageState)}`}>
                            {r.coverageState || 'Not checked'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {r.checkedAt ? new Date(r.checkedAt).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            defaultValue={r.notes || ''}
                            onBlur={(e) => {
                              if (token) googleIndexingApi.updateNotes(token, r.url, e.target.value).catch(() => {});
                            }}
                            placeholder="Add notes..."
                            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => inspectUrl(r.url, r.pageType)}
                              disabled={loading[r.url]}
                              className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Recheck status"
                            >
                              {loading[r.url] ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => openGsc(r.gscUrl)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (token) {
                                  googleIndexingApi.dismissFollowUp(token, r.url)
                                    .then(() => loadFollowUps())
                                    .catch((err: any) => showMessage(err?.message || 'Failed', 'error'));
                                }
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Dismiss follow-up"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HEALTH REPORT TAB */}
      {tab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Indexing Health Report</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">URL</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-24">Type</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-20">SEO</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-32">Indexed</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-48">Last Checked</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Issue</th>
                    <th className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Recommended Fix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {report.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-xs">
                        No inspection records yet. Inspect important pages or products to build the report.
                      </td>
                    </tr>
                  ) : (
                    report.map((r) => (
                      <tr key={r.url} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">{r.url}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 capitalize">{r.pageType}</td>
                        <td className="px-4 py-3 text-xs font-semibold">{r.seoScore ?? '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getStatusBadge(r.indexedStatus)}`}>
                            {r.indexedStatus || 'Not checked'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {r.lastChecked ? new Date(r.lastChecked).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-red-600">{r.issue || '-'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{r.recommendedFix || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BULK TOOLS TAB */}
      {tab === 'tools' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ToolCard
              title="Generate SEO For All Products"
              description="Generate meta titles, descriptions, and focus keywords for products missing SEO data."
              icon={Zap}
              running={runningTool === 'seo'}
              onClick={() => runTool('seo', () => seoApi.generateAll(token!, false))}
            />
            <ToolCard
              title="Remove Supplier Wording"
              description="Scan product names and replace supplier wording with BretuneTech branding."
              icon={Trash2}
              running={runningTool === 'cleanup'}
              onClick={() => runTool('cleanup', () => seoApi.cleanSupplierWording(token!, { onlyAffected: true, previewOnly: false }))}
            />
            <ToolCard
              title="Generate Image ALT Text"
              description="Auto-fill missing image alt text using product names and brands."
              icon={Image}
              running={runningTool === 'alt'}
              onClick={() => runTool('alt', () => googleIndexingApi.generateAltText(token!))}
            />
            <ToolCard
              title="Build Related Product Links"
              description="Create related-product links based on category, brand, and price similarity."
              icon={LinkIcon}
              running={runningTool === 'related'}
              onClick={() => runTool('related', () => googleIndexingApi.buildRelatedLinks(token!))}
            />
            <ToolCard
              title="Generate Product Schemas"
              description="Generate and store JSON-LD Product schema for all active products."
              icon={Globe}
              running={runningTool === 'schema'}
              onClick={() => runTool('schema', () => googleIndexingApi.generateSchemas(token!))}
            />
            <ToolCard
              title="Refresh Sitemap"
              description="Verify the sitemap URL and open Search Console sitemap management."
              icon={RefreshCw}
              running={runningTool === 'sitemap'}
              onClick={() => runTool('sitemap', () => googleIndexingApi.refreshSitemap(token!))}
            />
          </div>

          {toolResult && (
            <div className={`border rounded-xl p-5 ${toolResult.error ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              {toolResult.error ? (
                <p className="text-sm text-red-700 font-medium">{toolResult.error}</p>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-emerald-900">{toolResult.name} Result</h3>
                  <pre className="text-xs text-gray-700 bg-white p-3 rounded-lg border border-emerald-200 overflow-x-auto">
                    {JSON.stringify(toolResult.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
            <p className="font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Safety Reminder
            </p>
            <p className="mt-1">
              Do not manually submit all 915+ product URLs. Google discovers products through the sitemap. Only use manual URL Inspection for
              homepage, main pages, service pages, and 10–20 priority products.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolCard({
  title,
  description,
  icon: Icon,
  running,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  running: boolean;
  onClick: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-violet-50 rounded-lg">
          <Icon className="w-5 h-5 text-violet-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-xs text-gray-500 flex-1">{description}</p>
      <button
        onClick={onClick}
        disabled={running}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
        Run
      </button>
    </div>
  );
}
