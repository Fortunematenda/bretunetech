'use client';

import { useState, useEffect } from 'react';
import { Plus, Download, Copy, Trash2, Edit, Eye } from 'lucide-react';
import {
  listMarketingAds,
  deleteMarketingAd,
  duplicateMarketingAd,
  getMarketingAdsStats,
  type MarketingAd,
  type MarketingAdsStats,
} from '@/lib/marketing-ads-api';
import Link from 'next/link';

export default function MarketingAdsPage() {
  const [ads, setAds] = useState<MarketingAd[]>([]);
  const [stats, setStats] = useState<MarketingAdsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [templateFilter, setTemplateFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [search, templateFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [adsData, statsData] = await Promise.all([
        listMarketingAds({
          search: search || undefined,
          template: templateFilter === 'all' ? undefined : templateFilter as any,
        }),
        getMarketingAdsStats(),
      ]);
      setAds(adsData.ads);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load marketing ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    try {
      await deleteMarketingAd(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete ad:', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateMarketingAd(id);
      loadData();
    } catch (error) {
      console.error('Failed to duplicate ad:', error);
    }
  };

  const templateLabels: Record<string, string> = {
    powder_splash: 'Powder Splash',
    neon_tech: 'Neon Tech',
    modern_gradient: 'Modern Gradient',
    premium_showcase: 'Premium Showcase',
    hero_banner: 'Hero Banner',
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Marketing Ads</h1>
        <p className="text-gray-500">Create and manage promotional advertisements</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.totalAds}</div>
            <div className="text-sm text-gray-500">Total Ads</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {stats.mostDownloaded?.downloadCount || 0}
            </div>
            <div className="text-sm text-gray-500">Most Downloaded</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {stats.mostUsedTemplate ? templateLabels[stats.mostUsedTemplate] : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Most Used Template</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.recentAds.length}</div>
            <div className="text-sm text-gray-500">Recent Ads</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search ads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
        />
        <select
          value={templateFilter}
          onChange={(e) => setTemplateFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Templates</option>
          <option value="powder_splash">Powder Splash</option>
          <option value="neon_tech">Neon Tech</option>
          <option value="modern_gradient">Modern Gradient</option>
          <option value="premium_showcase">Premium Showcase</option>
          <option value="hero_banner">Hero Banner</option>
        </select>
        <Link
          href="/admin/marketing-ads/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Ad
        </Link>
      </div>

      {/* Ads List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : ads.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No marketing ads found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {ad.generatedThumbnailUrl && (
                <div className="aspect-video bg-gray-100">
                  <img
                    src={ad.generatedThumbnailUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{ad.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{ad.headline}</p>
                <p className="text-xs text-gray-500 mb-2">{ad.product.productName}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700">
                    {templateLabels[ad.template]}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700">
                    {ad.downloadCount} downloads
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/marketing-ads/${ad.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDuplicate(ad.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-600 rounded text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
