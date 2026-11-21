import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import ProductsClient from './ProductsClient';
import {
  categoryIndex,
  getAllCategories,
  getBrands,
  getProductsList,
  getVisibleCategories,
} from '@/lib/catalogue-data';
import {
  brandPath,
  categoryListingUrl,
  hasSubsetFilters,
  isPageOutOfRange,
  listingQuery,
  listingSeo,
  parsePage,
  parsePageSize,
  resolveCategory,
  sanitiseListingParams,
  toApiQuery,
  withQuery,
  type ListingParams,
} from '@/lib/catalogue-routing';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/**
 * /products is the all-products listing plus search and cross-category filters.
 * Category and brand views have their own preferred URLs; equivalent query
 * forms are permanently redirected there, and unknown slugs are real 404s.
 */
async function loadProductsPage(rawParams: Record<string, unknown>) {
  const params = sanitiseListingParams(rawParams);
  const categorySlug = params.category || params.solution;

  if (categorySlug) {
    const index = categoryIndex(await getAllCategories());
    const resolution = resolveCategory(categorySlug, new Set(index.keys()));
    if (resolution.kind === 'gone' || resolution.kind === 'missing') notFound();
    const rest: ListingParams = { ...params, category: undefined, solution: undefined };
    permanentRedirect(categoryListingUrl(resolution.slug, rest));
  }

  if (params.brand) {
    const brands = await getBrands();
    const brand = brands.find((b) => String(b.slug).toLowerCase() === params.brand);
    if (!brand) notFound();
    const onlyBrand = !hasSubsetFilters({ ...params, brand: undefined }) && !params.sort && !params.limit;
    if (onlyBrand) {
      permanentRedirect(withQuery(brandPath(brand.slug), params.page ? `page=${params.page}` : ''));
    }
  }

  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.limit);
  const listing = await getProductsList(toApiQuery(params));
  const total = listing.pagination.total;
  if (isPageOutOfRange(page, total, pageSize)) notFound();

  const seo = listingSeo('/products', params, total);
  return { params, page, listing, seo };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { params, page, seo } = await loadProductsPage(await searchParams);

  let title = page > 1 ? `All Products – Page ${page}` : 'All Products';
  let description =
    'Browse networking equipment, Wi-Fi, wireless links and IT infrastructure from trusted brands, with current prices and stock at BretuneTech.';
  if (params.search) {
    title = `Search results for “${params.search}”`;
    description = `Products matching “${params.search}” at BretuneTech.`;
  } else if (hasSubsetFilters(params)) {
    title = 'Filtered products';
  }

  return {
    title,
    description,
    alternates: { canonical: seo.canonical },
    robots: seo.robots,
    openGraph: {
      title: `${title} | BretuneTech`,
      description,
      url: seo.canonical,
      siteName: 'BretuneTech',
      type: 'website',
      locale: 'en_ZA',
    },
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const { params, listing } = await loadProductsPage(await searchParams);
  const [categories, brands] = await Promise.all([getVisibleCategories(), getBrands()]);
  const clientParams = Object.fromEntries(
    new URLSearchParams(listingQuery(params)).entries(),
  ) as Record<string, string>;

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsClient
            initialProducts={listing.products}
            initialPagination={listing.pagination}
            categories={categories}
            brands={brands}
            searchParams={clientParams}
          />
        </Suspense>
      </div>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="h-9 w-48 rounded-lg bg-gray-200" />
          <div className="h-4 w-72 rounded bg-gray-200" />
        </div>
        <div className="hidden h-10 w-full max-w-xl rounded-lg bg-gray-200 lg:block" />
      </div>
      <div className="mb-6 h-11 w-full rounded-xl bg-gray-200" />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-md border border-gray-200 bg-white md:rounded-xl">
            <div className="aspect-square bg-gray-100 md:aspect-[4/3]" />
            <div className="space-y-1.5 p-2 md:space-y-2.5 md:p-4">
              <div className="hidden h-3 w-16 rounded bg-gray-100 md:block" />
              <div className="h-4 w-full rounded bg-gray-100" />
              <div className="h-3 w-20 rounded bg-gray-100 md:hidden" />
              <div className="h-4 w-2/3 rounded bg-gray-100" />
              <div className="mt-1 h-5 w-20 rounded bg-gray-100 md:h-6 md:w-24" />
              <div className="hidden h-10 w-full rounded bg-gray-100 md:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
