import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { SITE_URL } from '@/lib/category-seo';
import { generateBreadcrumbSchema } from '@/lib/seo';
import { getBrands, getProductsList } from '@/lib/catalogue-data';
import { brandPath, isPageOutOfRange, normaliseSlug, parsePage } from '@/lib/catalogue-routing';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

const BRAND_PAGE_SIZE = 24;

async function loadBrandPage(rawSlug: string, rawPage: string | undefined) {
  const key = normaliseSlug(rawSlug);
  const brands = await getBrands();
  const brand = brands.find((b) => String(b.slug).toLowerCase() === key);
  if (!brand) notFound();
  const page = parsePage(rawPage);
  if (brand.slug !== rawSlug) {
    permanentRedirect(page > 1 ? `${brandPath(brand.slug)}?page=${page}` : brandPath(brand.slug));
  }

  const data = await getProductsList({ brand: brand.slug, page: String(page), limit: String(BRAND_PAGE_SIZE) });
  const total = data.pagination.total;
  if (isPageOutOfRange(page, total, BRAND_PAGE_SIZE)) notFound();
  return { brand, page, data, total };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const { brand, page, total } = await loadBrandPage(slug, pageParam);

  const name = brand.name as string;
  const description =
    (typeof brand.description === 'string' && brand.description.trim()) ||
    `Shop ${name} products at BretuneTech, including the models currently published in our catalogue.`;
  const path = page > 1 ? `${brandPath(brand.slug)}?page=${page}` : brandPath(brand.slug);
  const title = page > 1 ? `${name} Products – Page ${page} | BretuneTech` : `${name} Products | BretuneTech`;

  return {
    title: { absolute: title },
    description: description.slice(0, 160),
    alternates: { canonical: `${SITE_URL}${path}` },
    robots: total === 0 ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title,
      description: description.slice(0, 160),
      url: `${SITE_URL}${path}`,
      siteName: 'BretuneTech',
      type: 'website',
      locale: 'en_ZA',
    },
  };
}

export default async function BrandProductsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const { brand, page, data } = await loadBrandPage(slug, pageParam);
  const products = data.products;
  const pages = data.pagination.pages || 1;

  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Brands', url: '/brands' },
    { name: brand.name, url: brandPath(brand.slug) },
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-700">No {brand.name} products are listed right now.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link href="/brands" className="font-semibold text-[#003d7a]">All brands</Link>
            <span className="text-gray-300">·</span>
            <Link href="/products" className="font-semibold text-[#003d7a]">All products</Link>
            <span className="text-gray-300">·</span>
            <Link href="/quote" className="font-semibold text-[#003d7a]">Request a quote</Link>
          </div>
        </div>
      ) : (
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => {
          const image = product.images?.[0];
          const price = typeof product.sellingPrice === 'number' && product.sellingPrice > 0 ? product.sellingPrice : null;
          const inStock = product.stockStatus
            ? product.stockStatus !== 'out_of_stock'
            : Number(product.stockQuantity ?? 0) > 0;
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
                <p className="mt-1 text-xs text-gray-500">{inStock ? 'In stock' : 'Out of stock'}</p>
              </Link>
            </li>
          );
        })}
      </ul>
      )}
      {pages > 1 && (
        <nav className="mt-8 flex gap-3 text-sm" aria-label="Brand pages">
          {page > 1 && (
            <Link href={page === 2 ? brandPath(brand.slug) : `${brandPath(brand.slug)}?page=${page - 1}`} className="font-semibold text-[#003d7a]">
              Previous
            </Link>
          )}
          {page < pages && (
            <Link href={`${brandPath(brand.slug)}?page=${page + 1}`} className="font-semibold text-[#003d7a]">
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
