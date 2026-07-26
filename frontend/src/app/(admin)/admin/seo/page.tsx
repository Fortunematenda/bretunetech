'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import {
  Search, RefreshCw, CheckCircle, XCircle, ChevronRight, Globe, Image as ImageIcon,
  Tag, Zap, Activity, ShieldCheck, Cpu, Trash2, BarChart3, Settings,
  FileText, AlertTriangle, X, Save, Eye, ExternalLink, LayoutGrid,
  MapPin, Target, Star, ArrowRight, Layers, Clock, FileSearch, List, Bell, CheckSquare, Square, Loader2, Link as LinkIcon,
} from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminKpiCard, { type AdminKpiTone } from '@/components/admin/AdminKpiCard';
import { Button } from '@/components/ui/button';
import { appToast } from '@/lib/toast';
import { seoApi, googleIndexingApi } from '@/lib/api';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
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
  { key: 'ops', label: 'Ops Cadence', icon: CheckSquare },
  { key: 'settings', label: 'Settings', icon: Settings },
] as const;

const SEO_OPS_CADENCE = [
  { cadence: 'Weekly', task: 'Review GSC coverage + query reports', detail: 'Fix soft 404s; enhance pages winning impressions.' },
  { cadence: 'Weekly', task: 'Check slow URLs / CWV (CrUX or Lighthouse)', detail: 'Prioritise home + PDP on mobile.' },
  { cadence: 'Bi-weekly', task: 'Publish 1 useful article or case study', detail: 'Real installs only — no AI spam. Case studies need photos + permission.' },
  { cadence: 'Monthly', task: 'Product SEO audit', detail: 'Use Audit tab here, or run `npm run seo:audit-products` in backend.' },
  { cadence: 'Monthly', task: 'Refresh service-area proof', detail: 'Photos, reviews, NAP accuracy (Cape Town / Western Cape).' },
  { cadence: 'Quarterly', task: 'Reassess website-development pages', detail: 'Only with real portfolio + pricing — do not invent services.' },
  { cadence: 'Ongoing', task: 'Brand SERP spelling', detail: 'Public brand is BretuneTech; domain stays bretunetech.com.' },
  { cadence: 'Ongoing', task: 'Keep private funnels noindexed', detail: 'Cart, checkout, account, shop, wishlist stay out of the index.' },
] as const;

const SEO_REGRESSION_CHECKS = [
  'Homepage, /products, one PDP, /services, /quote, /contact return 200',
  '/robots.txt allows / and lists production sitemap',
  '/sitemap.xml uses https://bretunetech.com only (no localhost)',
  'Cart / checkout / account remain noindex',
  'Add to cart → checkout smoke test still works',
  'Quote / contact / book forms still submit',
  'WhatsApp deep links still open with prefilled text',
  'www and http redirects still canonicalize to apex HTTPS',
] as const;

type Tab = typeof TABS[number]['key'];

type ProdFilter =
  | 'all'
  | 'excellent'
  | 'good'
  | 'poor'
  | 'duplicate-titles'
  | 'duplicate-descriptions'
  | 'missing-images'
  | 'missing-alt'
  | 'missing-schema'
  | 'missing-seo'
  | 'missing-meta-title'
  | 'missing-meta-desc';

const PROD_FILTER_LABELS: Record<ProdFilter, string> = {
  all: 'All products',
  excellent: 'Excellent score (80+)',
  good: 'Good score (60–79)',
  poor: 'Poor score (<60)',
  'duplicate-titles': 'Duplicate meta titles',
  'duplicate-descriptions': 'Duplicate meta descriptions',
  'missing-images': 'Missing images',
  'missing-alt': 'Missing ALT text',
  'missing-schema': 'Missing schema / JSON-LD',
  'missing-seo': 'Missing SEO fields',
  'missing-meta-title': 'Missing meta title',
  'missing-meta-desc': 'Missing meta description',
};

function normSeoText(value: unknown): string {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Build duplicate title/description ID sets from the products already in memory. */
function computeDuplicateSets(list: any[]): { titles: Set<string>; descriptions: Set<string> } {
  const titleCounts = new Map<string, number>();
  const descCounts = new Map<string, number>();
  for (const p of list) {
    // Match backend: seoTitle takes precedence over metaTitle
    const t = normSeoText(p.seoTitle || p.metaTitle);
    const d = normSeoText(p.metaDescription);
    if (t) titleCounts.set(t, (titleCounts.get(t) || 0) + 1);
    if (d) descCounts.set(d, (descCounts.get(d) || 0) + 1);
  }
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const p of list) {
    const id = String(p.id);
    const t = normSeoText(p.seoTitle || p.metaTitle);
    const d = normSeoText(p.metaDescription);
    if (t && (titleCounts.get(t) || 0) > 1) titles.add(id);
    if (d && (descCounts.get(d) || 0) > 1) descriptions.add(id);
  }
  return { titles, descriptions };
}

function annotateProductFlags(list: any[]): any[] {
  const { titles, descriptions } = computeDuplicateSets(list);
  return list.map((p) => ({
    ...p,
    isDuplicateTitle: titles.has(String(p.id)) || Boolean(p.isDuplicateTitle),
    isDuplicateDescription: descriptions.has(String(p.id)) || Boolean(p.isDuplicateDescription),
  }));
}

const KPI_COLOR_TO_TONE: Record<string, AdminKpiTone> = {
  gray: 'slate',
  green: 'emerald',
  red: 'red',
  amber: 'amber',
  violet: 'primary',
  purple: 'primary',
  blue: 'sky',
};

