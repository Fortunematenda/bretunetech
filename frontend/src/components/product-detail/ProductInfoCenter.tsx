'use client';

import { Star, CheckCircle, Truck, Shield, Package } from 'lucide-react';
import Link from 'next/link';

interface ProductInfoCenterProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    condition: string;
    category?: { name: string; slug: string };
    brand?: { name: string };
    supplierName?: string;
    sku?: string;
    specifications?: { key: string; value: string }[];
    shippingDays?: number;
  };
  reviewStats: { average: number; count: number } | null;
}

function getKeyFacts(specs?: { key: string; value: string }[], product?: { condition?: string; sku?: string; shippingDays?: number }) {
  const facts: { label: string; value: string }[] = [];

  // Priority-based spec selection
  if (specs) {
    const priorityKeywords = [
      { key: 'wifi', label: 'WiFi' },
      { key: 'port', label: 'Ports' },
      { key: 'speed', label: 'Speed' },
      { key: 'frequency', label: 'Frequency' },
      { key: 'range', label: 'Range' },
      { key: 'power', label: 'Power' },
      { key: 'voltage', label: 'Voltage' },
      { key: 'interface', label: 'Interface' },
      { key: 'standard', label: 'Standard' },
      { key: 'type', label: 'Type' },
      { key: 'dimension', label: 'Dimensions' },
      { key: 'weight', label: 'Weight' },
    ];

    for (const priority of priorityKeywords) {
      const match = specs.find((s) => s.key.toLowerCase().includes(priority.key));
      if (match) {
        facts.push({ label: priority.label, value: match.value });
      }
      if (facts.length >= 5) break;
    }
  }

  // Add condition if not already present
  if (product?.condition && !facts.some((f) => f.label === 'Condition')) {
    facts.push({
      label: 'Condition',
      value: product.condition.charAt(0) + product.condition.slice(1).toLowerCase(),
    });
  }

  // Add SKU if available and not already too many
  if (product?.sku && facts.length < 6) {
    facts.push({ label: 'SKU', value: product.sku });
  }

  // Add dispatch estimate
  if (facts.length < 6 && product?.shippingDays) {
    const days = product.shippingDays;
    const text = days === 1 ? '1 work day' : days === 2 ? '1-2 work days' : `${days - 1}-${days} work days`;
    facts.push({ label: 'Dispatch', value: text });
  }

  return facts.slice(0, 6);
}

export default function ProductInfoCenter({ product, reviewStats }: ProductInfoCenterProps) {
  const summaryText = product.description
    ? product.description.split('\n')[0].slice(0, 260) + (product.description.split('\n')[0].length > 260 ? '…' : '')
    : 'Product details will be updated soon. Contact BretuneTech for more information.';

  const keyFacts = getKeyFacts(product.specifications, product);

  return (
    <div className="flex flex-col">
      {/* Title */}
      <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-slate-900 leading-snug mb-2">
        {product.name}
      </h1>

      {/* Category / brand / supplier */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        {product.category && (
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-[#003d7a] hover:text-[#002a55] font-medium"
          >
            {product.category.name}
          </Link>
        )}
        {product.category && (product.brand?.name || product.supplierName) && (
          <span className="text-slate-300">|</span>
        )}
        {(product.brand?.name || product.supplierName) && (
          <span className="text-slate-600">{product.brand?.name || product.supplierName}</span>
        )}
      </div>

      {/* Supplier badge */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
          <span className="text-[10px] sm:text-xs font-medium text-green-700">by bretunetech distributor network</span>
        </div>
      </div>

      {/* Rating */}
      {reviewStats && reviewStats.count > 0 && (
        <div className="flex items-center gap-1.5 mb-4">
          <span className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(reviewStats.average) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
              />
            ))}
          </span>
          <span className="text-sm font-semibold text-slate-900">{reviewStats.average.toFixed(1)}</span>
          <span className="text-sm text-slate-500">({reviewStats.count} reviews)</span>
        </div>
      )}

      {/* Short summary */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-6">
        <p className="text-sm text-slate-700 leading-relaxed">{summaryText}</p>
      </div>

      {/* Key facts */}
      {keyFacts.length > 0 && (
        <div className="mb-2">
          <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wide">Key Facts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {keyFacts.map((fact, i) => (
              <div
                key={i}
                className="flex items-start gap-2 bg-white border border-slate-100 rounded-lg p-2.5"
              >
                <span className="w-1 h-1 rounded-full bg-[#003d7a] mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">{fact.label}</p>
                  <p className="text-xs font-medium text-slate-900 truncate">{fact.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
