'use client';

import Link from 'next/link';
import { 
  Wifi, 
  Zap, 
  Laptop, 
  Plug, 
  Sun, 
  Server,
  Camera,
  Battery
} from 'lucide-react';

const categories = [
  { name: 'Wireless', icon: Wifi, slug: 'internet-networking', count: 45 },
  { name: 'Fibre', icon: Zap, slug: 'internet-networking', count: 23 },
  { name: 'CCTV', icon: Camera, slug: 'accessories', count: 18 },
  { name: 'UPS', icon: Battery, slug: 'power-solutions', count: 12 },
  { name: 'Networking', icon: Server, slug: 'internet-networking', count: 67 },
  { name: 'Solar', icon: Sun, slug: 'power-solutions', count: 15 },
  { name: 'Laptops', icon: Laptop, slug: 'technology', count: 8 },
  { name: 'Accessories', icon: Plug, slug: 'accessories', count: 34 },
];

export default function CategoriesWithIcons() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-[#003d7a] hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-[#003d7a] group-hover:to-[#0055a4] transition-all duration-300">
                <cat.icon className="w-6 h-6 text-[#003d7a] group-hover:text-white transition-colors" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#003d7a] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500">{cat.count} products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
