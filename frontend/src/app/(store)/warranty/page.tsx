'use client';

import { Shield, CheckCircle, Clock, Phone } from 'lucide-react';
import { brand } from '@/lib/brand';

export default function WarrantyPage() {
  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-sm text-green-600 font-medium mb-4">
          <Shield className="w-4 h-4" /> Warranty Information
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Product Warranty</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          All our products come with comprehensive warranty coverage for your peace of mind.
        </p>
      </div>

      {/* Warranty Details */}
      <div className="space-y-8">
        {/* New Products */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900">New Products</h2>
          </div>
          <p className="text-gray-600 mb-4">
            All new products come with a standard 12-month warranty covering manufacturer defects.
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              12 months warranty on all new items
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Covers manufacturer defects only
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Free replacement or repair
            </li>
          </ul>
        </div>

        {/* Refurbished Products */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900">Refurbished Products</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Our refurbished products come with a 3-month warranty, giving you confidence in your purchase.
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              3 months warranty on refurbished items
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              All refurbished items tested and certified
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              Repair or replacement guarantee
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-[#003d7a] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-6 h-6" />
            <h2 className="text-xl font-bold">Need Help?</h2>
          </div>
          <p className="text-blue-100 mb-4">
            Contact our support team for warranty claims or inquiries.
          </p>
          <div className="space-y-2 text-sm">
            <p>Email: {brand.emailSupport}</p>
            <p>Phone / WhatsApp: {brand.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
