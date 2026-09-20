import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ProductsClient from './ProductsClient';
import {
  fetchProductsList,
  fetchCategoriesList,
  fetchBrandsList,
} from '@/lib/server-api';
import {
  SITE_URL,
  categoryPath,
  getCategorySeo,
  listingHasExtraFilters,
} from '@/lib/category-seo';

type SearchParams = {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  solution?: string;
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
  featured?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const resolved = await searchParams;
  const category = resolved.category || resolved.solution || '';
  const brand = resolved.brand || '';
  const search = resolved.search || '';
  const hasFilters = listingHasExtraFilters(resolved) || Boolean(brand) || Boolean(search);

  let title = 'Products';
  let description =
    'Browse enterprise networking equipment, CCTV, Wi-Fi, and IT infrastructure from trusted brands. Free delivery on qualifying orders.';
  let canonical = `${SITE_URL}/products`;
  let noIndex = false;

  if (search) {
    title = `Search: ${search}`;
    description = `Search results for “${search}” at BretuneTech.`;
    noIndex = true;
    canonical = `${SITE_URL}/products`;
  } else if (category) {
    const seo = getCategorySeo(category);
    title = seo.title.replace(/\s*\|\s*BretuneTech\s*$/i, '');
    description = seo.description;
    canonical = `${SITE_URL}${seo.canonicalPath}`;
    noIndex = hasFilters;
  } else if (brand) {
    const name = brand.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    title = `${name} Products`;
    description = `Shop ${name} products at BretuneTech. Authorised supplier with nationwide delivery.`;
    canonical = `${SITE_URL}/products?brand=${encodeURIComponent(brand)}`;
    noIndex = listingHasExtraFilters({ ...resolved, brand: undefined });
  } else if (hasFilters) {
    noIndex = true;
  }

  return {
    title: noIndex || !title.includes('BretuneTech') ? title : { absolute: title },
    description,
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: /bretunetech/i.test(title) ? title : `${title} | BretuneTech`,
      description,
      url: canonical,
      siteName: 'BretuneTech',
      type: 'website',
      locale: 'en_ZA',
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = parseInt(resolvedParams.limit || '15', 10);
  const categorySlug = resolvedParams.category || resolvedParams.solution || '';

  // Clean indexable category URLs — redirect bare category queries.
  const hasNonCategoryFilters = listingHasExtraFilters({
    ...resolvedParams,
    category: undefined,
    solution: undefined,
    page: undefined,
  }) || Boolean(resolvedParams.brand) || Boolean(resolvedParams.search);

  if (categorySlug && !hasNonCategoryFilters && resolvedParams.category) {
    const dest =
      page > 1
        ? `${categoryPath(categorySlug)}?page=${page}`
        : categoryPath(categorySlug);
    redirect(dest);
  }
  if (categorySlug && !hasNonCategoryFilters && resolvedParams.solution && !resolvedParams.category) {
    redirect(page > 1 ? `${categoryPath(categorySlug)}?page=${page}` : categoryPath(categorySlug));
  }

  const [productsData, categories, brands] = await Promise.all([
    fetchProductsList({
      page: String(page),
      limit: String(limit),
      search: resolvedParams.search,
      category: categorySlug || undefined,
      brand: resolvedParams.brand,
      sort: resolvedParams.sort,
      discount: resolvedParams.discount,
      minPrice: resolvedParams.minPrice || resolvedParams.priceMin,
      maxPrice: resolvedParams.maxPrice || resolvedParams.priceMax,
      condition: resolvedParams.condition,
      bestSeller: resolvedParams.bestSeller,
      newArrivals: resolvedParams.newArrivals,
      inStock: resolvedParams.inStock,
      featured: resolvedParams.featured,
    }),
    fetchCategoriesList(),
    fetchBrandsList(),
  ]);

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsClient
            initialProducts={productsData.products || []}
            initialPagination={productsData.pagination || { total: 0, pages: 1 }}
            categories={categories}
            brands={brands}
            searchParams={resolvedParams}
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
