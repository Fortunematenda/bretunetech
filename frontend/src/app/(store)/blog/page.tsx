import type { Metadata } from 'next';
import Link from 'next/link';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Blog',
  description:
    'BretuneTech blog — tech tips and product updates. Content coming soon; browse products and services in the meantime.',
  path: '/blog',
  noIndex: true,
});

export default function BlogPage() {
  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-600 font-medium mb-4">
          Blog
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Latest News & Updates</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Our blog is under construction. For networking products, installations, and quotes, use the links below.
        </p>
      </div>

      <article className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-gray-600 text-sm">
          We are preparing articles on Wi-Fi, CCTV, load shedding backup, and enterprise networking for South African
          businesses. Check back later, or explore our store and services now.
        </p>
      </article>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/products"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#003d7a] text-white text-sm font-semibold hover:bg-[#0056b3] transition-colors"
        >
          Browse Products
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:border-[#003d7a] hover:text-[#003d7a] transition-colors"
        >
          View Services
        </Link>
      </div>
    </div>
  );
}
