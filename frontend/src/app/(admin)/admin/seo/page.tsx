'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, RefreshCw, AlertTriangle, CheckCircle, XCircle, ChevronRight, Globe, Image, FileText, Tag } from 'lucide-react';
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
  const [summary, setSummary] = useState<Summary | null>(null);
  const [products, setProducts] = useState<ProductScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'excellent' | 'good' | 'poor'>('all');

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await seoApi.getProductScores(token);
      setSummary(data.summary);
      setProducts(data.products);
    } catch (err) {
      console.error('Failed to load SEO scores:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
          <h1 className="text-xl font-bold text-gray-900">SEO Score Checker</h1>
          <p className="text-gray-500 text-sm mt-0.5">Analyze and improve product SEO across your store</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
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
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'poor', 'good', 'excellent'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                filter === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
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
                        {p.issues.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded">
                            +{p.issues.length - 3} more
                          </span>
                        )}
                        {p.issues.length === 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100">
                            All good
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Image className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-700">{p.imageCount}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.hasCategory ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.hasBrand ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                      >
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

      {/* SEO Tips */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">SEO Optimization Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: FileText, title: 'Product Descriptions', tip: 'Write unique descriptions with 100+ characters. Include relevant keywords naturally.' },
            { icon: Image, title: 'Product Images', tip: 'Add 3+ images per product with descriptive alt text for accessibility and SEO.' },
            { icon: Tag, title: 'Categories & Brands', tip: 'Assign every product to a category and brand for better site structure and schema markup.' },
            { icon: Globe, title: 'Product Slugs', tip: 'Use clean, keyword-rich slugs. Avoid random IDs or special characters.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <item.icon className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{item.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
