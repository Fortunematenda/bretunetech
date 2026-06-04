'use client';

import Link from 'next/link';
import { Package, ShoppingCart, TrendingDown } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';

interface BundleCardProps {
  bundle: {
    id: string;
    name: string;
    slug: string;
    description: string;
    bundlePrice: number;
    originalPrice?: number;
    discountPercentage?: number;
    savings?: number;
    imageUrl?: string;
    items?: { product: { name: string; sellingPrice: number; images?: { url: string }[] }; quantity: number }[];
  };
}

export default function BundleCard({ bundle }: BundleCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group bg-gradient-to-br from-gray-900 to-gray-900 border border-orange-500/30 rounded-xl overflow-hidden hover:border-orange-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
      {/* Header badge */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-white" />
          <span className="text-sm font-bold text-white">VoltNet Kit</span>
        </div>
        {bundle.discountPercentage && bundle.discountPercentage > 0 && (
          <span className="flex items-center gap-1 text-sm font-bold text-white">
            <TrendingDown className="w-3.5 h-3.5" />
            Save {bundle.discountPercentage}%
          </span>
        )}
      </div>

      <div className="p-5">
        <Link href={`/bundles/${bundle.slug}`}>
          <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors mb-2">
            {bundle.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{bundle.description}</p>

        {/* Included items preview */}
        {bundle.items && bundle.items.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {bundle.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />
                <span className="truncate">{item.quantity}x {item.product.name}</span>
              </div>
            ))}
            {bundle.items.length > 3 && (
              <span className="text-xs text-gray-500">+{bundle.items.length - 3} more items</span>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-800">
          <div>
            {bundle.originalPrice && (
              <span className="text-sm text-gray-500 line-through block">
                {formatPrice(bundle.originalPrice)}
              </span>
            )}
            <span className="text-2xl font-bold text-white">{formatPrice(bundle.bundlePrice)}</span>
            {bundle.savings && bundle.savings > 0 && (
              <span className="text-xs text-green-400 font-medium block mt-0.5">
                You save {formatPrice(bundle.savings)}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              addItem({
                bundleId: bundle.id,
                name: bundle.name,
                price: bundle.bundlePrice,
                quantity: 1,
                type: 'bundle',
              });
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Add Kit
          </button>
        </div>
      </div>
    </div>
  );
}
