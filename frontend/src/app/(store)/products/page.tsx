import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Wifi, Camera, Cable, Router, Zap, Package, Network, Monitor, HardDrive, Globe } from 'lucide-react';
import Container from '@/components/layout/Container';
import ProductsClient from './ProductsClient';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchProducts(params: Record<string, string> = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/products?${queryString}`, { cache: 'no-store' });
    if (!res.ok) return { products: [], pagination: { total: 0, pages: 1 } };
    return await res.json();
  } catch {
    return { products: [], pagination: { total: 0, pages: 1 } };
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchBrands() {
  try {
    const res = await fetch(`${API_URL}/brands`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { category?: string; brand?: string; search?: string; page?: string };
}): Promise<Metadata> {
  const SITE_URL = 'https://bretunetech.com';
  const base = `${SITE_URL}/products`;

  const category = searchParams.category;
  const brand = searchParams.brand;
  const search = searchParams.search;

  let title = 'Products | Bretunetech';
  let description = 'Browse enterprise networking equipment, power solutions, computing products, and IT infrastructure from trusted brands. Free delivery on qualifying orders.';

  if (category) {
    const name = category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    title = `${name} Products | Bretunetech`;
    description = `Shop ${name} products at Bretunetech. Quality technology products with fast delivery across South Africa.`;
  } else if (brand) {
    const name = brand.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    title = `${name} Products | Bretunetech`;
    description = `Shop ${name} products at Bretunetech. Authorised supplier with nationwide delivery.`;
  } else if (search) {
    title = `Search: ${search} | Bretunetech`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: base,
    },
  };
}

function getCategoryIcon(slug: string, name: string) {
  const s = slug.toLowerCase();
  const n = name.toLowerCase();
  if (s.includes('cctv') || n.includes('cctv') || n.includes('camera')) return Camera;
  if (s.includes('wifi') || n.includes('wifi')) return Wifi;
  if (s.includes('router') || n.includes('router')) return Router;
  if (s.includes('switch') || n.includes('switch')) return Network;
  if (s.includes('access') || n.includes('access point')) return Globe;
  if (s.includes('cable') || n.includes('cable')) return Cable;
  if (s.includes('power') || n.includes('power') || n.includes('ups') || n.includes('backup')) return Zap;
  if (s.includes('bundle') || n.includes('bundle')) return Package;
  if (s.includes('network') || n.includes('network')) return Network;
  if (s.includes('computing') || n.includes('computing') || n.includes('laptop') || n.includes('computer')) return Monitor;
  if (s.includes('storage') || n.includes('storage')) return HardDrive;
  return Package;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string; search?: string; category?: string; brand?: string; sort?: string; discount?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const limit = parseInt(searchParams.limit || '15', 10);
  
  const [productsData, categories, brands] = await Promise.all([
    fetchProducts({
      page: String(page),
      limit: String(limit),
      search: searchParams.search || '',
      category: searchParams.category || '',
      brand: searchParams.brand || '',
      sort: searchParams.sort || '',
      discount: searchParams.discount || '',
    }),
    fetchCategories(),
    fetchBrands(),
  ]);

  return (
    <div className="py-8 bg-white min-h-screen">
      <Container>
        {/* Static SEO Content - Always rendered */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Networking, CCTV, WiFi & Technology Products
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-3xl">
            Shop networking, CCTV, WiFi, routers, access points, network switches, cables, cabinets, power solutions and technology products from BretuneTech in South Africa.
          </p>

          {/* Category Filter Pills - driven by real DB categories */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Link
              href="/products"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                !searchParams.category
                  ? 'bg-[#003d7a] border-[#003d7a] text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-[#003d7a]/10 hover:border-[#003d7a]/30 hover:text-[#003d7a]'
              }`}
            >
              All
            </Link>
            {categories.map((cat: any) => {
              const Icon = getCategoryIcon(cat.slug, cat.name);
              const isActive = searchParams.category === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#003d7a] border-[#003d7a] text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-[#003d7a]/10 hover:border-[#003d7a]/30 hover:text-[#003d7a]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Internal Links */}
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <Link href="/services" className="text-[#003d7a] hover:underline">Services</Link>
            <span className="text-gray-300">•</span>
            <Link href="/brands" className="text-[#003d7a] hover:underline">Brands</Link>
            <span className="text-gray-300">•</span>
            <Link href="/bundles" className="text-orange-600 hover:underline">Bundles</Link>
            <span className="text-gray-300">•</span>
            <Link href="/quote" className="text-[#003d7a] hover:underline">Get a Quote</Link>
            <span className="text-gray-300">•</span>
            <Link href="/contact" className="text-[#003d7a] hover:underline">Contact</Link>
          </div>
        </div>

        {/* Client Component for Interactive Features */}
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsClient
            initialProducts={productsData.products || []}
            initialPagination={productsData.pagination || { total: 0, pages: 1 }}
            categories={categories}
            brands={brands}
            searchParams={searchParams}
          />
        </Suspense>
      </Container>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="flex gap-8">
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-9 bg-gray-200 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2.5">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-6 w-24 mt-1 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
