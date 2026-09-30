import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBrandsList, fetchProductsList } from '@/lib/server-api';
import { SITE_URL } from '@/lib/category-seo';
import { generateBreadcrumbSchema } from '@/lib/seo';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function loadBrand(slug: string) {
  const brands = await fetchBrandsList();
  return brands.find((brand) => String(brand.slug).toLowerCase() === slug.toLowerCase()) || null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { page } = await searchParams;
  const brand = await loadBrand(slug);
  if (!brand) return { robots: { index: false, follow: false } };

  const name = brand.name as string;
  const description =
    (typeof brand.description === 'string' && brand.description.trim()) ||
    `Shop ${name} products at BretuneTech, including the models currently published in our catalogue.`;
  const preview = await fetchProductsList({ brand: brand.slug, page: '1', limit: '1' });
  const empty = (preview.pagination?.total ?? 0) === 0;
  const pageNumber = parseInt(page || '1', 10);

  return {
    title: { absolute: `${name} Products | BretuneTech` },
    description: description.slice(0, 160),
    alternates: { canonical: `${SITE_URL}/brands/${brand.slug}` },
    robots: empty || pageNumber > 1 ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: `${name} Products | BretuneTech`,
      description: description.slice(0, 160),
      url: `${SITE_URL}/brands/${brand.slug}`,
      siteName: 'BretuneTech',
      type: 'website',
      locale: 'en_ZA',
    },
  };
}

export default async function BrandProductsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const brand = await loadBrand(slug);
  if (!brand) notFound();

  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const data = await fetchProductsList({
    brand: brand.slug,
    page: String(page),
    limit: '24',
  });
  const products = data.products || [];
  const pages = data.pagination?.pages || 1;

  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Brands', url: '/brands' },
    { name: brand.name, url: `/brands/${brand.slug}` },
  ]);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/brands" className="hover:text-[#003d7a]">Brands</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{brand.name}</span>
      </nav>
      <header className="mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-[#003d7a] sm:text-3xl">{brand.name} products</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
          {brand.description || `Published ${brand.name} products from the BretuneTech catalogue.`}
        </p>
      </header>
      {products.length === 0 ? (
        <p className="text-sm text-gray-600">No published products for this brand right now.</p>
      ) : (
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => {
          const image = product.images?.[0];
          const price = typeof product.sellingPrice === 'number' && product.sellingPrice > 0 ? product.sellingPrice : null;
          const stock = Number(product.stockQuantity ?? 0);
          return (
            <li key={product.id} className="rounded-xl border border-gray-200 bg-white p-3">
              <Link href={`/products/${product.slug}`} className="block">
                {image?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.url}
                    alt={image.altText || product.name}
                    className="mb-3 aspect-square w-full object-contain"
                  />
                ) : null}
                <h2 className="text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</h2>
                {price != null && (
                  <p className="mt-2 text-sm font-bold text-[#003d7a]">
                    R {price.toLocaleString('en-ZA')}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">{stock > 0 ? 'In stock' : 'Out of stock'}</p>
              </Link>
            </li>
          );
        })}
      </ul>
      )}
      {pages > 1 && (
        <nav className="mt-8 flex gap-3 text-sm" aria-label="Brand pages">
          {page > 1 && (
            <Link href={page === 2 ? `/brands/${brand.slug}` : `/brands/${brand.slug}?page=${page - 1}`} className="font-semibold text-[#003d7a]">
              Previous
            </Link>
          )}
          {page < pages && (
            <Link href={`/brands/${brand.slug}?page=${page + 1}`} className="font-semibold text-[#003d7a]">
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
