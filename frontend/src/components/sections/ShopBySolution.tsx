'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wifi, Camera, Zap, Network, Printer, Monitor,
  Router, Shield, Radio, Cable, Server, Antenna,
  type LucideIcon,
} from 'lucide-react';
import {
  DEFAULT_SHOP_SOLUTIONS,
  fetchShopSolutions,
  type ShopSolutionIcon,
  type ShopSolutionItem,
} from '@/lib/solutions';

const ICON_MAP: Record<ShopSolutionIcon, LucideIcon> = {
  wifi: Wifi,
  camera: Camera,
  zap: Zap,
  network: Network,
  printer: Printer,
  monitor: Monitor,
  router: Router,
  shield: Shield,
  antenna: Antenna,
  cable: Cable,
  server: Server,
  radio: Radio,
};

const ShopBySolution = () => {
  const [sectionTitle, setSectionTitle] = useState(DEFAULT_SHOP_SOLUTIONS.sectionTitle);
  const [sectionSubtitle, setSectionSubtitle] = useState(DEFAULT_SHOP_SOLUTIONS.sectionSubtitle);
  const [items, setItems] = useState<ShopSolutionItem[]>(
    DEFAULT_SHOP_SOLUTIONS.items.filter((i) => i.enabled),
  );

  useEffect(() => {
    let cancelled = false;
    fetchShopSolutions().then((data) => {
      if (cancelled) return;
      setSectionTitle(data.sectionTitle);
      setSectionSubtitle(data.sectionSubtitle);
      setItems(data.items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!items.length) return null;

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{sectionTitle}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{sectionSubtitle}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((sol) => {
            const Icon = ICON_MAP[sol.icon] || Wifi;
            const color = sol.color || 'bg-blue-500';
            return (
              <Link
                key={sol.id || sol.slug}
                href={`/products?category=${encodeURIComponent(sol.slug)}`}
                className="group flex flex-col items-center text-center bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-tight mb-1">{sol.title}</p>
                <p className="text-xs text-gray-500 leading-snug">{sol.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShopBySolution;
