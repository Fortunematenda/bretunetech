'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  stockQuantity?: number;
}

interface Props {
  title: string;
  categorySlug: string;
  accentColor: string;
  bgColor: string;
  icon: React.ReactNode;
}

const CategoryProductSection = ({ title, categorySlug, accentColor, bgColor, icon }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.list({ category: categorySlug, limit: '4', status: 'published' })
      .then((res: any) => {
        const items = res?.products || res?.data || (Array.isArray(res) ? res : []);
        setProducts(items.slice(0, 4));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [categorySlug]);

  if (!loading && products.length === 0) return null;

  return (
    <section className={`py-10 px-4 sm:px-6 lg:px-8 ${bgColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 ${accentColor} rounded-lg flex items-center justify-center`}>
              {icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500">Top picks in this category</p>
            </div>
          </div>
          <Link href={`/products?category=${categorySlug}`}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#003d7a] hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="bg-gray-200 h-36 rounded-lg mb-3" />
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const discount = product.originalPrice && product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : null;
              return (
                <Link key={product.id} href={`/products/${product.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                  <div className="relative mb-3">
                    {discount && (
                      <span className="absolute top-0 left-0 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        -{discount}%
                      </span>
                    )}
                    <div className="h-36 flex items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                      <img
                        src={product.image || '/placeholder-product.png'}
                        alt={product.name}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 font-medium leading-snug line-clamp-2 flex-1 mb-2">{product.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-5 sm:hidden text-center">
          <Link href={`/products?category=${categorySlug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#003d7a] hover:underline">
            View all {title} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryProductSection;
