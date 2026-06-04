'use client';

import React from 'react';
import Link from 'next/link';
import { Wifi, Building2, Cable, Camera, BatteryCharging, GraduationCap, ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const solutions = [
  {
    icon: Wifi,
    title: 'WISP Solutions',
    description: 'Complete wireless internet service provider equipment and setup',
    href: '/products?category=internet-networking',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Building2,
    title: 'Office Networking',
    description: 'Enterprise-grade switches, routers and access points',
    href: '/products?category=internet-networking',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: Cable,
    title: 'Fibre Installations',
    description: 'Fibre optic equipment and professional installation services',
    href: '/services',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: Camera,
    title: 'CCTV Systems',
    description: 'Security cameras and surveillance solutions for business',
    href: '/services',
    color: 'from-slate-500 to-slate-600',
  },
  {
    icon: BatteryCharging,
    title: 'Backup Power',
    description: 'UPS systems, batteries and solar solutions',
    href: '/products?category=power-solutions',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: GraduationCap,
    title: 'School Wi-Fi',
    description: 'Reliable campus-wide wireless networking solutions',
    href: '/services',
    color: 'from-orange-500 to-orange-600',
  },
];

export default function Solutions() {
  const ref = useScrollAnimation();

  return (
    <section className="py-16 bg-white" ref={ref as React.RefObject<HTMLElement>}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Enterprise Solutions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tailored networking and technology solutions for businesses of all sizes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((solution, i) => (
            <Link
              key={solution.title}
              href={solution.href}
              className={`group relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-on-scroll animate-delay-${i + 1}`}
            >
              {/* Hover background fill */}
              <div className={`absolute inset-0 bg-gradient-to-br ${solution.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${solution.color} group-hover:w-1.5 transition-all duration-300`} />
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${solution.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <solution.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#003d7a] transition-colors">
                    {solution.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{solution.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[#003d7a] group-hover:gap-2 transition-all duration-200">
                    Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
