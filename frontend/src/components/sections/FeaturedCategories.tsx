'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { categoriesApi } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  children?: Category[];
  _count?: { products: number };
}

const categoryColors: Record<string, string> = {
  'computers-laptops': 'from-blue-500 to-blue-600',
  'computer-components': 'from-indigo-500 to-indigo-600',
  'storage-memory': 'from-red-500 to-red-600',
  'networking': 'from-cyan-500 to-cyan-600',
  'cctv-security': 'from-purple-500 to-purple-600',
  'power-backup': 'from-yellow-500 to-orange-500',
  'wireless-solutions': 'from-pink-500 to-pink-600',
  'printers-office': 'from-green-500 to-green-600',
  'peripherals': 'from-teal-500 to-teal-600',
  'gaming': 'from-rose-500 to-rose-600',
  'mobile-smart-devices': 'from-violet-500 to-violet-600',
  'accessories': 'from-gray-500 to-gray-600',
};

const categoryIcons: Record<string, string> = {
  'computers-laptops': '💻',
  'computer-components': '🔧',
  'storage-memory': '💾',
  'networking': '🌐',
  'cctv-security': '📷',
  'power-backup': '⚡',
  'wireless-solutions': '📡',
  'printers-office': '🖨️',
  'peripherals': '⌨️',
  'gaming': '🎮',
  'mobile-smart-devices': '📱',
  'accessories': '🔌',
};

const FeaturedCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-600">Browse our extensive range of technology solutions</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((category) => {
            const color = categoryColors[category.slug] || 'from-gray-500 to-gray-600';
            const icon = categoryIcons[category.slug] || '📦';
            const count = category._count?.products || 0;
            return (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                {/* Icon */}
                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{icon}</span>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#003d7a] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{category.description || ''}</p>
                  <p className="text-sm text-gray-500 mb-3">{count} Products</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-[#003d7a] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Shop</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
