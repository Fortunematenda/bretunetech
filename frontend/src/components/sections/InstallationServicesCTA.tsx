'use client';

import React from 'react';
import Link from 'next/link';
import { Wrench, CheckCircle, Phone } from 'lucide-react';

const services = [
  'Network installation & configuration',
  'CCTV system setup & commissioning',
  'UPS & backup power installation',
  'Fibre & structured cabling',
  'WiFi coverage surveys & deployment',
  'On-site technical support',
];

const InstallationServicesCTA = () => {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#003d7a] to-[#0055a4]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Wrench className="w-3.5 h-3.5" /> Professional Services
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
              Need Professional Installation?
            </h2>
            <p className="text-blue-100 text-base mb-6 leading-relaxed">
              Our certified technicians provide end-to-end installation and commissioning services across South Africa. From planning to deployment — we've got you covered.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="https://wa.me/27612685933" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-[#003d7a] text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors">
                <Phone className="w-4 h-4" /> WhatsApp Us
              </a>
              <Link href="/contact"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/30 text-white text-sm font-semibold rounded-lg hover:bg-white/20 transition-colors">
                Get a Quote
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((service, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-white/10 rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-blue-200 mt-0.5 shrink-0" />
                <span className="text-sm text-white/90 leading-snug">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstallationServicesCTA;
