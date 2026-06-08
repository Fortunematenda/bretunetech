'use client';

import { BadgeCheck, ShieldCheck, Truck, Wrench, Award, Building2 } from 'lucide-react';

const trustItems = [
  {
    icon: BadgeCheck,
    title: 'Official Ubiquiti Partner',
    description: 'Authorized distributor with certified products'
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Safe and encrypted payment processing'
  },
  {
    icon: Truck,
    title: 'Fast Nationwide Delivery',
    description: 'Reliable shipping across South Africa'
  },
  {
    icon: Wrench,
    title: 'Professional Installation',
    description: 'Expert setup and configuration services'
  },
  {
    icon: Award,
    title: 'Warranty Support',
    description: 'Comprehensive warranty on all products'
  },
  {
    icon: Building2,
    title: 'Enterprise Solutions',
    description: 'Scalable solutions for businesses of all sizes'
  }
];

export default function TrustIndicators() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Why Choose Us</h2>
          <p className="text-gray-600">Trusted by businesses across South Africa</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm p-6 border border-gray-200 hover:border-[#003d7a]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Glassmorphism effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>

                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#003d7a] to-[#0055a4] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
