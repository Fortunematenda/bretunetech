'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, Check, Star } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  badge?: string;
  stock?: 'in' | 'low' | 'out';
  rating?: number;
  shipsToday?: boolean;
}

interface EnhancedProductCardProps {
  product: Product;
}

export default function EnhancedProductCard({ product }: EnhancedProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1, type: 'product', image: product.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col card-glow hover:-translate-y-1">
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square bg-gray-50 overflow-hidden p-4 block">

        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 z-10 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {product.badge && (
            <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full shadow-sm animate-bounce-subtle">
              {product.badge}
            </span>
          )}
          {product.shipsToday && (
            <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-sm flex items-center gap-1">
              <Check className="w-3 h-3" /> Ships Today
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3 z-10">
          {product.stock === 'in' && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
              In Stock
            </span>
          )}
          {product.stock === 'low' && (
            <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-100">
              Low Stock
            </span>
          )}
        </div>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
        />

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={handleQuickAdd}
            className={`w-full py-2.5 text-white text-sm font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all duration-200 ${
              added ? 'bg-green-500 hover:bg-green-600' : 'bg-[#003d7a] hover:bg-[#002855]'
            }`}
          >
            {added ? <><Check className="w-4 h-4" /> Added!</> : <><ShoppingCart className="w-4 h-4" /> Quick Add</>}
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(product.rating!) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">{product.rating}</span>
          </div>
        )}

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#003d7a] transition-colors duration-200 text-sm">
            {product.name}
          </h4>
        </Link>

        {/* Price */}
        <div className="mt-auto flex items-center justify-between">
          <p className="text-lg font-bold text-[#003d7a] group-hover:scale-105 transition-transform duration-200 origin-left">{formatPrice(product.price)}</p>
          <span className="text-xs text-gray-400">VAT incl.</span>
        </div>
      </div>
    </div>
  );
}
