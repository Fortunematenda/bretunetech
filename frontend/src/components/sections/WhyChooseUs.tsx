'use client';

import React from 'react';
import { Award, Truck, Shield, Wrench } from 'lucide-react';

const reasons = [
  {
    icon: Award,
    title: 'Enterprise Networking Experts',
    description: 'Professional advice and support for networking, CCTV, fibre and power solutions.',
  },
  {
    icon: Truck,
    title: 'Fast Nationwide Delivery',
    description: 'Reliable delivery across South Africa with tracking.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Protected and trusted online checkout with multiple payment options.',
  },
  {
    icon: Wrench,
    title: 'Professional Installation',
    description: 'Installation and deployment services available for all products.',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Why Choose Us</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#003d7a] to-[#0055a4] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{reason.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
