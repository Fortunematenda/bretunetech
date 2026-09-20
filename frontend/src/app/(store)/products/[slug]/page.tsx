import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { fetchProductBySlug } from '@/lib/server-api';
import ProductDetailClient from './ProductDetailClient';

const getProduct = cache(async (slug: string) => fetchProductBySlug(slug));

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();
  if (product.redirectSlug) redirect(`/products/${product.redirectSlug}`);
  if (product.slug && product.slug !== slug) redirect(`/products/${product.slug}`);

  return (
    <Suspense fallback={null}>
      <ProductDetailClient initialProduct={product} />
    </Suspense>
  );
}
