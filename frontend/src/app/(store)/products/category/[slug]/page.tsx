import { Suspense } from 'react';
import type { Metadata } from 'next';
import {
  fetchProductsList,
  fetchCategoriesList,
  fetchBrandsList,
} from '@/lib/server-api';
import {
  SITE_URL,
  getCategorySeo,
  listingHasExtraFilters,
} from '@/lib/category-seo';
import { generateBreadcrumbSchema } from '@/lib/seo';
import ProductsClient from '../../ProductsClient';

type SearchParams = {
  page?: string;
  limit?: string;
  search?: string;
  brand?: string;
  sort?: string;
  discount?: string;
  minPrice?: string;
  maxPrice?: string;
  priceMin?: string;
  priceMax?: string;
  condition?: string;
  bestSeller?: string;
  newArrivals?: string;
  inStock?: string;
  filter?: string;
};

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await searchParams;
  const seo = getCategorySeo(slug);
  const filtered = listingHasExtraFilters(resolved) || Boolean(resolved.brand) || Boolean(resolved.search);

  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: `${SITE_URL}${seo.canonicalPath}` },
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${SITE_URL}${seo.canonicalPath}`,
      siteName: 'BretuneTech',
      type: 'website',
      locale: 'en_ZA',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
  };
}

export default async function CategoryProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = parseInt(resolvedParams.limit || '15', 10);
  const seo = getCategorySeo(slug);

  const [productsData, categories, brands] = await Promise.all([
    fetchProductsList({
      page: String(page),
      limit: String(limit),
      category: slug,
      search: resolvedParams.search,
      brand: resolvedParams.brand,
      sort: resolvedParams.sort,
      discount: resolvedParams.discount,
      minPrice: resolvedParams.minPrice || resolvedParams.priceMin,
      maxPrice: resolvedParams.maxPrice || resolvedParams.priceMax,
      condition: resolvedParams.condition,
      bestSeller: resolvedParams.bestSeller,
      newArrivals: resolvedParams.newArrivals,
      inStock: resolvedParams.inStock,
    }),
    fetchCategoriesList(),
    fetchBrandsList(),
  ]);

  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: seo.h1, url: seo.canonicalPath },
  ]);

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-[#003d7a] sm:text-3xl">{seo.h1}</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">{seo.intro}</p>
        </header>
        <Suspense fallback={null}>
          <ProductsClient
            initialProducts={productsData.products || []}
            initialPagination={productsData.pagination || { total: 0, pages: 1 }}
            categories={categories}
            brands={brands}
            searchParams={{ ...resolvedParams, category: slug }}
            listingBasePath={`/products/category/${slug}`}
            headingOverride={seo.h1}
            hideHeading
          />
        </Suspense>
      </div>
    </div>
  );
}
