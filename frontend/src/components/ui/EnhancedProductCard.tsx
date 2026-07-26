'use client';

import ProductCard, { type ProductCardProduct } from '@/components/ui/ProductCard';

/** Legacy home/featured product shape — maps into the shared ProductCard. */
interface FeaturedProductLike {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  badge?: string;
  stock?: 'in' | 'low' | 'out';
  rating?: number;
  shipsToday?: boolean;
  brand?: string;
  originalPrice?: number;
  discount?: number;
  shippingDays?: number;
  discountExpiresAt?: string;
}

interface EnhancedProductCardProps {
  product: FeaturedProductLike;
}

function toProductCardProduct(product: FeaturedProductLike): ProductCardProduct {
  const stockQuantity =
    product.stock === 'out' ? 0 : product.stock === 'low' ? 3 : 20;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    sellingPrice: product.price,
    originalPrice: product.originalPrice,
    discountExpiresAt: product.discountExpiresAt,
    condition: 'NEW',
    images: [{ url: product.image, altText: product.name }],
    tags: product.badge ? [{ tag: product.badge }] : undefined,
    stockQuantity,
    averageRating: product.rating,
    shippingDays: product.shippingDays,
  };
}

export default function EnhancedProductCard({ product }: EnhancedProductCardProps) {
  return <ProductCard product={toProductCardProduct(product)} />;
}
