'use client';

import { BadgeCheck, ShieldCheck, Truck, Wrench } from 'lucide-react';

const trustItems = [
  { icon: BadgeCheck, text: 'Official Ubiquiti Partner' },
  { icon: ShieldCheck, text: 'Secure Payments' },
  { icon: Truck, text: 'Fast Nationwide Delivery' },
  { icon: Wrench, text: 'Professional Installation' },
];

export default function TrustIndicators() {
  return (
    <div className="bg-gray-50 border-y border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-6 md:gap-12 md:justify-center min-w-max md:min-w-0">
          {trustItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap shrink-0">
              <item.icon className="w-4 h-4 md:w-5 md:h-5 text-[#003d7a] shrink-0" />
              <span className="font-medium text-xs md:text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
