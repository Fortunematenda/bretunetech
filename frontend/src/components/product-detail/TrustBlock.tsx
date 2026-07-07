'use client';

import { Truck, ShieldCheck, Headphones, Wrench, Lock, Award } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: Truck, title: 'Fast Dispatch', description: 'CPT, JHB & DBN' },
  { icon: ShieldCheck, title: 'Warranty Included', description: 'Local support' },
  { icon: Headphones, title: 'Technical Support', description: 'Expert advice' },
  { icon: Wrench, title: 'Installation Services', description: 'On request' },
  { icon: Lock, title: 'Secure Checkout', description: 'SSL encrypted' },
  { icon: Award, title: 'BretuneTech Certified', description: 'Quality checked' },
];

export default function TrustBlock({ getShippingText }: { getShippingText?: () => string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {TRUST_ITEMS.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e6f0ff] flex items-center justify-center shrink-0">
              <item.icon className="w-5 h-5 text-[#003d7a]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">{item.title}</p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                {item.title === 'Fast Dispatch' && getShippingText ? getShippingText() : item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
