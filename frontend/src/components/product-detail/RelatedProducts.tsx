'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FileText, Eye } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface RelatedProduct {
  id: string;
  slug: string;
  name: string;
  sellingPrice: number;
  originalPrice?: number;
  condition: string;
  images: { url: string; altText?: string }[];
  stockQuantity?: number;
  stockCpt?: number;
  stockJhb?: number;
  stockDbn?: number;
  category?: { name: string };
}

interface RelatedProductsProps {
  products: RelatedProduct[];
  isLoading: boolean;
}

export default function RelatedProducts({ products, isLoading }: RelatedProductsProps) {
  if (isLoading) {
    return (
      <div className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-slate-100">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">You Might Also Like</h2>
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-[#003d7a] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-slate-100">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((related) => {
          const inStock = (related.stockQuantity ?? 0) > 0 || (related.stockCpt ?? 0) > 0 || (related.stockJhb ?? 0) > 0 || (related.stockDbn ?? 0) > 0;
          const discountPct = related.originalPrice && related.originalPrice > related.sellingPrice
            ? Math.round(((related.originalPrice - related.sellingPrice) / related.originalPrice) * 100)
            : null;

          return (
            <Link
              key={related.id}
              href={`/products/${related.slug}`}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="relative h-[160px] sm:h-[180px] bg-white flex items-center justify-center p-3 overflow-hidden border-b border-slate-100">
                {related.images?.[0]?.url ? (
                  <Image
                    src={related.images[0].url}
                    alt={related.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain object-center p-2 group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-slate-300" />
                  </div>
                )}

                {discountPct && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                    -{discountPct}%
                  </span>
                )}

                <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                {related.category?.name && (
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{related.category.name}</p>
                )}
                <h3 className="font-medium text-slate-900 text-sm line-clamp-2 group-hover:text-[#003d7a] transition-colors mb-2">
                  {related.name}
                </h3>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#003d7a]">{formatPrice(related.sellingPrice)}</p>
                    {related.originalPrice && related.originalPrice > related.sellingPrice && (
                      <p className="text-[10px] text-slate-400 line-through">{formatPrice(related.originalPrice)}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#003d7a] text-white text-[11px] font-semibold group-hover:bg-[#002a55] transition-colors">
                    <Eye className="w-3 h-3" /> View
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
