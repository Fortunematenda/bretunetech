'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { brandsApi } from '@/lib/api';

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Featured Brands | Bretunetech';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'We partner with leading technology brands to bring you quality networking and power solutions.');
    }
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await brandsApi.list();
        setBrands(Array.isArray(data) ? data : []);
      } catch {
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm text-blue-600 font-medium mb-4">
          <Package className="w-4 h-4" /> Our Partners
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Featured Brands</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          We partner with leading technology brands to bring you quality networking and power solutions.
        </p>
      </div>

      {/* Brand Cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No brands available yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brand=${brand.slug}`}
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition-all"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#003d7a] transition-colors">
                {brand.name}
              </h2>
              <p className="text-gray-500 text-sm">{brand.description || 'Quality products from ' + brand.name}</p>
              <div className="mt-4 text-[#003d7a] text-sm font-medium">
                View Products →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
