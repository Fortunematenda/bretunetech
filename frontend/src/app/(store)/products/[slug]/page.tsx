import { Suspense } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { getProduct } from '@/lib/catalogue-data';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();
  if (product.slug && product.slug !== slug) permanentRedirect(`/products/${product.slug}`);

  return (
    <Suspense fallback={null}>
      <ProductDetailClient initialProduct={product} />
    </Suspense>
  );
}
