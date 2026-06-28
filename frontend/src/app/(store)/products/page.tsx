import { Suspense } from 'react';
import Link from 'next/link';
import { Wifi, Camera, Cable, Router, Zap, Package } from 'lucide-react';
import Container from '@/components/layout/Container';
import ProductsClient from './ProductsClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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

const categoryLinks = [
  { name: 'CCTV Cameras', slug: 'cctv-cameras', icon: Camera },
  { name: 'Networking', slug: 'networking', icon: Cable },
  { name: 'WiFi Routers', slug: 'wifi-routers', icon: Wifi },
  { name: 'Access Points', slug: 'access-points', icon: Router },
  { name: 'Switches', slug: 'switches', icon: Cable },
  { name: 'Cables', slug: 'cables', icon: Cable },
  { name: 'Power Backup', slug: 'power-backup', icon: Zap },
  { name: 'Bundles', slug: 'bundles', icon: Package },
];

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
          
          {/* Category Links */}
          <div className="flex flex-wrap gap-3 mt-4">
            {categoryLinks.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-[#003d7a]/10 border border-gray-200 hover:border-[#003d7a]/30 rounded-lg text-sm text-gray-700 hover:text-[#003d7a] transition-colors"
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
