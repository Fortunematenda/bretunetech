import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  generateProductMetadata,
  generateProductSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo';
import { categoryPath } from '@/lib/category-seo';
import { getProduct } from '@/lib/catalogue-data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  if (product.slug !== slug) permanentRedirect(`/products/${product.slug}`);
  return generateProductMetadata(product);
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();
  if (product.slug !== slug) permanentRedirect(`/products/${product.slug}`);

  const categoryCrumbs: { name: string; url: string }[] = [];
  if (product.category?.parent?.name && product.category?.parent?.slug) {
    categoryCrumbs.push({
      name: product.category.parent.name,
      url: categoryPath(product.category.parent.slug),
    });
  }
  if (product.category?.name && product.category?.slug) {
    categoryCrumbs.push({
      name: product.category.name,
      url: categoryPath(product.category.slug),
    });
  }

  const schemas = [
    generateProductSchema(product),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/products' },
      ...categoryCrumbs,
      {
        name: product.displayName || product.name,
        url: product.canonicalUrl || `/products/${product.slug}`,
      },
    ]),
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {children}
    </>
  );
}
