'use client';

import { useEffect } from 'react';
import { ShoppingCart, Minus, Plus, Check, Zap, Heart, Loader2, Truck, Shield, MapPin, MessageCircle, FileText, Mail } from 'lucide-react';
import { brand } from '@/lib/brand';
import { formatPrice } from '@/lib/utils';

interface ProductPurchaseCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sellingPrice: number;
    originalPrice?: number;
    condition: string;
    stockQuantity: number;
    stockCpt?: number;
    stockJhb?: number;
    stockDbn?: number;
    sku?: string;
    images: { url: string; altText?: string }[];
    brand?: { name: string };
    supplierName?: string;
  };
  quantity: number;
  setQuantity: (q: number) => void;
  warehouseLocation: 'CPT' | 'JHB' | 'DBN' | undefined;
  setWarehouseLocation: (loc: 'CPT' | 'JHB' | 'DBN') => void;
  addedToCart: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isInWishlist: boolean;
  isWishlistLoading: boolean;
  onToggleWishlist: () => void;
  inStock: boolean;
  getShippingText: () => string;
}

const WAREHOUSES = [
  { code: 'CPT' as const, name: 'Cape Town', color: 'green' as const },
  { code: 'JHB' as const, name: 'Johannesburg', color: 'blue' as const },
  { code: 'DBN' as const, name: 'Durban', color: 'orange' as const },
] as const;

type WarehouseColor = 'green' | 'blue' | 'orange';

const warehouseColorClasses: Record<WarehouseColor, { selected: string; unselected: string }> = {
  green: {
    selected: 'bg-green-600 text-white border-green-600 shadow-sm',
    unselected: 'bg-white text-green-700 border-slate-200 hover:border-green-300 hover:bg-green-50',
  },
  blue: {
    selected: 'bg-blue-600 text-white border-blue-600 shadow-sm',
    unselected: 'bg-white text-blue-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50',
  },
  orange: {
    selected: 'bg-orange-600 text-white border-orange-600 shadow-sm',
    unselected: 'bg-white text-orange-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50',
  },
};

