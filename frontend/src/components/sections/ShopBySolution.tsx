'use client';

import React from 'react';
import Link from 'next/link';
import { Wifi, Camera, Zap, Network, Printer, Monitor } from 'lucide-react';

const solutions = [
  { title: 'Networking & WiFi', icon: Wifi, slug: 'networking', color: 'bg-blue-500', desc: 'Routers, switches, access points' },
  { title: 'CCTV & Security', icon: Camera, slug: 'cctv-security', color: 'bg-purple-500', desc: 'Cameras, NVRs, access control' },
  { title: 'Power & Backup', icon: Zap, slug: 'power-backup', color: 'bg-yellow-500', desc: 'UPS, inverters, batteries' },
  { title: 'Computers & Laptops', icon: Monitor, slug: 'computers-laptops', color: 'bg-cyan-500', desc: 'Desktops, laptops, mini PCs' },
  { title: 'Wireless Solutions', icon: Network, slug: 'wireless-solutions', color: 'bg-pink-500', desc: 'Outdoor links, antennas, bridges' },
  { title: 'Printers & Office', icon: Printer, slug: 'printers-office', color: 'bg-green-500', desc: 'Printers, scanners, ink & toner' },
];

const ShopBySolution = () => {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop by Solution</h2>
            <p className="text-sm text-gray-500 mt-0.5">Find products matched to your business need</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {solutions.map((sol) => {
            const Icon = sol.icon;
            return (
              <Link
                key={sol.slug}
                href={`/products?category=${sol.slug}`}
                className="group flex flex-col items-center text-center bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-12 h-12 ${sol.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
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
