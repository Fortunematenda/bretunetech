'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';

const brands = [
  { name: 'MikroTik', slug: 'mikrotik', description: 'Professional networking equipment and routers' },
  { name: 'Ubiquiti', slug: 'ubiquiti', description: 'Enterprise WiFi and networking solutions' },
  { name: 'Hubble', slug: 'hubble', description: 'Lithium battery and power storage systems' },
  { name: 'Mecer', slug: 'mecer', description: 'UPS and power backup solutions' },
  { name: 'Must', slug: 'must', description: 'Solar inverters and power systems' },
  { name: 'Dell', slug: 'dell', description: 'Refurbished laptops and computers' },
];

export default function BrandsPage() {
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/products?brand=${brand.slug}`}
            className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition-all"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#003d7a] transition-colors">
              {brand.name}
            </h2>
            <p className="text-gray-500 text-sm">{brand.description}</p>
            <div className="mt-4 text-[#003d7a] text-sm font-medium">
              View Products →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
