import type { Metadata } from 'next';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { fetchBrandsList } from '@/lib/server-api';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Networking and CCTV Brands',
  description:
    'Shop MikroTik, Ubiquiti, Reyee, Ruijie, Hikvision, and other networking and CCTV brands stocked by BretuneTech.',
  path: '/brands',
});

export default async function BrandsPage() {
  const brands = await fetchBrandsList();

  return (
    <div className="w-full px-4 sm:px-6 py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm text-blue-600 font-medium mb-4">
          <Package className="w-4 h-4" /> Our Partners
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Featured Brands</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Browse networking, Wi-Fi, and CCTV brands. Each brand page links to the products currently published in the store.
        </p>
      </div>

      {brands.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No brands available yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {brands.map((brand) => (
            <Link
              key={brand.id || brand.slug}
              href={`/brands/${brand.slug}`}
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition-all"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#003d7a] transition-colors">
                {brand.name}
              </h2>
              <p className="text-gray-500 text-sm">
                {brand.description || `Shop ${brand.name} products at BretuneTech.`}
              </p>
              <div className="mt-4 text-[#003d7a] text-sm font-medium">View products</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
