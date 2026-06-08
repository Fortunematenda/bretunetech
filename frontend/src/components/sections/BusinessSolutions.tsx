'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Wifi, Camera, Cable, Zap, Radio, GraduationCap } from 'lucide-react';

const solutions = [
  {
    title: 'Office WiFi Solutions',
    description: 'High-performance wireless networks for modern offices with seamless roaming and enterprise-grade security.',
    icon: Wifi,
    gradient: 'from-blue-600 to-blue-800',
    link: '/products?category=internet-networking'
  },
  {
    title: 'CCTV Security Systems',
    description: 'Professional surveillance solutions with remote monitoring, motion detection, and cloud storage.',
    icon: Camera,
    gradient: 'from-red-600 to-red-800',
    link: '/products?category=cameras'
  },
  {
    title: 'Fibre Infrastructure',
    description: 'End-to-end fibre networking solutions from backbone to last-mile connectivity for reliable high-speed internet.',
    icon: Cable,
    gradient: 'from-cyan-600 to-cyan-800',
    link: '/products?category=internet-networking'
  },
  {
    title: 'Backup Power Solutions',
    description: 'Uninterruptible power supplies, inverters, and battery systems to keep your business running during outages.',
    icon: Zap,
    gradient: 'from-orange-500 to-yellow-600',
    link: '/products?category=power-solutions'
  },
  {
    title: 'WISP Solutions',
    description: 'Complete wireless ISP infrastructure including towers, antennas, and management systems for service providers.',
    icon: Radio,
    gradient: 'from-purple-600 to-purple-800',
    link: '/products?category=internet-networking'
  },
  {
    title: 'School & Campus Networks',
    description: 'Scalable networking solutions designed for educational institutions with user management and content filtering.',
    icon: GraduationCap,
    gradient: 'from-green-600 to-green-800',
    link: '/products?category=internet-networking'
  }
];

const BusinessSolutions = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Business Solutions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive networking, security, and power solutions tailored for businesses of all sizes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <Link
                key={index}
                href={solution.link}
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-[#003d7a]/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Gradient banner */}
                <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${solution.gradient} flex items-center justify-center`}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)' }} />
                  <Icon className="w-24 h-24 text-white/10 absolute" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#003d7a] transition-colors">
                    {solution.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {solution.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#003d7a] group-hover:gap-3 transition-all">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BusinessSolutions;
