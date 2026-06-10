'use client';

import { RefreshCcw, CheckCircle, XCircle, Clock, Phone } from 'lucide-react';
import { brand } from '@/lib/brand';
import { COMPANY } from '@/lib/company';

export default function ReturnsPage() {
  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#003d7a]/10 border border-[#003d7a]/30 rounded-full text-sm text-[#003d7a] font-medium mb-4">
          <RefreshCcw className="w-4 h-4" /> Returns &amp; Refunds
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Returns &amp; Refunds Policy</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Last Updated: June 2026
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900">Return Eligibility</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Products may be returned within 7 days of delivery provided:
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> The product is unused</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> The product remains in its original packaging</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> All accessories and documentation are included</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900">Faulty Products</h2>
          </div>
          <p className="text-gray-600 mb-4">
            If a product arrives damaged, defective or faulty, customers should notify {COMPANY.brandName} as soon as possible.
          </p>
          <p className="text-gray-600 mb-4">
            Depending on the situation, we may:
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Replace the product</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Repair the product</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Provide a refund</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">Non-Returnable Items</h2>
          </div>
          <p className="text-gray-600 mb-4">
            The following items may not be eligible for return:
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Custom-order products</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Special-order items</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Software licences</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Products damaged through misuse</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Refund Processing</h2>
          <p className="text-gray-600">
            Approved refunds will be processed using the original payment method where possible.
          </p>
          <p className="text-gray-600 mt-2">
            Processing times may vary depending on the payment provider and banking institution.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-[#003d7a] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-6 h-6" />
            <h2 className="text-xl font-bold">Start a Return</h2>
          </div>
          <p className="text-blue-100 mb-4">Contact our support team to begin your return or refund request.</p>
          <div className="space-y-2 text-sm">
            <p>Email: {COMPANY.supportEmail}</p>
            <p>Website: {COMPANY.website}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
