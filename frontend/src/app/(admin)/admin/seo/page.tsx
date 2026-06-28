'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, RefreshCw, CheckCircle, XCircle, ChevronRight, Globe, Image as ImageIcon,
  Tag, Zap, Activity, ShieldCheck, Cpu, Trash2, BarChart3, Settings,
  FileText, AlertTriangle, X, Save, Eye, ExternalLink, LayoutGrid,
  MapPin, Target, Star, ArrowRight, Layers, Clock, FileSearch, List, Bell, CheckSquare, Square, Loader2, Link as LinkIcon,
} from 'lucide-react';
import { seoApi, googleIndexingApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

// â”€â”€â”€ Helper components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const r = 20, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="56" height="56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="text-sm font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function CharCounter({ value, max, warn }: { value: string; max: number; warn?: number }) {
  const len = value?.length || 0;
  const pct = Math.min((len / max) * 100, 100);
  const color = len > max ? 'bg-red-500' : (warn && len > warn) ? 'bg-amber-500' : len === 0 ? 'bg-gray-200' : 'bg-emerald-500';
  const textColor = len > max ? 'text-red-600' : (warn && len > warn) ? 'text-amber-600' : 'text-gray-500';
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[10px] font-mono tabular-nums ${textColor}`}>{len}/{max}</span>
    </div>
  );
}

function GooglePreview({ title, description, slug }: { title: string; description: string; slug: string }) {
  const displayTitle = title || 'SEO Title';
  const displayDesc = description || 'Meta description will appear hereâ€¦';
  const url = `bretunetech.com/products/${slug}`;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-2">Google Preview</p>
      <div className="space-y-0.5">
        <p className="text-xs text-green-700 font-mono truncate">{url}</p>
        <p className="text-base text-blue-700 hover:underline cursor-pointer leading-snug line-clamp-1">
          {displayTitle.length > 65 ? displayTitle.substring(0, 62) + 'â€¦' : displayTitle}
        </p>
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
          {displayDesc.length > 160 ? displayDesc.substring(0, 157) + 'â€¦' : displayDesc}
        </p>
      </div>
    </div>
  );
}

function SeoCheckItem({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${pass ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
      {pass ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{label}</span>
    </div>
  );
}

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'products', label: 'Products', icon: Tag },
  { key: 'categories', label: 'Categories', icon: LayoutGrid },
  { key: 'pages', label: 'Pages', icon: FileText },
  { key: 'google', label: 'Google Search Console', icon: Globe },
  { key: 'sitemap', label: 'Sitemap', icon: MapPin },
  { key: 'audit', label: 'Audit', icon: ShieldCheck },
  { key: 'bulk', label: 'Bulk Actions', icon: Zap },
  { key: 'settings', label: 'Settings', icon: Settings },
] as const;

type Tab = typeof TABS[number]['key'];

// â”€â”€â”€ KPI Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function KpiCard({ label, value, sub, color = 'gray', icon: Icon }: { label: string; value: string | number; sub?: string; color?: string; icon?: React.ComponentType<{ className?: string }> }) {
  const colors: Record<string, string> = { gray: 'text-gray-900', green: 'text-emerald-600', red: 'text-red-600', amber: 'text-amber-600', violet: 'text-violet-600', blue: 'text-blue-600' };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium leading-tight">{label}</p>
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-300" />}
      </div>
      <p className={`text-2xl font-bold ${colors[color] || colors.gray}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
    </div>
  );
}

