'use client';

import { Truck, ShieldCheck, Headphones, Wrench, Lock, Award } from 'lucide-react';

const BENEFITS = [
  { icon: Truck, title: 'Fast Dispatch', description: 'Same-day dispatch from CPT, JHB & DBN.' },
  { icon: ShieldCheck, title: 'Warranty Included', description: 'Authorised products with local warranty.' },
  { icon: Headphones, title: 'Technical Support', description: 'Expert help before and after purchase.' },
  { icon: Wrench, title: 'Installation Services', description: 'Professional setup on request.' },
  { icon: Lock, title: 'Secure Checkout', description: 'SSL encrypted payment handling.' },
  { icon: Award, title: 'BretuneTech Certified', description: 'Quality-checked tech and networking gear.' },
];

export default function WhyBuyFromUs() {
  return (
    <aside className="hidden xl:block w-[220px] shrink-0">
      <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Why Buy From BretuneTech?</h3>
        <div className="space-y-3">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#e6f0ff] flex items-center justify-center shrink-0">
                <benefit.icon className="w-4 h-4 text-[#003d7a]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 leading-tight">{benefit.title}</p>
                <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
