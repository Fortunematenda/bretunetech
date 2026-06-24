import type { Metadata } from 'next';
import { generateProductMetadata, generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return { title: 'Product Not Found' };
  }
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

  const schemas = [];
  if (product) {
    schemas.push(generateProductSchema(product));
    schemas.push(
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
        ...(product.category ? [{ name: product.category.name, url: `/products?category=${product.category.slug}` }] : []),
        { name: product.name, url: `/products/${slug}` },
      ])
    );
  }

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