export default function SEOCenterPage() {
  const { token } = useAuthStore();
  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('seo_center_tab') as Tab | null;
    if (saved && TABS.some(t => t.key === saved)) setTab(saved);
  }, []);

  const [dashStats, setDashStats] = useState<any>(null);
  const [dashLoading, setDashLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [prodSearch, setProdSearch] = useState('');
  const [prodFilter, setProdFilter] = useState<'all' | 'excellent' | 'good' | 'poor'>('all');
  const [selectedProd, setSelectedProd] = useState<string | null>(null);
  const [editorData, setEditorData] = useState<any>(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editSeo, setEditSeo] = useState({ metaTitle: '', metaDescription: '', focusKeyword: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [catEdits, setCatEdits] = useState<Record<string, any>>({});
  const [pages, setPages] = useState<any[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [pageEdits, setPageEdits] = useState<Record<string, any>>({});
  const [audit, setAudit] = useState<any>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [bulkRunning, setBulkRunning] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<any>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [seoSettings, setSeoSettings] = useState<Record<string, string>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'error' } | null>(null);

  // Google Search Console state
  const [googleTab, setGoogleTab] = useState<'dashboard' | 'important' | 'products' | 'followups' | 'reports'>('dashboard');
  const [gscLoading, setGscLoading] = useState<Record<string, boolean>>({});
  const [gscDashboard, setGscDashboard] = useState<any>(null);
  const [importantPages, setImportantPages] = useState<any[]>([]);
  const [priorityProducts, setPriorityProducts] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [gscReport, setGscReport] = useState<any[]>([]);
  const [gscChecklist, setGscChecklist] = useState<Record<string, boolean>>({});
  const [gscBaseUrl, setGscBaseUrl] = useState<string>('');
  const [sitemapUrl, setSitemapUrl] = useState<string>('');
  const [gscMessage, setGscMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const changeTab = (t: Tab) => { setTab(t); localStorage.setItem('seo_center_tab', t); };
  const showToast = (msg: string, type: 'ok' | 'error' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadDash = useCallback(async () => {
    if (!token) return;
    setDashLoading(true);
    try { const data = await seoApi.getDashboardStats(token); setDashStats(data); } catch {}
    setDashLoading(false);
  }, [token]);

  const loadProducts = useCallback(async () => {
    if (!token) return;
    setProdLoading(true);
    try { const d = await seoApi.getProductScores(token); setProducts(d.products || []); } catch {}
    setProdLoading(false);
  }, [token]);

  const loadEditor = async (id: string) => {
    if (!token) return;
    setEditorLoading(true);
    try {
      const data = await seoApi.getProductEditor(token, id);
      setEditorData(data);
      setEditSeo({ metaTitle: data.seo?.metaTitle || '', metaDescription: data.seo?.metaDescription || '', focusKeyword: data.seo?.focusKeyword || '' });
    } catch {}
    setEditorLoading(false);
  };

  const saveProductSeo = async () => {
    if (!editorData || !token) return;
    setSaving(true);
    try {
      await seoApi.updateProductSeo(token, editorData.id, editSeo);
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 2000);
      loadProducts();
    } catch {}
    setSaving(false);
  };

  const loadCategories = useCallback(async () => {
    if (!token) return;
    setCatLoading(true);
    try { const data = await seoApi.getCategories(token); setCategories(data || []); } catch {}
    setCatLoading(false);
  }, [token]);

  const loadPages = useCallback(async () => {
    if (!token) return;
    setPagesLoading(true);
    try { const data = await seoApi.getPages(token); setPages(data || []); } catch {}
    setPagesLoading(false);
  }, [token]);

  // Google Search Console helpers
  const showGscMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setGscMessage({ text, type });
    setTimeout(() => setGscMessage(null), 5000);
  };

  const loadGscDashboard = useCallback(async () => {
    if (!token) return;
    setGscLoading((l) => ({ ...l, dashboard: true }));
    try {
      const data = await googleIndexingApi.getDashboard(token);
      setGscDashboard(data);
    } catch (err: any) {
      showGscMessage(err?.message || 'Failed to load dashboard', 'error');
    } finally {
      setGscLoading((l) => ({ ...l, dashboard: false }));
    }
  }, [token]);

  const loadImportantPages = useCallback(async () => {
    if (!token) return;
    setGscLoading((l) => ({ ...l, important: true }));
    try {
      const data = await googleIndexingApi.getImportantPages(token);
      setImportantPages(data.pages);
      setGscBaseUrl(data.gscBaseUrl);
    } catch (err: any) {
      showGscMessage(err?.message || 'Failed to load important pages', 'error');
    } finally {
      setGscLoading((l) => ({ ...l, important: false }));
    }
  }, [token]);

  const loadPriorityProducts = useCallback(async () => {
    if (!token) return;
    setGscLoading((l) => ({ ...l, products: true }));
    try {
      const data = await googleIndexingApi.getPriorityProducts(token);
      setPriorityProducts(data.products);
      setGscBaseUrl(data.gscBaseUrl);
    } catch (err: any) {
      showGscMessage(err?.message || 'Failed to load priority products', 'error');
    } finally {
      setGscLoading((l) => ({ ...l, products: false }));
    }
  }, [token]);

  const loadFollowUps = useCallback(async () => {
    if (!token) return;
    setGscLoading((l) => ({ ...l, followups: true }));
    try {
      const data = await googleIndexingApi.getFollowUps(token);
      setFollowUps(data.followUps);
      setGscBaseUrl(data.gscBaseUrl);
    } catch (err: any) {
      showGscMessage(err?.message || 'Failed to load follow-ups', 'error');
    } finally {
      setGscLoading((l) => ({ ...l, followups: false }));
    }
  }, [token]);

  const loadGscReport = useCallback(async () => {
    if (!token) return;
    setGscLoading((l) => ({ ...l, reports: true }));
    try {
      const data = await googleIndexingApi.getHealthReport(token);
      setGscReport(data.report);
    } catch (err: any) {
      showGscMessage(err?.message || 'Failed to load health report', 'error');
    } finally {
      setGscLoading((l) => ({ ...l, reports: false }));
    }
  }, [token]);

  const loadGscChecklist = useCallback(async () => {
    if (!token) return;
    try {
      const data = await googleIndexingApi.getChecklist(token);
      setGscChecklist(data);
      setSitemapUrl(data.sitemapUrl);
    } catch (err: any) {
      showGscMessage(err?.message || 'Failed to load checklist', 'error');
    }
  }, [token]);

  const loadAllGsc = useCallback(async () => {
    await Promise.all([
      loadGscDashboard(),
      loadImportantPages(),
      loadPriorityProducts(),
      loadFollowUps(),
      loadGscReport(),
      loadGscChecklist(),
    ]);
  }, [loadGscDashboard, loadImportantPages, loadPriorityProducts, loadFollowUps, loadGscReport, loadGscChecklist]);

  const inspectUrl = async (url: string, pageType: string = 'page') => {
    if (!token) return;
    setGscLoading((l) => ({ ...l, [url]: true }));
    try {
      await googleIndexingApi.inspectUrl(token, url, pageType);
      showGscMessage(`Inspected ${url}`);
      await loadAllGsc();
    } catch (err: any) {
      showGscMessage(err?.message || `Failed to inspect ${url}`, 'error');
    } finally {
      setGscLoading((l) => ({ ...l, [url]: false }));
    }
  };

  const inspectImportantPages = async () => {
    if (!token) return;
    const urls = importantPages.map((p) => ({ url: p.url, pageType: p.pageType }));
    if (urls.length === 0) {
      showGscMessage('No important pages to inspect', 'error');
      return;
    }
    setGscLoading((l) => ({ ...l, importantBatch: true }));
    try {
      await googleIndexingApi.inspectBatch(token, urls, 'Important page batch check');
      showGscMessage('Important pages checked');
      await loadAllGsc();
    } catch (err: any) {
      showGscMessage(err?.message || 'Failed to inspect important pages', 'error');
    } finally {
      setGscLoading((l) => ({ ...l, importantBatch: false }));
    }
  };

  const inspectPriorityProducts = async () => {
    if (!token) return;
    const urls = priorityProducts.map((p) => ({ url: p.url, pageType: 'product' }));
    if (urls.length === 0) {
      showGscMessage('No priority products to inspect', 'error');
      return;
    }
    setGscLoading((l) => ({ ...l, productBatch: true }));
    try {
      await googleIndexingApi.inspectBatch(token, urls.slice(0, 20), 'Priority product batch check');
      showGscMessage('Priority products checked');
      await loadAllGsc();
    } catch (err: any) {
      showGscMessage(err?.message || 'Failed to inspect priority products', 'error');
    } finally {
      setGscLoading((l) => ({ ...l, productBatch: false }));
    }
  };

  const toggleGscChecklist = async (key: string) => {
    if (!token) return;
    const next = { ...gscChecklist, [key]: !gscChecklist[key] };
    setGscChecklist(next);
    try {
      await googleIndexingApi.updateChecklist(token, { [key]: next[key] });
    } catch (err: any) {
      showGscMessage(err?.message || 'Failed to save checklist', 'error');
    }
  };

  const openGsc = (url?: string) => {
    const target = url || gscBaseUrl;
    if (target) window.open(target, '_blank', 'noopener,noreferrer');
  };

  const getGscStatusBadge = (state?: string | null) => {
    if (!state) return 'bg-gray-100 text-gray-700';
    if (state === 'Indexed' || state === 'IndexingAllowed') return 'bg-emerald-100 text-emerald-700';
    if (state === 'CrawledNotIndexed') return 'bg-amber-100 text-amber-700';
    if (state === 'DiscoveredNotIndexed') return 'bg-blue-100 text-blue-700';
    if (state === 'Duplicate') return 'bg-violet-100 text-violet-700';
    return 'bg-red-100 text-red-700';
  };

  const CHECKLIST_ITEMS = [
    { key: 'sitemapSubmitted', label: 'Sitemap submitted to Google Search Console' },
    { key: 'sitemapStatusSuccess', label: 'Sitemap status success / no errors' },
    { key: 'robotsTxtWorking', label: 'Robots.txt working and not blocking important pages' },
    { key: 'homepageInspected', label: 'Homepage inspected' },
    { key: 'productsInspected', label: '10–20 important products inspected' },
  ] as const;

  const GOOGLE_TABS = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'important', label: 'Important Pages', icon: ShieldCheck },
    { key: 'products', label: 'Priority Products', icon: Activity },
    { key: 'followups', label: 'Follow-Ups', icon: Bell },
    { key: 'reports', label: 'Health Report', icon: FileSearch },
  ] as const;

  useEffect(() => {
    if (tab === 'google' && token) {
      loadAllGsc();
    }
  }, [tab, token, loadAllGsc]);

  const loadAudit = useCallback(async () => {
    if (!token) return;
    setAuditLoading(true);
    try { const data = await seoApi.runAudit(token); setAudit(data); } catch {}
    setAuditLoading(false);
  }, [token]);

  const loadSettings = useCallback(async () => {
    if (!token) return;
    setSettingsLoading(true);
    try { const data = await seoApi.getSettings(token); setSeoSettings(data || {}); } catch {}
    setSettingsLoading(false);
  }, [token]);

  const saveSettings = async () => {
    if (!token) return;
    setSettingsSaving(true);
    try { await seoApi.updateSettings(token, seoSettings); setSettingsMsg('Settings saved!'); setTimeout(() => setSettingsMsg(''), 2000); } catch {}
    setSettingsSaving(false);
  };

  const runBulk = async (name: string, fn: () => Promise<any>) => {
    setBulkRunning(name);
    setBulkResult(null);
    try { const r = await fn(); setBulkResult({ name, data: r }); showToast(`${name} complete`); loadDash(); }
    catch (err: any) { setBulkResult({ name, error: err?.message || 'Failed' }); showToast(err?.message || `${name} failed`, 'error'); }
    setBulkRunning(null);
  };

  useEffect(() => { loadDash(); loadProducts(); }, [loadDash, loadProducts]);
  useEffect(() => { if (tab === 'categories') loadCategories(); }, [tab, loadCategories]);
  useEffect(() => { if (tab === 'pages') loadPages(); }, [tab, loadPages]);
  useEffect(() => { if (tab === 'audit') loadAudit(); }, [tab, loadAudit]);
  useEffect(() => { if (tab === 'settings') loadSettings(); }, [tab, loadSettings]);

  const sc = (s: number) => s >= 80 ? 'text-emerald-600' : s >= 60 ? 'text-amber-600' : 'text-red-600';
  const sb = (s: number) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500';
  const filteredProds = products.filter(p => {
    if (prodSearch && !p.name.toLowerCase().includes(prodSearch.toLowerCase())) return false;
    if (prodFilter === 'excellent') return p.score >= 80;
    if (prodFilter === 'good') return p.score >= 60 && p.score < 80;
    if (prodFilter === 'poor') return p.score < 60;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-600" />
            Bretune SEO Center
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Comprehensive SEO management for BretuneTech</p>
        </div>
        <button onClick={() => { loadDash(); loadProducts(); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${dashLoading || prodLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => (
          <button key={t.key} onClick={() => changeTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ DASHBOARD ═══ */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          {dashLoading && !dashStats ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading dashboard…</div>
          ) : dashStats ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:col-span-2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Overall SEO Score</p>
                  <div className="flex items-center gap-4 mt-2">
                    <ScoreCircle score={dashStats.avgScore} />
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{dashStats.avgScore}<span className="text-base font-normal text-gray-400">/100</span></p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-emerald-600 font-medium">{dashStats.excellent} Excellent</span>
                        <span className="text-xs text-amber-600 font-medium">{dashStats.good} Good</span>
                        <span className="text-xs text-red-600 font-medium">{dashStats.poor} Poor</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden mt-3 gap-0.5">
                    <div className="bg-emerald-400 transition-all" style={{ width: `${dashStats.totalProducts > 0 ? (dashStats.excellent / dashStats.totalProducts) * 100 : 0}%` }} />
                    <div className="bg-amber-400 transition-all" style={{ width: `${dashStats.totalProducts > 0 ? (dashStats.good / dashStats.totalProducts) * 100 : 0}%` }} />
                    <div className="bg-red-400 flex-1" />
                  </div>
                </div>
                <KpiCard label="Total Products" value={dashStats.totalProducts} icon={Tag} />
                <KpiCard label="Optimized" value={dashStats.optimizedProducts} color="green" icon={CheckCircle} sub={`${dashStats.missingSeo} missing SEO`} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard label="Duplicate Titles" value={dashStats.duplicateTitles} color={dashStats.duplicateTitles > 0 ? 'red' : 'green'} icon={FileText} />
                <KpiCard label="Duplicate Descriptions" value={dashStats.duplicateDescriptions} color={dashStats.duplicateDescriptions > 0 ? 'red' : 'green'} icon={FileText} />
                <KpiCard label="Missing Images" value={dashStats.missingImages} color={dashStats.missingImages > 0 ? 'red' : 'green'} icon={ImageIcon} />
                <KpiCard label="Missing ALT Text" value={dashStats.missingAlt} color={dashStats.missingAlt > 0 ? 'amber' : 'green'} icon={ImageIcon} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard label="Missing Schema" value={dashStats.missingSchema} color={dashStats.missingSchema > 0 ? 'amber' : 'green'} icon={Layers} />
                <KpiCard label="With Meta Title" value={dashStats.withMetaTitle} color="green" icon={FileText} sub={`of ${dashStats.totalProducts}`} />
                <KpiCard label="With Meta Description" value={dashStats.withMetaDesc} color="green" icon={FileText} sub={`of ${dashStats.totalProducts}`} />
                <KpiCard label="Categories" value={dashStats.totalCategories} icon={LayoutGrid} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  { label: 'Run Full Audit', icon: ShieldCheck, tab: 'audit' as Tab, color: 'text-violet-600' },
                  { label: 'Bulk Actions', icon: Zap, tab: 'bulk' as Tab, color: 'text-amber-600' },
                  { label: 'Google Indexing', icon: Globe, tab: 'google' as Tab, color: 'text-blue-600' },
                ] as const).map(a => (
                  <button key={a.label} onClick={() => changeTab(a.tab)} className="flex items-center justify-between px-5 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <a.icon className={`w-5 h-5 ${a.color}`} />
                      <span className="text-sm font-medium text-gray-900">{a.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <button onClick={loadDash} className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700">Load Dashboard</button>
            </div>
          )}
        </div>
      )}

      {/* ═══ PRODUCTS ═══ */}
      {tab === 'products' && (
        <div className={`flex gap-4 ${editorData ? 'items-start' : ''}`} style={{ minHeight: '500px' }}>
          <div className={`flex flex-col gap-3 ${editorData ? 'w-1/2' : 'w-full'}`}>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={prodSearch} onChange={e => setProdSearch(e.target.value)} placeholder="Search products…"
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900" />
              </div>
              <div className="flex gap-1">
                {(['all', 'poor', 'good', 'excellent'] as const).map(f => (
                  <button key={f} onClick={() => setProdFilter(f)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${prodFilter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-[10px] text-gray-500 font-medium px-4 py-2.5 uppercase">Product</th>
                      <th className="text-left text-[10px] text-gray-500 font-medium px-4 py-2.5 uppercase w-20">Score</th>
                      <th className="w-8 px-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {prodLoading ? (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-xs">Loading…</td></tr>
                    ) : filteredProds.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-xs">No products found</td></tr>
                    ) : filteredProds.map(p => (
                      <tr key={p.id} className={`hover:bg-violet-50/50 cursor-pointer transition-colors ${selectedProd === p.id ? 'bg-violet-50' : ''}`}
                        onClick={() => { setSelectedProd(p.id); loadEditor(p.id); }}>
                        <td className="px-4 py-2.5">
                          <p className="text-xs font-medium text-gray-900 truncate max-w-[260px]">{p.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">/{p.slug}</p>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${sb(p.score)}`} style={{ width: `${p.score}%` }} />
                            </div>
                            <span className={`text-xs font-bold tabular-nums ${sc(p.score)}`}>{p.score}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2.5"><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {editorData && (
            <div className="w-1/2 flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '700px' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ScoreCircle score={editorData.score} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[220px]">{editorData.name}</p>
                    <p className={`text-xs font-medium ${sc(editorData.score)}`}>{editorData.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {saveMsg && <span className="text-xs text-emerald-600 font-medium">{saveMsg}</span>}
                  <button onClick={saveProductSeo} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 disabled:opacity-50">
                    {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save
                  </button>
                  <button onClick={() => { setEditorData(null); setSelectedProd(null); }} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editorLoading ? (
                <div className="text-center py-8 text-gray-400 text-xs">Loading…</div>
              ) : (
                <>
                  <GooglePreview title={editSeo.metaTitle} description={editSeo.metaDescription} slug={editorData.slug} />
                  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">SEO Fields</h3>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">SEO Title</label>
                      <input value={editSeo.metaTitle} onChange={e => setEditSeo(s => ({ ...s, metaTitle: e.target.value }))}
                        placeholder="SEO Title (max 60 chars)" maxLength={70}
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-violet-400 focus:bg-white" />
                      <CharCounter value={editSeo.metaTitle} max={60} warn={50} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Meta Description</label>
                      <textarea value={editSeo.metaDescription} onChange={e => setEditSeo(s => ({ ...s, metaDescription: e.target.value }))}
                        placeholder="Meta description (max 160 chars)" rows={3} maxLength={170}
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-violet-400 focus:bg-white resize-none" />
                      <CharCounter value={editSeo.metaDescription} max={160} warn={140} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Focus Keyword</label>
                      <input value={editSeo.focusKeyword} onChange={e => setEditSeo(s => ({ ...s, focusKeyword: e.target.value }))}
                        placeholder="e.g. Cisco router South Africa"
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-violet-400 focus:bg-white" />
                    </div>
                    <p className="text-[10px] text-gray-400 bg-gray-50 rounded px-3 py-1.5 font-mono">
                      Canonical: https://bretunetech.com/products/{editorData.slug}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Live SEO Analysis</h3>
                    <div className="grid grid-cols-1 gap-1.5">
                      {editorData.checks?.map((c: any) => <SeoCheckItem key={c.key} label={c.label} pass={c.pass} />)}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Product Info</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <span>Brand: <strong className="text-gray-900">{editorData.brand || '—'}</strong></span>
                      <span>Category: <strong className="text-gray-900">{editorData.category || '—'}</strong></span>
                      <span>Images: <strong className="text-gray-900">{editorData.images?.length || 0}</strong></span>
                      <span>Related: <strong className="text-gray-900">{editorData.relatedProductCount || 0}</strong></span>
                      <span>Price: <strong className="text-gray-900">R{editorData.sellingPrice?.toLocaleString() || '—'}</strong></span>
                      <span>Stock: <strong className="text-gray-900">{editorData.stockQuantity ?? '—'}</strong></span>
                    </div>
                    <Link href={`/admin/products/${editorData.id}`} target="_blank"
                      className="mt-3 flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium">
                      <ExternalLink className="w-3.5 h-3.5" /> Edit Full Product
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ CATEGORIES ═══ */}
      {tab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Category SEO</h2>
            <button onClick={loadCategories} disabled={catLoading} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
              <RefreshCw className={`w-3.5 h-3.5 ${catLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-[10px] font-medium text-gray-500 uppercase px-4 py-2.5">Category</th>
                  <th className="text-left text-[10px] font-medium text-gray-500 uppercase px-4 py-2.5 w-20">Products</th>
                  <th className="text-left text-[10px] font-medium text-gray-500 uppercase px-4 py-2.5">SEO Title</th>
                  <th className="w-12 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {catLoading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-xs">Loading…</td></tr>
                ) : categories.map(cat => (
                  <React.Fragment key={cat.id}>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-medium text-gray-900">{cat.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">/{cat.slug}</p>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-700">{cat.productCount}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-600 truncate max-w-[300px]">{cat.seo?.metaTitle || '—'}</td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => setEditingCat(editingCat === cat.id ? null : cat.id)}
                          className="text-xs text-violet-600 hover:text-violet-700 font-medium">
                          {editingCat === cat.id ? 'Close' : 'Edit'}
                        </button>
                      </td>
                    </tr>
                    {editingCat === cat.id && (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 bg-violet-50/40 border-t border-violet-100">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[10px] font-medium text-gray-600 uppercase">SEO Title</label>
                              <input defaultValue={cat.seo?.metaTitle || ''}
                                onChange={e => setCatEdits(p => ({ ...p, [cat.id]: { ...p[cat.id], metaTitle: e.target.value } }))}
                                className="mt-1 w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg" />
                            </div>
                            <div>
                              <label className="text-[10px] font-medium text-gray-600 uppercase">Meta Description</label>
                              <input defaultValue={cat.seo?.metaDescription || ''}
                                onChange={e => setCatEdits(p => ({ ...p, [cat.id]: { ...p[cat.id], metaDescription: e.target.value } }))}
                                className="mt-1 w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg" />
                            </div>
                            <div>
                              <label className="text-[10px] font-medium text-gray-600 uppercase">Focus Keyword</label>
                              <div className="flex gap-2 mt-1">
                                <input defaultValue={cat.seo?.focusKeyword || ''}
                                  onChange={e => setCatEdits(p => ({ ...p, [cat.id]: { ...p[cat.id], focusKeyword: e.target.value } }))}
                                  className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg" />
                                <button onClick={async () => {
                                  if (!token) return;
                                  await seoApi.updateCategory(token, cat.id, catEdits[cat.id] || {});
                                  showToast('Saved!'); setEditingCat(null); loadCategories();
                                }} className="px-3 py-1.5 bg-violet-600 text-white text-xs rounded-lg font-medium hover:bg-violet-700">Save</button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ PAGES ═══ */}
      {tab === 'pages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Static Pages SEO</h2>
            <button onClick={loadPages} disabled={pagesLoading} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
              <RefreshCw className={`w-3.5 h-3.5 ${pagesLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-[10px] font-medium text-gray-500 uppercase px-4 py-2.5">Page</th>
                  <th className="text-left text-[10px] font-medium text-gray-500 uppercase px-4 py-2.5">SEO Title</th>
                  <th className="w-12 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pagesLoading ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-xs">Loading…</td></tr>
                ) : pages.map(page => (
                  <React.Fragment key={page.slug}>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-medium text-gray-900">{page.label}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{page.path}</p>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-600 truncate max-w-[400px]">{page.seo?.metaTitle || '—'}</td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => setEditingPage(editingPage === page.slug ? null : page.slug)}
                          className="text-xs text-violet-600 hover:text-violet-700 font-medium">
                          {editingPage === page.slug ? 'Close' : 'Edit'}
                        </button>
                      </td>
                    </tr>
                    {editingPage === page.slug && (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 bg-violet-50/40 border-t border-violet-100">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[10px] font-medium text-gray-600 uppercase">SEO Title</label>
                              <input defaultValue={page.seo?.metaTitle || ''}
                                onChange={e => setPageEdits(p => ({ ...p, [page.slug]: { ...p[page.slug], metaTitle: e.target.value } }))}
                                className="mt-1 w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg" />
                            </div>
                            <div>
                              <label className="text-[10px] font-medium text-gray-600 uppercase">Meta Description</label>
                              <input defaultValue={page.seo?.metaDescription || ''}
                                onChange={e => setPageEdits(p => ({ ...p, [page.slug]: { ...p[page.slug], metaDescription: e.target.value } }))}
                                className="mt-1 w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg" />
                            </div>
                            <div>
                              <label className="text-[10px] font-medium text-gray-600 uppercase">Focus Keyword</label>
                              <div className="flex gap-2 mt-1">
                                <input defaultValue={page.seo?.focusKeyword || ''}
                                  onChange={e => setPageEdits(p => ({ ...p, [page.slug]: { ...p[page.slug], focusKeyword: e.target.value } }))}
                                  className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg" />
                                <button onClick={async () => {
                                  if (!token) return;
                                  await seoApi.updatePage(token, page.slug, pageEdits[page.slug] || {});
                                  showToast('Saved!'); setEditingPage(null); loadPages();
                                }} className="px-3 py-1.5 bg-violet-600 text-white text-xs rounded-lg font-medium hover:bg-violet-700">Save</button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ GOOGLE SEARCH CONSOLE ═══ */}
      {tab === 'google' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-violet-600" />
                Google Search Console
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Monitor indexing status, inspect priority URLs, and improve SEO without overloading Google.
              </p>
            </div>
            <button
              onClick={loadAllGsc}
              disabled={gscLoading.dashboard}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${gscLoading.dashboard ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {gscDashboard && !gscDashboard.apiEnabled && (
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

          {gscMessage && (
            <div className={`border rounded-xl p-4 text-sm ${gscMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              {gscMessage.text}
            </div>
          )}

          {/* Sub-tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            {GOOGLE_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setGoogleTab(t.key as typeof googleTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  googleTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          {/* GSC Dashboard Tab */}
          {googleTab === 'dashboard' && (
            <div className="space-y-6">
              {gscDashboard && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Indexed Pages</p>
                    <p className="text-2xl font-bold mt-1 text-emerald-600">{gscDashboard.indexedPages}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Not Indexed</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">{gscDashboard.notIndexedPages}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Crawled / Not Indexed</p>
                    <p className="text-2xl font-bold mt-1 text-amber-600">{gscDashboard.crawledButNotIndexed}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Discovered / Not Indexed</p>
                    <p className="text-2xl font-bold mt-1 text-blue-600">{gscDashboard.discoveredButNotIndexed}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Duplicate Pages</p>
                    <p className="text-2xl font-bold mt-1 text-violet-600">{gscDashboard.duplicatePages}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Pages With Errors</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">{gscDashboard.pagesWithErrors}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Total Inspected</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{gscDashboard.totalInspected}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Last Checked</p>
                    <p className="text-sm font-semibold mt-2 text-gray-700">
                      {gscDashboard.lastChecked ? new Date(gscDashboard.lastChecked).toLocaleString() : 'Never'}
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
                      {gscChecklist[item.key] ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={!!gscChecklist[item.key]}
                        onChange={() => toggleGscChecklist(item.key)}
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
                    onClick={() => openGsc(`https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(gscBaseUrl || 'https://bretunetech.com')}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <List className="w-4 h-4" /> Manage Sitemaps
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Important Pages Tab */}
          {googleTab === 'important' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Important Pages</h2>
                <button
                  onClick={inspectImportantPages}
                  disabled={gscLoading.importantBatch}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
                >
                  {gscLoading.importantBatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Inspect All Important Pages
                </button>
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
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getGscStatusBadge(p.coverageState)}`}>
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
                                disabled={gscLoading[p.url]}
                                className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Inspect URL via API"
                              >
                                {gscLoading[p.url] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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

          {/* Priority Products Tab */}
          {googleTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Priority Products To Check</h2>
                <button
                  onClick={inspectPriorityProducts}
                  disabled={gscLoading.productBatch}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
                >
                  {gscLoading.productBatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getGscStatusBadge(p.coverageState)}`}>
                              {p.coverageState || 'Not checked'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => inspectUrl(p.url, 'product')}
                                disabled={gscLoading[p.url]}
                                className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Inspect product URL"
                              >
                                {gscLoading[p.url] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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

          {/* Follow-Ups Tab */}
          {googleTab === 'followups' && (
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
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getGscStatusBadge(r.coverageState)}`}>
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
                                  disabled={gscLoading[r.url]}
                                  className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Recheck status"
                                >
                                  {gscLoading[r.url] ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
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
                                        .catch((err: any) => showGscMessage(err?.message || 'Failed', 'error'));
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

          {/* Health Report Tab */}
          {googleTab === 'reports' && (
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
                      {gscReport.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-xs">
                            No inspection records yet. Inspect important pages or products to build the report.
                          </td>
                        </tr>
                      ) : (
                        gscReport.map((r) => (
                          <tr key={r.url} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">{r.url}</p>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 capitalize">{r.pageType}</td>
                            <td className="px-4 py-3 text-xs font-semibold">{r.seoScore ?? '-'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getGscStatusBadge(r.indexedStatus)}`}>
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

        </div>
      )}

      {/* ═══ SITEMAP ═══ */}
      {tab === 'sitemap' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-violet-600" /> Sitemap Manager
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Sitemap XML', href: 'https://bretunetech.com/sitemap.xml', desc: 'Main sitemap with all pages, products, categories, and brands' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.desc}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-semibold mb-1">Sitemap auto-generated by Next.js</p>
              <p className="text-xs text-blue-600">The sitemap at <code className="bg-blue-100 px-1 rounded">/sitemap.xml</code> is dynamically generated. After adding products or categories, Google discovers them automatically through regular crawling. No manual ping is required.</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ AUDIT ═══ */}
      {tab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Full SEO Audit</h2>
            <button onClick={loadAudit} disabled={auditLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 disabled:opacity-50">
              {auditLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              {auditLoading ? 'Scanning…' : 'Run Audit'}
            </button>
          </div>
          {audit ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard label="Scanned Products" value={audit.totalProducts} icon={Tag} />
                <KpiCard label="Total Issues" value={audit.totalIssues} color={audit.totalIssues > 0 ? 'red' : 'green'} icon={AlertTriangle} />
                <KpiCard label="Scanned At" value={new Date(audit.scannedAt).toLocaleTimeString()} icon={Activity} />
                <KpiCard label="Health Score" value={`${Math.max(0, 100 - Math.round((audit.totalIssues / Math.max(audit.totalProducts, 1)) * 10))}%`} color={audit.totalIssues < 20 ? 'green' : 'amber'} />
              </div>
              <div className="space-y-2">
                {([
                  { key: 'missingMetaTitles', label: 'Missing Meta Titles', color: 'red' },
                  { key: 'missingMetaDescriptions', label: 'Missing Meta Descriptions', color: 'red' },
                  { key: 'missingFocusKeywords', label: 'Missing Focus Keywords', color: 'amber' },
                  { key: 'duplicateTitles', label: 'Duplicate Titles', color: 'red' },
                  { key: 'duplicateDescriptions', label: 'Duplicate Descriptions', color: 'amber' },
                  { key: 'missingImages', label: 'Missing Images', color: 'red' },
                  { key: 'missingAlt', label: 'Missing ALT Text', color: 'amber' },
                  { key: 'missingBrand', label: 'Missing Brand', color: 'amber' },
                  { key: 'missingCategory', label: 'Missing Category', color: 'amber' },
                  { key: 'missingSchema', label: 'Missing Schema / JSON-LD', color: 'amber' },
                  { key: 'thinContent', label: 'Thin Content (<50 chars)', color: 'red' },
                  { key: 'longTitles', label: 'Titles Too Long (>65 chars)', color: 'amber' },
                  { key: 'shortTitles', label: 'Titles Too Short (<20 chars)', color: 'amber' },
                  { key: 'missingPrice', label: 'Missing Price', color: 'red' },
                  { key: 'missingStock', label: 'Out of Stock / Missing Stock', color: 'gray' },
                ] as const).map(item => {
                  const list = audit.issues?.[item.key] || [];
                  if (list.length === 0) return null;
                  const isOpen = expandedIssue === item.key;
                  const colorMap = { red: 'bg-red-100 text-red-700', amber: 'bg-amber-100 text-amber-700', gray: 'bg-gray-100 text-gray-700' };
                  return (
                    <div key={item.key} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => setExpandedIssue(isOpen ? null : item.key)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorMap[item.color]}`}>{list.length}</span>
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                        </div>
                      </button>
                      {isOpen && (
                        <div className="border-t border-gray-100 px-4 py-3 max-h-48 overflow-y-auto space-y-1">
                          {list.slice(0, 30).map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between py-1">
                              <span className="text-xs text-gray-700 truncate max-w-[300px]">{p.name}</span>
                              <Link href={`/admin/products/${p.id}`} className="text-xs text-violet-600 hover:text-violet-700 font-medium ml-2 shrink-0">Edit</Link>
                            </div>
                          ))}
                          {list.length > 30 && <p className="text-xs text-gray-400">+{list.length - 30} more</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {audit.totalIssues === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-emerald-700">All Clear!</p>
                    <p className="text-sm text-gray-400">No SEO issues found.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">Click &ldquo;Run Audit&rdquo; to scan all products for SEO issues.</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ BULK ACTIONS ═══ */}
      {tab === 'bulk' && (
        <div className="space-y-5">
          {bulkResult && (
            <div className={`border rounded-xl p-5 ${bulkResult.error ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <p className="text-sm font-semibold mb-2">{bulkResult.name}</p>
              {bulkResult.error ? (
                <p className="text-xs text-red-700">{bulkResult.error}</p>
              ) : (
                <div className="flex gap-6 flex-wrap">
                  {Object.entries(bulkResult.data || {}).filter(([k]) => ['processed', 'success', 'errors', 'assigned', 'affected', 'updated', 'scanned'].includes(k)).map(([k, v]) => (
                    <div key={k} className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{String(v)}</p>
                      <p className="text-xs text-gray-500 capitalize">{k}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'Generate SEO', desc: 'Generate meta titles, descriptions & focus keywords for products missing SEO', icon: Zap, color: 'violet', action: () => seoApi.generateAll(token!, overwrite) },
              { name: 'Assign Brands', desc: 'Auto-match brand names from product names and link them', icon: Tag, color: 'amber', action: () => seoApi.assignBrands(token!) },
              { name: 'Generate Schemas', desc: 'Generate Product JSON-LD structured data for all products', icon: Layers, color: 'blue', action: () => seoApi.generateSchemas(token!, overwrite) },
              { name: 'Clean Supplier Wording', desc: 'Remove supplier brand names and marketing wording from descriptions', icon: Trash2, color: 'red', action: () => seoApi.cleanSupplierWording(token!, { onlyAffected: true, previewOnly: false }) },
              { name: 'Extract Specs', desc: 'Parse specifications from Additional Info fields into structured data', icon: Cpu, color: 'teal', action: () => seoApi.extractSpecs(token!, { onlyWithoutSpecs: true, replace: false, removeFromAdditionalInfo: false }) },
              { name: 'Preview Slug Optimisation', desc: 'Preview which product slugs can be improved (read-only, no changes)', icon: Target, color: 'gray', action: () => seoApi.optimizeSlugs(token!, true) },
              { name: 'Generate Image ALT Text', desc: 'Auto-fill missing image alt text using product names and brands', icon: ImageIcon, color: 'indigo', action: () => googleIndexingApi.generateAltText(token!) },
              { name: 'Build Related Product Links', desc: 'Create related-product links based on category, brand, and price similarity', icon: LinkIcon, color: 'purple', action: () => googleIndexingApi.buildRelatedLinks(token!) },
            ].map(tool => (
              <div key={tool.name} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <tool.icon className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{tool.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{tool.desc}</p>
                  </div>
                </div>
                {['Generate SEO', 'Generate Schemas'].includes(tool.name) && (
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={overwrite} onChange={e => setOverwrite(e.target.checked)} className="w-3.5 h-3.5 rounded accent-violet-600" />
                    Overwrite existing data
                  </label>
                )}
                <button onClick={() => runBulk(tool.name, tool.action)} disabled={bulkRunning === tool.name}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 disabled:opacity-50 w-full justify-center">
                  {bulkRunning === tool.name ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running…</> : <><Zap className="w-3.5 h-3.5" /> Run</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ SETTINGS ═══ */}
      {tab === 'settings' && (
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-sm font-semibold text-gray-900">SEO Settings</h2>
          {settingsLoading ? (
            <div className="text-center py-8 text-gray-400 text-xs">Loading…</div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              {[
                { key: 'defaultTitleTemplate', label: 'Title Template', placeholder: '%s | BretuneTech South Africa', help: 'Use %s for the page/product name' },
                { key: 'defaultMetaTemplate', label: 'Description Template', placeholder: 'Shop %s from BretuneTech.', help: 'Use %s for the product/page name' },
                { key: 'organizationName', label: 'Organization Name', placeholder: 'BretuneTech', help: 'Used in Schema.org Organization markup' },
                { key: 'organizationLogo', label: 'Organization Logo URL', placeholder: 'https://bretunetech.com/logo.png', help: 'Used in Schema.org markup' },
                { key: 'googleAnalytics', label: 'Google Analytics ID', placeholder: 'G-XXXXXXXXXX', help: 'GA4 Measurement ID' },
                { key: 'googleSearchConsole', label: 'GSC Verification Code', placeholder: 'googleXXXXXXXXXXXXXX.html', help: 'Google Search Console verification meta value' },
                { key: 'facebookPixel', label: 'Facebook Pixel ID', placeholder: '123456789', help: 'Facebook Pixel tracking ID' },
                { key: 'ogImage', label: 'Default OG Image URL', placeholder: 'https://bretunetech.com/og-image.jpg', help: 'Default Open Graph image for social sharing' },
                { key: 'twitterHandle', label: 'Twitter Handle', placeholder: '@bretunetech', help: 'Twitter/X handle for cards' },
                { key: 'robots', label: 'Default Robots', placeholder: 'index, follow', help: 'Default robots meta directive' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-gray-700">{field.label}</label>
                  <input
                    value={seoSettings[field.key] || ''}
                    onChange={e => setSeoSettings(s => ({ ...s, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-violet-400 focus:bg-white" />
                  <p className="text-[10px] text-gray-400 mt-0.5">{field.help}</p>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={saveSettings} disabled={settingsSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50">
                  {settingsSaving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Save className="w-3.5 h-3.5" /> Save Settings</>}
                </button>
                {settingsMsg && <span className="text-sm text-emerald-600 font-medium">{settingsMsg}</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
