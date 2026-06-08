'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Network, Camera, Zap, Wifi, Cable, Cpu, Plug } from 'lucide-react';

const categories = [
  {
    name: 'Networking',
    icon: Network,
    count: 150,
    slug: 'networking',
    color: 'from-blue-500 to-blue-600',
    description: 'Routers, switches, and access points'
  },
  {
    name: 'CCTV',
    icon: Camera,
    count: 85,
    slug: 'cctv',
    color: 'from-red-500 to-red-600',
    description: 'Security cameras and surveillance'
  },
  {
    name: 'Power Solutions',
    icon: Zap,
    count: 120,
    slug: 'power-solutions',
    color: 'from-yellow-500 to-orange-500',
    description: 'Inverters, batteries, and UPS'
  },
  {
    name: 'Wireless',
    icon: Wifi,
    count: 95,
    slug: 'wireless',
    color: 'from-purple-500 to-purple-600',
    description: 'WiFi and wireless networking'
  },
  {
    name: 'Fibre',
    icon: Cable,
    count: 65,
    slug: 'fibre',
    color: 'from-cyan-500 to-cyan-600',
    description: 'Fibre optics and cabling'
  },
  {
    name: 'Accessories',
    icon: Plug,
    count: 300,
    slug: 'accessories',
    color: 'from-gray-500 to-gray-600',
    description: 'Cables, mounts, and components'
  }
];

const FeaturedCategories = () => {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-600">Browse our extensive range of enterprise solutions</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                {/* Icon */}
                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#003d7a] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{category.description}</p>
                  <p className="text-sm text-gray-500 mb-3">{category.count} Products</p>
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
