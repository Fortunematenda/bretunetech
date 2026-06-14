import React from 'react';
import { Building2, Shield, Truck, Headphones, Cpu, CheckCircle } from 'lucide-react';

const trustCards = [
  {
    icon: Building2,
    title: 'Registered South African Company',
    description: 'Bretune Technologies (Pty) Ltd',
    detail: 'Registration Number: 2025/545182/07',
  },
  {
    icon: Shield,
    title: 'Supplier Backed Products',
    description: 'Products sourced through established technology distributors and suppliers.',
  },
  {
    icon: Cpu,
    title: 'Secure Online Ordering',
    description: 'Customer information protected and processed securely.',
  },
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    description: 'Delivery available throughout South Africa.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Customer Support',
    description: 'Assistance before and after purchase.',
  },
  {
    icon: Cpu,
    title: 'Technology Specialists',
    description: 'Networking, CCTV, Fibre and Backup Power Solutions.',
  },
];

export default function TrustCenter() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#003d7a]/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#003d7a]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-[#003d7a]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{card.description}</p>
                    {card.detail && (
                      <p className="text-xs text-gray-500 font-medium">{card.detail}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