export default function ProductPurchaseCard({
  product,
  quantity,
  setQuantity,
  warehouseLocation,
  setWarehouseLocation,
  addedToCart,
  onAddToCart,
  onBuyNow,
  isInWishlist,
  isWishlistLoading,
  onToggleWishlist,
  inStock,
  getShippingText,
}: ProductPurchaseCardProps) {
  const warehouseStockCount = [(product.stockCpt ?? 0) > 0, (product.stockJhb ?? 0) > 0, (product.stockDbn ?? 0) > 0].filter(Boolean).length;
  const requiresWarehouse = inStock && warehouseStockCount > 0;
  const canAddToCart = inStock && (!requiresWarehouse || !!warehouseLocation);
  const stockCounts = {
    CPT: product.stockCpt ?? 0,
    JHB: product.stockJhb ?? 0,
    DBN: product.stockDbn ?? 0,
  };

  // Auto-select single warehouse
  useEffect(() => {
    if (requiresWarehouse && warehouseStockCount === 1 && !warehouseLocation) {
      const single = WAREHOUSES.find((w) => stockCounts[w.code] > 0);
      if (single) setWarehouseLocation(single.code);
    }
  }, [requiresWarehouse, warehouseStockCount, warehouseLocation]);

  const discountPct = product.originalPrice && product.originalPrice > product.sellingPrice
    ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)
    : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm lg:sticky lg:top-24">
      {/* Price */}
      <div className="mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl sm:text-3xl font-bold text-[#003d7a]">{formatPrice(product.sellingPrice)}</span>
          {product.originalPrice && product.originalPrice > product.sellingPrice && (
            <span className="text-lg text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
          {discountPct && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">-{discountPct}%</span>
          )}
        </div>
      </div>

      {/* Availability */}
      <div className="flex flex-col gap-2 mb-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Availability</span>
          <span className={`font-semibold flex items-center gap-1 ${inStock ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
            {inStock ? 'In Stock' : 'Out of Stock'}
            {product.stockQuantity > 0 && ` (${product.stockQuantity})`}
          </span>
        </div>
        {(product.brand?.name || product.supplierName) && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Brand</span>
            <span className="font-semibold text-slate-900">{product.brand?.name || product.supplierName}</span>
          </div>
        )}
      </div>

      {/* Warehouse picker */}
      {requiresWarehouse && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
            Dispatch Warehouse <span className="text-red-500">*</span>
          </p>
          <p className="text-[11px] text-slate-500 mb-2">
            Choose the warehouse closest to your delivery address for faster dispatch.
          </p>
          <div className="flex flex-col gap-2">
            {WAREHOUSES.map((wh) => {
              const count = stockCounts[wh.code];
              if (count <= 0) return null;
              const isSelected = warehouseLocation === wh.code;
              const colors = warehouseColorClasses[wh.color];
              return (
                <button
                  key={wh.code}
                  onClick={() => setWarehouseLocation(wh.code)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                    isSelected ? colors.selected : colors.unselected
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    {wh.name}
                  </span>
                  <span className={`${isSelected ? 'opacity-90' : 'opacity-70'} font-normal`}>{count} in stock</span>
                </button>
              );
            })}
          </div>
          {!warehouseLocation && (
            <p className="text-xs text-orange-600 mt-1.5 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-orange-500" />
              Select a dispatch warehouse to continue.
            </p>
          )}
        </div>
      )}

      {/* Quantity + CTAs */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide shrink-0">Quantity</span>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2.5 hover:bg-slate-100 rounded-l-lg transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4 text-slate-600" />
            </button>
            <span className="w-10 text-center text-slate-900 font-semibold text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
              className="p-2.5 hover:bg-slate-100 rounded-r-lg transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <button
          disabled={!canAddToCart || addedToCart}
          onClick={onAddToCart}
          className={`w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl transition-all mb-2.5 ${
            addedToCart
              ? 'bg-green-600 text-white cursor-default'
              : canAddToCart
                ? 'bg-[#003d7a] hover:bg-[#002a55] text-white shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {addedToCart ? (
            <><Check className="w-5 h-5" /> Added to Cart!</>
          ) : (
            <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
          )}
        </button>

        <button
          disabled={!canAddToCart}
          onClick={onBuyNow}
          className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl border-2 border-[#003d7a] text-[#003d7a] hover:bg-[#003d7a] hover:text-white disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all mb-3"
        >
          <Zap className="w-4 h-4" /> Buy Now
        </button>

        <button
          onClick={onToggleWishlist}
          disabled={isWishlistLoading}
          className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl border transition-all ${
            isInWishlist
              ? 'bg-red-50 border-red-200 text-red-500'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-200'
          }`}
        >
          {isWishlistLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />}
          {isInWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
        </button>
      </div>

      {/* Compact trust line */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 mb-4">
        <Truck className="w-3 h-3" /> Fast dispatch
        <span className="text-slate-300">•</span>
        <Shield className="w-3 h-3" /> Secure checkout
      </div>

      {/* Assistance buttons */}
      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wide">Need Help?</p>
        <div className="grid grid-cols-3 gap-2">
          <a
            href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(
              `Hi BretuneTech, I'm interested in *${product.name}* (${formatPrice(product.sellingPrice)}).\n${brand.website}/products/${product.slug}\n\nIs this in stock?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 py-2 text-[11px] bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
          <a
            href={`mailto:${brand.emailSales}?subject=${encodeURIComponent(
              `Quote request: ${product.name}`
            )}&body=${encodeURIComponent(
              `Hi BretuneTech,\n\nI'd like a quote for the following:\n\nProduct: ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''}\nLink: ${brand.website}/products/${product.slug}\n\nQuantity needed: \nDo you offer installation? \nDelivery location: \n\nThank you.`
            )}`}
            className="flex items-center justify-center gap-1 py-2 text-[11px] border border-[#003d7a] text-[#003d7a] hover:bg-[#003d7a] hover:text-white font-medium rounded-lg transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Quote
          </a>
          <a
            href="/contact"
            className="flex items-center justify-center gap-1 py-2 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-lg transition-colors"
          >
            <Mail className="w-3.5 h-3.5" /> Contact
          </a>
        </div>
      </div>
    </div>
  );
}