function KpiCard({
  label,
  value,
  sub,
  color = 'gray',
  icon,
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: LucideIcon;
  onClick?: () => void;
}) {
  return (
    <AdminKpiCard
      label={label}
      value={value}
      sub={sub}
      icon={icon}
      tone={KPI_COLOR_TO_TONE[color] ?? 'slate'}
      onClick={onClick}
      showArrow={Boolean(onClick)}
    />
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
  const [prodFilter, setProdFilter] = useState<ProdFilter>('all');
  /** IDs pinned when opening a KPI/audit filter — survives product-list reload races. */
  const [pinnedFilter, setPinnedFilter] = useState<{ filter: ProdFilter; ids: Set<string> } | null>(null);
  const [prodLoadError, setProdLoadError] = useState('');
  const [issueIds, setIssueIds] = useState<Record<string, Set<string>>>({
    duplicateTitles: new Set(),
    duplicateDescriptions: new Set(),
    missingImages: new Set(),
    missingAlt: new Set(),
    missingSchema: new Set(),
    missingSeo: new Set(),
    missingMetaTitle: new Set(),
    missingMetaDesc: new Set(),
    excellent: new Set(),
    good: new Set(),
    poor: new Set(),
  });
  const [selectedProd, setSelectedProd] = useState<string | null>(null);
  const [editorData, setEditorData] = useState<any>(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editSeo, setEditSeo] = useState({ displayName: '', shortDescription: '', fullDescription: '', seoTitle: '', metaTitle: '', metaDescription: '', focusKeyword: '', secondaryKeywords: '', imageAltText: '', canonicalUrl: '', seoLocked: false, noIndex: false });
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
    if (type === 'error') appToast.error(msg);
    else appToast.success(msg);
  };

  const mergeIssueIds = useCallback((patch: Record<string, string[] | undefined | null>) => {
    setIssueIds((prev) => {
      const next = { ...prev };
      for (const [key, ids] of Object.entries(patch)) {
        if (!Array.isArray(ids)) continue;
        next[key] = new Set(ids);
      }
      return next;
    });
  }, []);

  const seedIssueIdsFromDash = useCallback((data: any) => {
    if (!data) return;
    mergeIssueIds({
      duplicateTitles: data.duplicateTitleIds,
      duplicateDescriptions: data.duplicateDescriptionIds,
      missingImages: data.missingImageIds,
      missingAlt: data.missingAltIds,
      missingSchema: data.missingSchemaIds,
      missingSeo: data.missingSeoIds,
      excellent: data.excellentIds,
      good: data.goodIds,
      poor: data.poorIds,
    });
  }, [mergeIssueIds]);

  const loadDash = useCallback(async () => {
    if (!token) return;
    setDashLoading(true);
    try {
      const data = await seoApi.getDashboardStats(token);
      setDashStats(data);
      seedIssueIdsFromDash(data);
    } catch {}
    setDashLoading(false);
  }, [token, seedIssueIdsFromDash]);

  const loadProducts = useCallback(async () => {
    if (!token) return;
    setProdLoading(true);
    setProdLoadError('');
    try {
      const d = await seoApi.getProductScores(token);
      const list = annotateProductFlags(d.products || []);
      setProducts(list);

      const liveDups = computeDuplicateSets(list);
      // Union API summary + live recompute so neither source alone can wipe the filter
      const dupTitles = Array.from(new Set([
        ...(Array.isArray(d.summary?.duplicateTitleIds) ? d.summary.duplicateTitleIds.map(String) : []),
        ...Array.from(liveDups.titles),
        ...list.filter((p: any) => p.isDuplicateTitle).map((p: any) => String(p.id)),
      ]));
      const dupDescs = Array.from(new Set([
        ...(Array.isArray(d.summary?.duplicateDescriptionIds) ? d.summary.duplicateDescriptionIds.map(String) : []),
        ...Array.from(liveDups.descriptions),
        ...list.filter((p: any) => p.isDuplicateDescription).map((p: any) => String(p.id)),
      ]));

      mergeIssueIds({
        duplicateTitles: dupTitles,
        duplicateDescriptions: dupDescs,
        missingImages: list.filter((p: any) => (p.imageCount ?? 0) === 0 || (p.issues || []).includes('No product images')).map((p: any) => p.id),
        missingAlt: list.filter((p: any) => p.hasMissingAlt || (p.issues || []).some((i: string) => /alt text/i.test(i))).map((p: any) => p.id),
        missingSchema: list.filter((p: any) => p.hasSchema === false || (p.issues || []).includes('Missing schema / JSON-LD')).map((p: any) => p.id),
        missingSeo: list.filter((p: any) => p.missingSeo || !p.metaTitle || !p.metaDescription || !p.focusKeyword).map((p: any) => p.id),
        missingMetaTitle: list.filter((p: any) => !p.metaTitle).map((p: any) => p.id),
        missingMetaDesc: list.filter((p: any) => !p.metaDescription).map((p: any) => p.id),
        excellent: list.filter((p: any) => p.score >= 80).map((p: any) => p.id),
        good: list.filter((p: any) => p.score >= 60 && p.score < 80).map((p: any) => p.id),
        poor: list.filter((p: any) => p.score < 60).map((p: any) => p.id),
      });

      if (list.length === 0) {
        setProdLoadError('Product SEO list came back empty. Check the API and try Refresh.');
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to load product SEO scores';
      setProdLoadError(msg);
      appToast.error(msg);
    }
    setProdLoading(false);
  }, [token, mergeIssueIds]);

  const loadEditor = async (id: string) => {
    if (!token) return;
    setEditorLoading(true);
    try {
      const data = await seoApi.getProductEditor(token, id);
      setEditorData(data);
      setEditSeo({
        displayName: data.seo?.displayName || '', shortDescription: data.seo?.shortDescription || '', fullDescription: data.seo?.fullDescription || '',
        seoTitle: data.seo?.seoTitle || '', metaTitle: data.seo?.metaTitle || '', metaDescription: data.seo?.metaDescription || '',
        focusKeyword: data.seo?.focusKeyword || '', secondaryKeywords: data.seo?.secondaryKeywords || '', imageAltText: data.seo?.imageAltText || '',
        canonicalUrl: data.seo?.canonicalUrl || '', seoLocked: Boolean(data.seo?.seoLocked), noIndex: Boolean(data.seo?.noIndex),
      });
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
    if (state === 'DiscoveredNotIndexed' || state.includes('Discovered')) return 'bg-amber-100 text-amber-700';
    if (state === 'Duplicate') return 'bg-primary/10 text-primary';
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

  const liveDuplicateSets = useMemo(() => computeDuplicateSets(products), [products]);

  const resolvedDupTitleIds = useMemo(() => {
    const ids = new Set<string>();
    liveDuplicateSets.titles.forEach((id) => ids.add(id));
    issueIds.duplicateTitles.forEach((id) => ids.add(String(id)));
    (dashStats?.duplicateTitleIds || []).forEach((id: string) => ids.add(String(id)));
    products.forEach((p) => { if (p.isDuplicateTitle) ids.add(String(p.id)); });
    return ids;
  }, [liveDuplicateSets.titles, issueIds.duplicateTitles, dashStats?.duplicateTitleIds, products]);

  const resolvedDupDescIds = useMemo(() => {
    const ids = new Set<string>();
    liveDuplicateSets.descriptions.forEach((id) => ids.add(id));
    issueIds.duplicateDescriptions.forEach((id) => ids.add(String(id)));
    (dashStats?.duplicateDescriptionIds || []).forEach((id: string) => ids.add(String(id)));
    products.forEach((p) => { if (p.isDuplicateDescription) ids.add(String(p.id)); });
    return ids;
  }, [liveDuplicateSets.descriptions, issueIds.duplicateDescriptions, dashStats?.duplicateDescriptionIds, products]);

  const idsForFilter = (filter: ProdFilter, explicitIds?: string[]): string[] => {
    if (explicitIds?.length) return explicitIds.map(String);
    if (!dashStats) return [];
    switch (filter) {
      case 'duplicate-titles':
        return (dashStats.duplicateTitleIds || []).map(String);
      case 'duplicate-descriptions':
        return (dashStats.duplicateDescriptionIds || []).map(String);
      case 'missing-images':
        return (dashStats.missingImageIds || []).map(String);
      case 'missing-alt':
        return (dashStats.missingAltIds || []).map(String);
      case 'missing-schema':
        return (dashStats.missingSchemaIds || []).map(String);
      case 'missing-seo':
        return (dashStats.missingSeoIds || []).map(String);
      case 'excellent':
        return (dashStats.excellentIds || []).map(String);
      case 'good':
        return (dashStats.goodIds || []).map(String);
      case 'poor':
        return (dashStats.poorIds || []).map(String);
      default:
        return [];
    }
  };

  const openProductsFilter = (filter: ProdFilter, explicitIds?: string[]) => {
    if (dashStats) seedIssueIdsFromDash(dashStats);
    const pinnedIds = idsForFilter(filter, explicitIds);
    setPinnedFilter(
      filter !== 'all' && pinnedIds.length > 0
        ? { filter, ids: new Set(pinnedIds) }
        : null
    );
    if (pinnedIds.length) {
      mergeIssueIds({
        duplicateTitles: filter === 'duplicate-titles' ? pinnedIds : undefined,
        duplicateDescriptions: filter === 'duplicate-descriptions' ? pinnedIds : undefined,
        missingImages: filter === 'missing-images' ? pinnedIds : undefined,
        missingAlt: filter === 'missing-alt' ? pinnedIds : undefined,
        missingSchema: filter === 'missing-schema' ? pinnedIds : undefined,
        missingSeo: filter === 'missing-seo' ? pinnedIds : undefined,
        missingMetaTitle: filter === 'missing-meta-title' ? pinnedIds : undefined,
        missingMetaDesc: filter === 'missing-meta-desc' ? pinnedIds : undefined,
        excellent: filter === 'excellent' ? pinnedIds : undefined,
        good: filter === 'good' ? pinnedIds : undefined,
        poor: filter === 'poor' ? pinnedIds : undefined,
      });
    }
    setSelectedProd(null);
    setEditorData(null);
    setProdSearch('');
    setProdFilter(filter);
    changeTab('products');
    void loadProducts();
  };

  const productMatchesFilter = (p: any, filter: ProdFilter): boolean => {
    const id = String(p.id);
    if (pinnedFilter && pinnedFilter.filter === filter && pinnedFilter.ids.size > 0) {
      return pinnedFilter.ids.has(id);
    }
    switch (filter) {
      case 'excellent':
        return issueIds.excellent.has(p.id) || issueIds.excellent.has(id) || p.score >= 80;
      case 'good':
        return issueIds.good.has(p.id) || issueIds.good.has(id) || (p.score >= 60 && p.score < 80);
      case 'poor':
        return issueIds.poor.has(p.id) || issueIds.poor.has(id) || p.score < 60;
      case 'duplicate-titles':
        return resolvedDupTitleIds.has(id) || Boolean(p.isDuplicateTitle);
      case 'duplicate-descriptions':
        return resolvedDupDescIds.has(id) || Boolean(p.isDuplicateDescription);
      case 'missing-images':
        return issueIds.missingImages.has(p.id) || issueIds.missingImages.has(id) || (p.imageCount ?? 0) === 0 || (p.issues || []).includes('No product images');
      case 'missing-alt':
        return issueIds.missingAlt.has(p.id) || issueIds.missingAlt.has(id) || Boolean(p.hasMissingAlt) || (p.issues || []).some((i: string) => /alt text/i.test(i));
      case 'missing-schema':
        return issueIds.missingSchema.has(p.id) || issueIds.missingSchema.has(id) || p.hasSchema === false || (p.issues || []).includes('Missing schema / JSON-LD');
      case 'missing-seo':
        return issueIds.missingSeo.has(p.id) || issueIds.missingSeo.has(id) || Boolean(p.missingSeo) || !p.metaTitle || !p.metaDescription || !p.focusKeyword;
      case 'missing-meta-title':
        return issueIds.missingMetaTitle.has(p.id) || issueIds.missingMetaTitle.has(id) || !p.metaTitle;
      case 'missing-meta-desc':
        return issueIds.missingMetaDesc.has(p.id) || issueIds.missingMetaDesc.has(id) || !p.metaDescription;
      default:
        return true;
    }
  };

  const filteredProds = products.filter((p) => {
    if (prodSearch && !p.name.toLowerCase().includes(prodSearch.toLowerCase())) return false;
    return productMatchesFilter(p, prodFilter);
  });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Bretune SEO Center"
        description="Comprehensive SEO management for BretuneTech"
        actions={
          <Button type="button" variant="secondary" onClick={() => { loadDash(); loadProducts(); }}>
            <RefreshCw className={`w-4 h-4 ${dashLoading || prodLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

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
                      <div className="flex flex-wrap gap-2 mt-1">
                        <button type="button" onClick={() => openProductsFilter('excellent')} className="text-xs text-emerald-600 font-medium hover:underline">
                          {dashStats.excellent} Excellent
                        </button>
                        <button type="button" onClick={() => openProductsFilter('good')} className="text-xs text-amber-600 font-medium hover:underline">
                          {dashStats.good} Good
                        </button>
                        <button type="button" onClick={() => openProductsFilter('poor')} className="text-xs text-red-600 font-medium hover:underline">
                          {dashStats.poor} Poor
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden mt-3 gap-0.5">
                    <div className="bg-emerald-400 transition-all" style={{ width: `${dashStats.totalProducts > 0 ? (dashStats.excellent / dashStats.totalProducts) * 100 : 0}%` }} />
                    <div className="bg-amber-400 transition-all" style={{ width: `${dashStats.totalProducts > 0 ? (dashStats.good / dashStats.totalProducts) * 100 : 0}%` }} />
                    <div className="bg-red-400 flex-1" />
                  </div>
                </div>
                <KpiCard
                  label="Total Products"
                  value={dashStats.totalProducts}
                  icon={Tag}
                  onClick={() => openProductsFilter('all')}
                />
                <KpiCard
                  label="Optimized"
                  value={dashStats.optimizedProducts}
                  color="green"
                  icon={CheckCircle}
                  sub={`${dashStats.missingSeo} missing SEO`}
                  onClick={() => openProductsFilter(dashStats.missingSeo > 0 ? 'missing-seo' : 'all')}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard
                  label="Duplicate Titles"
                  value={dashStats.duplicateTitles}
                  color={dashStats.duplicateTitles > 0 ? 'red' : 'green'}
                  icon={FileText}
                  onClick={() => openProductsFilter('duplicate-titles')}
                />
                <KpiCard
                  label="Duplicate Descriptions"
                  value={dashStats.duplicateDescriptions}
                  color={dashStats.duplicateDescriptions > 0 ? 'red' : 'green'}
                  icon={FileText}
                  onClick={() => openProductsFilter('duplicate-descriptions')}
                />
                <KpiCard
                  label="Missing Images"
                  value={dashStats.missingImages}
                  color={dashStats.missingImages > 0 ? 'red' : 'green'}
                  icon={ImageIcon}
                  onClick={() => openProductsFilter('missing-images')}
                />
                <KpiCard
                  label="Missing ALT Text"
                  value={dashStats.missingAlt}
                  color={dashStats.missingAlt > 0 ? 'amber' : 'green'}
                  icon={ImageIcon}
                  onClick={() => openProductsFilter('missing-alt')}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard
                  label="Missing Schema"
                  value={dashStats.missingSchema}
                  color={dashStats.missingSchema > 0 ? 'amber' : 'green'}
                  icon={Layers}
                  onClick={() => openProductsFilter('missing-schema')}
                />
                <KpiCard
                  label="With Meta Title"
                  value={dashStats.withMetaTitle}
                  color={dashStats.withMetaTitle < dashStats.totalProducts ? 'amber' : 'green'}
                  icon={FileText}
                  sub={`of ${dashStats.totalProducts}`}
                  onClick={() =>
                    openProductsFilter(
                      dashStats.withMetaTitle < dashStats.totalProducts ? 'missing-meta-title' : 'all'
                    )
                  }
                />
                <KpiCard
                  label="With Meta Description"
                  value={dashStats.withMetaDesc}
                  color={dashStats.withMetaDesc < dashStats.totalProducts ? 'amber' : 'green'}
                  icon={FileText}
                  sub={`of ${dashStats.totalProducts}`}
                  onClick={() =>
                    openProductsFilter(
                      dashStats.withMetaDesc < dashStats.totalProducts ? 'missing-meta-desc' : 'all'
                    )
                  }
                />
                <KpiCard
                  label="Categories"
                  value={dashStats.totalCategories}
                  icon={LayoutGrid}
                  onClick={() => changeTab('categories')}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  { label: 'Run Full Audit', icon: ShieldCheck, tab: 'audit' as Tab, color: 'text-primary' },
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
              <Button type="button" onClick={loadDash}>Load Dashboard</Button>
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
              <div className="flex flex-wrap gap-1">
                {([
                  { key: 'all' as const, label: 'All' },
                  { key: 'poor' as const, label: 'Poor' },
                  { key: 'good' as const, label: 'Good' },
                  { key: 'excellent' as const, label: 'Excellent' },
                  { key: 'duplicate-titles' as const, label: `Dup Titles${resolvedDupTitleIds.size ? ` (${resolvedDupTitleIds.size})` : ''}` },
                  { key: 'duplicate-descriptions' as const, label: `Dup Descs${resolvedDupDescIds.size ? ` (${resolvedDupDescIds.size})` : ''}` },
                  { key: 'missing-images' as const, label: `No Images${issueIds.missingImages.size ? ` (${issueIds.missingImages.size})` : ''}` },
                  { key: 'missing-alt' as const, label: `No ALT${issueIds.missingAlt.size ? ` (${issueIds.missingAlt.size})` : ''}` },
                  { key: 'missing-schema' as const, label: `No Schema${issueIds.missingSchema.size ? ` (${issueIds.missingSchema.size})` : ''}` },
                  { key: 'missing-seo' as const, label: `Missing SEO${issueIds.missingSeo.size ? ` (${issueIds.missingSeo.size})` : ''}` },
                ]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => {
                      setPinnedFilter(null);
                      setProdFilter(f.key);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${prodFilter === f.key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {prodLoadError ? (
              <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs text-red-700">{prodLoadError}</p>
                <button type="button" onClick={() => void loadProducts()} className="text-xs font-medium text-red-700 hover:underline shrink-0">
                  Retry
                </button>
              </div>
            ) : null}
            {prodFilter !== 'all' && (
              <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/15">
                <p className="text-xs text-gray-700">
                  Showing <span className="font-semibold">{filteredProds.length}</span> product{filteredProds.length === 1 ? '' : 's'}:{' '}
                  <span className="font-medium text-primary">{PROD_FILTER_LABELS[prodFilter]}</span>
                  {prodLoading ? <span className="text-gray-400"> · refreshing…</span> : null}
                  {!prodLoading && pinnedFilter?.filter === prodFilter && pinnedFilter.ids.size > 0 ? (
                    <span className="text-gray-400"> · {pinnedFilter.ids.size} from dashboard</span>
                  ) : null}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPinnedFilter(null);
                    setProdFilter('all');
                  }}
                  className="text-xs font-medium text-primary hover:underline shrink-0"
                >
                  Clear filter
                </button>
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50 z-10">
                    <TableRow className="border-b border-gray-100">
                      <TableHead className="text-left text-[10px] text-gray-500 font-medium px-4 py-2.5 uppercase">Product</TableHead>
                      <TableHead className="text-left text-[10px] text-gray-500 font-medium px-4 py-2.5 uppercase w-20">Score</TableHead>
                      <TableHead className="w-8 px-2"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-50">
                    {prodLoading && products.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="px-4 py-8 text-center text-gray-400 text-xs">Loading…</TableCell></TableRow>
                    ) : filteredProds.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="px-4 py-8 text-center text-gray-400 text-xs">
                          {prodLoading
                            ? 'Loading matching products…'
                            : prodFilter === 'all'
                              ? (prodLoadError || 'No products found')
                              : products.length === 0
                                ? (prodLoadError || 'Product list failed to load. Click Refresh and try again.')
                                : (dashStats?.duplicateDescriptions > 0 && prodFilter === 'duplicate-descriptions')
                                  || (dashStats?.duplicateTitles > 0 && prodFilter === 'duplicate-titles')
                                  ? `Dashboard reported matches for “${PROD_FILTER_LABELS[prodFilter]}”, but none are in the current list. Click Refresh, or clear the filter and open the KPI again.`
                                  : `No products currently have “${PROD_FILTER_LABELS[prodFilter]}”. If the dashboard count is 0, this is expected.`}
                        </TableCell>
                      </TableRow>
                    ) : filteredProds.map(p => (
                      <TableRow key={p.id} className={`hover:bg-primary/5 cursor-pointer transition-colors ${selectedProd === p.id ? 'bg-primary/5' : ''}`}
                        onClick={() => { setSelectedProd(p.id); loadEditor(p.id); }}>
                        <TableCell className="px-4 py-2.5">
                          <p className="text-xs font-medium text-gray-900 truncate max-w-[260px]">{p.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">/{p.slug}</p>
                        </TableCell>
                        <TableCell className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${sb(p.score)}`} style={{ width: `${p.score}%` }} />
                            </div>
                            <span className={`text-xs font-bold tabular-nums ${sc(p.score)}`}>{p.score}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 py-2.5"><ChevronRight className="w-3.5 h-3.5 text-gray-300" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  <Button type="button" size="sm" onClick={saveProductSeo} disabled={saving}>
                    {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save
                  </Button>
                  <button onClick={async () => {
                    if (!token || editorData.seo?.seoLocked) return;
                    await seoApi.regenerateProductSeo(token, editorData.id, true);
                    await loadEditor(editorData.id);
                    showToast('SEO content regenerated');
                  }} disabled={editorData.seo?.seoLocked}
                    className="px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-50">
                    Regenerate
                  </button>
                  <a href={editSeo.canonicalUrl || `https://bretunetech.com/products/${editorData.slug}`} target="_blank" rel="noreferrer"
                    className="px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50">
                    Preview
                  </a>
                  <button onClick={() => { setEditorData(null); setSelectedProd(null); }} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editorLoading ? (
                <div className="text-center py-8 text-gray-400 text-xs">Loading…</div>
              ) : (
                <>
                  <GooglePreview title={editSeo.seoTitle || editSeo.metaTitle} description={editSeo.metaDescription} slug={editorData.slug} />
                  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">SEO Fields</h3>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Display Name</label>
                      <input value={editSeo.displayName} onChange={e => setEditSeo(s => ({ ...s, displayName: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-primary focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">SEO Title</label>
                      <input value={editSeo.seoTitle} onChange={e => setEditSeo(s => ({ ...s, seoTitle: e.target.value, metaTitle: e.target.value }))}
                        placeholder="SEO Title (max 60 chars)" maxLength={70}
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-primary focus:bg-white" />
                      <CharCounter value={editSeo.seoTitle} max={60} warn={50} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Meta Description</label>
                      <textarea value={editSeo.metaDescription} onChange={e => setEditSeo(s => ({ ...s, metaDescription: e.target.value }))}
                        placeholder="Meta description (max 160 chars)" rows={3} maxLength={170}
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-primary focus:bg-white resize-none" />
                      <CharCounter value={editSeo.metaDescription} max={160} warn={140} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Focus Keyword</label>
                      <input value={editSeo.focusKeyword} onChange={e => setEditSeo(s => ({ ...s, focusKeyword: e.target.value }))}
                        placeholder="e.g. Cisco router South Africa"
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-primary focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Short Description</label>
                      <textarea value={editSeo.shortDescription} onChange={e => setEditSeo(s => ({ ...s, shortDescription: e.target.value }))} rows={3}
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-primary focus:bg-white resize-none" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Full Description</label>
                      <textarea value={editSeo.fullDescription} onChange={e => setEditSeo(s => ({ ...s, fullDescription: e.target.value }))} rows={6}
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-primary focus:bg-white resize-none" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Secondary Keywords</label>
                      <input value={editSeo.secondaryKeywords} onChange={e => setEditSeo(s => ({ ...s, secondaryKeywords: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-primary focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Image ALT Text</label>
                      <input value={editSeo.imageAltText} onChange={e => setEditSeo(s => ({ ...s, imageAltText: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-primary focus:bg-white" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Canonical URL</label>
                      <input value={editSeo.canonicalUrl} onChange={e => setEditSeo(s => ({ ...s, canonicalUrl: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-primary focus:bg-white" />
                    </div>
                    <div className="flex gap-5 text-xs text-gray-700">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={editSeo.seoLocked} onChange={e => setEditSeo(s => ({ ...s, seoLocked: e.target.checked }))} /> Lock SEO content</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={editSeo.noIndex} onChange={e => setEditSeo(s => ({ ...s, noIndex: e.target.checked }))} /> Noindex</label>
                    </div>
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
                      className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:text-primary font-medium">
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
            <Table>
              <TableHeader className="bg-gray-50 border-b border-gray-100">
                <TableRow>
                  <TableHead className="text-left text-[10px] font-medium text-gray-500 uppercase px-4 py-2.5">Category</TableHead>
                  <TableHead className="text-left text-[10px] font-medium text-gray-500 uppercase px-4 py-2.5 w-20">Products</TableHead>
                  <TableHead className="text-left text-[10px] font-medium text-gray-500 uppercase px-4 py-2.5">SEO Title</TableHead>
                  <TableHead className="w-12 px-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {catLoading ? (
                  <TableRow><TableCell colSpan={4} className="px-4 py-8 text-center text-gray-400 text-xs">Loading…</TableCell></TableRow>
                ) : categories.map(cat => (
                  <React.Fragment key={cat.id}>
                    <TableRow className="hover:bg-gray-50/50">
                      <TableCell className="px-4 py-2.5">
                        <p className="text-xs font-medium text-gray-900">{cat.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">/{cat.slug}</p>
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-xs text-gray-700">{cat.productCount}</TableCell>
                      <TableCell className="px-4 py-2.5 text-xs text-gray-600 truncate max-w-[300px]">{cat.seo?.metaTitle || '—'}</TableCell>
                      <TableCell className="px-4 py-2.5">
                        <button onClick={() => setEditingCat(editingCat === cat.id ? null : cat.id)}
                          className="text-xs text-primary hover:text-primary font-medium">
                          {editingCat === cat.id ? 'Close' : 'Edit'}
                        </button>
                      </TableCell>
                    </TableRow>
                    {editingCat === cat.id && (
                      <TableRow>
                        <TableCell colSpan={4} className="px-4 py-3 bg-primary/5 border-t border-primary/15">
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
                                }} className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg font-medium hover:bg-primary/90">Save</button>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
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
            <Table>
              <TableHeader className="bg-gray-50 border-b border-gray-100">
                <TableRow>
                  <TableHead className="text-left text-[10px] font-medium text-gray-500 uppercase px-4 py-2.5">Page</TableHead>
                  <TableHead className="text-left text-[10px] font-medium text-gray-500 uppercase px-4 py-2.5">SEO Title</TableHead>
                  <TableHead className="w-12 px-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {pagesLoading ? (
                  <TableRow><TableCell colSpan={3} className="px-4 py-8 text-center text-gray-400 text-xs">Loading…</TableCell></TableRow>
                ) : pages.map(page => (
                  <React.Fragment key={page.slug}>
                    <TableRow className="hover:bg-gray-50/50">
                      <TableCell className="px-4 py-2.5">
                        <p className="text-xs font-medium text-gray-900">{page.label}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{page.path}</p>
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-xs text-gray-600 truncate max-w-[400px]">{page.seo?.metaTitle || '—'}</TableCell>
                      <TableCell className="px-4 py-2.5">
                        <button onClick={() => setEditingPage(editingPage === page.slug ? null : page.slug)}
                          className="text-xs text-primary hover:text-primary font-medium">
                          {editingPage === page.slug ? 'Close' : 'Edit'}
                        </button>
                      </TableCell>
                    </TableRow>
                    {editingPage === page.slug && (
                      <TableRow>
                        <TableCell colSpan={3} className="px-4 py-3 bg-primary/5 border-t border-primary/15">
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
                                }} className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg font-medium hover:bg-primary/90">Save</button>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ═══ GOOGLE SEARCH CONSOLE ═══ */}
      {tab === 'google' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Globe className="h-5 w-5 text-primary" />
                Google Search Console
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Monitor indexing status, inspect priority URLs, and improve SEO without overloading Google.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadAllGsc}
              disabled={gscLoading.dashboard}
            >
              <RefreshCw className={`h-4 w-4 ${gscLoading.dashboard ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
                  <AdminKpiCard label="Indexed Pages" value={gscDashboard.indexedPages} icon={CheckCircle} tone="emerald" showArrow={false} />
                  <AdminKpiCard label="Not Indexed" value={gscDashboard.notIndexedPages} icon={XCircle} tone="red" showArrow={false} />
                  <AdminKpiCard label="Crawled / Not Indexed" value={gscDashboard.crawledButNotIndexed} icon={FileSearch} tone="amber" showArrow={false} />
                  <AdminKpiCard label="Discovered / Not Indexed" value={gscDashboard.discoveredButNotIndexed} icon={Globe} tone="sky" showArrow={false} />
                  <AdminKpiCard label="Duplicate Pages" value={gscDashboard.duplicatePages} icon={FileText} tone="primary" showArrow={false} />
                  <AdminKpiCard label="Pages With Errors" value={gscDashboard.pagesWithErrors} icon={AlertTriangle} tone="red" showArrow={false} />
                  <AdminKpiCard label="Total Inspected" value={gscDashboard.totalInspected} icon={List} tone="slate" showArrow={false} />
                  <AdminKpiCard
                    label="Last Checked"
                    value={gscDashboard.lastChecked ? new Date(gscDashboard.lastChecked).toLocaleString() : 'Never'}
                    icon={Clock}
                    tone="teal"
                    showArrow={false}
                  />
                </div>
              )}

              {/* Sitemap Checklist */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-primary" />
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
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {gscLoading.importantBatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Inspect All Important Pages
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="max-h-[600px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10">
                      <TableRow className="border-b border-gray-100">
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">URL</TableHead>
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-40">Status</TableHead>
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-48">Last Crawl</TableHead>
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-40">Issue</TableHead>
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-52">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-50">
                      {importantPages.map((p) => (
                        <TableRow key={p.url} className="hover:bg-gray-50/50">
                          <TableCell className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">{p.url}</p>
                            <p className="text-[11px] text-gray-400">{p.pageType}</p>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getGscStatusBadge(p.coverageState)}`}>
                              {p.coverageState || 'Not checked'}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs text-gray-600">
                            {p.lastCrawlTime ? new Date(p.lastCrawlTime).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {p.issue ? <span className="text-xs text-red-600">{p.issue}</span> : <span className="text-xs text-emerald-600">No issue</span>}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {p.coverageState?.includes('Discovered') && (
                                <button
                                  onClick={() => inspectUrl(p.url, p.pageType)}
                                  disabled={gscLoading[p.url]}
                                  className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors disabled:opacity-50"
                                  title="Request indexing and improve internal links/content"
                                >
                                  Request Indexing
                                </button>
                              )}
                              <button
                                onClick={() => inspectUrl(p.url, p.pageType)}
                                disabled={gscLoading[p.url]}
                                className="p-1.5 text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-50"
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {gscLoading.productBatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Inspect Top 20 Products
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="max-h-[600px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10">
                      <TableRow className="border-b border-gray-100">
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Product</TableHead>
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-24">Priority</TableHead>
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-20">SEO</TableHead>
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-32">Status</TableHead>
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-52">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-50">
                      {priorityProducts.map((p) => (
                        <TableRow key={p.id} className="hover:bg-gray-50/50">
                          <TableCell className="px-4 py-3">
                            <Link href={`/admin/products/${p.id}`} className="text-sm font-medium text-gray-900 hover:text-primary truncate max-w-[300px] block">
                              {p.name}
                            </Link>
                            <p className="text-[11px] text-gray-400">/{p.slug}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              views {p.views} · stock {p.stockQuantity} · margin R{p.margin.toFixed(2)}
                            </p>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="text-xs font-semibold text-primary">{p.priorityScore}</span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className={`text-xs font-semibold ${p.seoScore && p.seoScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {p.seoScore ?? '-'}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getGscStatusBadge(p.coverageState)}`}>
                              {p.coverageState || 'Not checked'}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => inspectUrl(p.url, 'product')}
                                disabled={gscLoading[p.url]}
                                className="p-1.5 text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-50"
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                  <div className="max-h-[600px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-gray-50 z-10">
                        <TableRow className="border-b border-gray-100">
                          <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">URL</TableHead>
                          <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-32">Status</TableHead>
                          <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-48">Checked</TableHead>
                          <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Notes</TableHead>
                          <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-40">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-50">
                        {followUps.map((r) => (
                          <TableRow key={r.url} className="hover:bg-gray-50/50">
                            <TableCell className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">{r.url}</p>
                              <p className="text-[11px] text-gray-400">{r.pageType}</p>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getGscStatusBadge(r.coverageState)}`}>
                                {r.coverageState || 'Not checked'}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-xs text-gray-600">
                              {r.checkedAt ? new Date(r.checkedAt).toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <input
                                type="text"
                                defaultValue={r.notes || ''}
                                onBlur={(e) => {
                                  if (token) googleIndexingApi.updateNotes(token, r.url, e.target.value).catch(() => {});
                                }}
                                placeholder="Add notes..."
                                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1"
                              />
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => inspectUrl(r.url, r.pageType)}
                                  disabled={gscLoading[r.url]}
                                  className="p-1.5 text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-50"
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
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                <div className="max-h-[600px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10">
                      <TableRow className="border-b border-gray-100">
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">URL</TableHead>
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-24">Type</TableHead>
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-20">SEO</TableHead>
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-32">Indexed</TableHead>
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase w-48">Last Checked</TableHead>
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Issue</TableHead>
                        <TableHead className="text-left text-[11px] text-gray-500 font-medium px-4 py-2.5 uppercase">Recommended Fix</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-50">
                      {gscReport.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="px-4 py-8 text-center text-gray-400 text-xs">
                            No inspection records yet. Inspect important pages or products to build the report.
                          </TableCell>
                        </TableRow>
                      ) : (
                        gscReport.map((r) => (
                          <TableRow key={r.url} className="hover:bg-gray-50/50">
                            <TableCell className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">{r.url}</p>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-xs text-gray-600 capitalize">{r.pageType}</TableCell>
                            <TableCell className="px-4 py-3 text-xs font-semibold">{r.seoScore ?? '-'}</TableCell>
                            <TableCell className="px-4 py-3">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getGscStatusBadge(r.indexedStatus)}`}>
                                {r.indexedStatus || 'Not checked'}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-xs text-gray-600">
                              {r.lastChecked ? new Date(r.lastChecked).toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-xs text-red-600">{r.issue || '-'}</TableCell>
                            <TableCell className="px-4 py-3 text-xs text-gray-600">{r.recommendedFix || '-'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
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
              <MapPin className="w-5 h-5 text-primary" /> Sitemap Manager
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
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
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
                  const auditToProdFilter: Partial<Record<string, ProdFilter>> = {
                    duplicateTitles: 'duplicate-titles',
                    duplicateDescriptions: 'duplicate-descriptions',
                    missingImages: 'missing-images',
                    missingAlt: 'missing-alt',
                    missingSchema: 'missing-schema',
                    missingMetaTitles: 'missing-meta-title',
                    missingMetaDescriptions: 'missing-meta-desc',
                    missingFocusKeywords: 'missing-seo',
                  };
                  const linkedFilter = auditToProdFilter[item.key];
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
                          {linkedFilter && (
                            <button
                              type="button"
                              onClick={() => {
                                const ids = list.map((p: any) => String(p.id));
                                mergeIssueIds({
                                  duplicateTitles: item.key === 'duplicateTitles' ? ids : undefined,
                                  duplicateDescriptions: item.key === 'duplicateDescriptions' ? ids : undefined,
                                  missingImages: item.key === 'missingImages' ? ids : undefined,
                                  missingAlt: item.key === 'missingAlt' ? ids : undefined,
                                  missingSchema: item.key === 'missingSchema' ? ids : undefined,
                                  missingMetaTitle: item.key === 'missingMetaTitles' ? ids : undefined,
                                  missingMetaDesc: item.key === 'missingMetaDescriptions' ? ids : undefined,
                                  missingSeo: item.key === 'missingFocusKeywords' ? ids : undefined,
                                });
                                openProductsFilter(linkedFilter, ids);
                              }}
                              className="mb-2 text-xs font-semibold text-primary hover:underline"
                            >
                              Open all {list.length} in Products tab to fix →
                            </button>
                          )}
                          {list.slice(0, 30).map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between py-1">
                              <button
                                type="button"
                                className="text-xs text-gray-700 truncate max-w-[300px] text-left hover:text-primary"
                                onClick={() => {
                                  if (linkedFilter) openProductsFilter(linkedFilter);
                                  setSelectedProd(p.id);
                                  void loadEditor(p.id);
                                }}
                              >
                                {p.name}
                              </button>
                              <Link href={`/admin/products/${p.id}`} className="text-xs text-primary hover:text-primary font-medium ml-2 shrink-0">Edit</Link>
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

      {/* ═══ OPS CADENCE ═══ */}
      {tab === 'ops' && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" /> Ongoing SEO cadence
            </h2>
            <p className="text-sm text-gray-500">
              Foundations (phases 1–5) are live. Use this checklist to keep growth sustainable after deploy.
            </p>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {SEO_OPS_CADENCE.map((row) => (
                <div key={`${row.cadence}-${row.task}`} className="flex gap-4 px-4 py-3 bg-gray-50/50">
                  <span className="shrink-0 w-24 text-[11px] font-semibold uppercase tracking-wide text-primary pt-0.5">
                    {row.cadence}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{row.task}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{row.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Deploy regression checklist
            </h2>
            <ul className="space-y-2">
              {SEO_REGRESSION_CHECKS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <Square className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-700 space-y-1">
              <p className="font-semibold">CLI helpers</p>
              <p>
                Smoke URLs:{' '}
                <code className="bg-blue-100 px-1 rounded">node frontend/scripts/seo-regression-smoke.mjs</code>
                {' '}(set <code className="bg-blue-100 px-1 rounded">BASE_URL</code> for staging/prod).
              </p>
              <p>
                Product audit JSON:{' '}
                <code className="bg-blue-100 px-1 rounded">cd backend && npm run seo:audit-products</code>
              </p>
              <p>
                Or run the in-app <button type="button" onClick={() => changeTab('audit')} className="font-semibold underline">Audit</button> tab.
              </p>
            </div>
          </div>
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
                    <input type="checkbox" checked={overwrite} onChange={e => setOverwrite(e.target.checked)} className="w-3.5 h-3.5 rounded accent-primary" />
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
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-primary focus:bg-white" />
                  <p className="text-[10px] text-gray-400 mt-0.5">{field.help}</p>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2">
                <Button type="button" onClick={saveSettings} disabled={settingsSaving}>
                  {settingsSaving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Save className="w-3.5 h-3.5" /> Save Settings</>}
                </Button>
                {settingsMsg && <span className="text-sm text-emerald-600 font-medium">{settingsMsg}</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
