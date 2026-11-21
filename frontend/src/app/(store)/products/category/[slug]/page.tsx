import { Suspense } from 'react';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { categoryPath, getCategorySeo } from '@/lib/category-seo';
import { generateBreadcrumbSchema } from '@/lib/seo';
import {
  categoryIndex,
  getAllCategories,
  getBrands,
  getProductsList,
  getVisibleCategories,
} from '@/lib/catalogue-data';
import {
  categoryListingUrl,
  hasSubsetFilters,
  isPageOutOfRange,
  listingSeo,
  parsePage,
  parsePageSize,
  resolveCategory,
  sanitiseListingParams,
  toApiQuery,
} from '@/lib/catalogue-routing';
import ProductsClient from '../../ProductsClient';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function loadCategoryPage(rawSlug: string, rawParams: Record<string, unknown>) {
  const index = categoryIndex(await getAllCategories());
  const resolution = resolveCategory(rawSlug, new Set(index.keys()));
  const params = sanitiseListingParams(rawParams);
  delete params.category;
  delete params.solution;

  if (resolution.kind === 'gone' || resolution.kind === 'missing') notFound();
  if (resolution.kind === 'redirect') permanentRedirect(categoryListingUrl(resolution.slug, params));

  const slug = resolution.slug;
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.limit);
  const listing = await getProductsList(toApiQuery(params, { category: slug }));
  const total = listing.pagination.total;
  if (isPageOutOfRange(page, total, pageSize)) notFound();

  const seo = getCategorySeo(slug, index.get(slug));
  const { canonical, robots } = listingSeo(categoryPath(slug), params, total);
  return { slug, params, page, listing, total, seo, canonical, robots };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { seo, page, canonical, robots } = await loadCategoryPage(slug, await searchParams);
  const baseTitle = seo.title.replace(/\s*\|\s*BretuneTech\s*$/i, '');
  const title = page > 1 ? `${baseTitle} – Page ${page} | BretuneTech` : seo.title;

  return {
    title: { absolute: title },
    description: seo.description,
    alternates: { canonical },
    robots,
    openGraph: {
      title,
      description: seo.description,
      url: canonical,
      siteName: 'BretuneTech',
      type: 'website',
      locale: 'en_ZA',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: seo.description,
    },
  };
}

export default async function CategoryProductsPage({ params, searchParams }: Props) {
  const { slug: rawSlug } = await params;
  const { slug, params: listingParams, listing, total, seo } = await loadCategoryPage(rawSlug, await searchParams);
  const [categories, brands] = await Promise.all([getVisibleCategories(), getBrands()]);

  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: seo.h1, url: seo.canonicalPath },
  ]);

  const intentionallyEmpty = total === 0 && !hasSubsetFilters(listingParams);

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
        {intentionallyEmpty ? (
          <EmptyCategory categories={categories} currentSlug={slug} />
        ) : (
          <Suspense fallback={null}>
            <ProductsClient
              initialProducts={listing.products}
              initialPagination={listing.pagination}
              categories={categories}
              brands={brands}
              searchParams={{ ...listingParams, category: slug }}
              listingBasePath={categoryPath(slug)}
              headingOverride={seo.h1}
              hideHeading
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}

/** Valid category with nothing published right now: say so plainly and point to live sections. */
function EmptyCategory({ categories, currentSlug }: { categories: any[]; currentSlug: string }) {
  const alternatives = categories
    .filter((c) => c?.slug && c.slug !== currentSlug && (c._count?.products ?? 0) > 0)
    .slice(0, 8);
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-gray-900">No products are listed in this category right now</h2>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        We are not currently selling items in this category online. You can browse the sections below,
        or ask us for a quote and we will tell you what we can supply.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {alternatives.map((c) => (
          <Link
            key={c.slug}
            href={categoryPath(c.slug)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#003d7a] hover:border-[#003d7a]"
          >
            {c.name}
          </Link>
        ))}
        <Link href="/products" className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#003d7a] hover:border-[#003d7a]">
          All products
        </Link>
        <Link href="/quote" className="rounded-lg bg-[#003d7a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0055a4]">
          Request a quote
        </Link>
      </div>
    </section>
  );
}
