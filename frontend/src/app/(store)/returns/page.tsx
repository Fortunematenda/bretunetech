'use client';

import { RefreshCcw, CheckCircle, XCircle, Clock, Phone } from 'lucide-react';
import { brand } from '@/lib/brand';

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
          We want you to be fully satisfied with your purchase. Here&apos;s how returns, repairs, and refunds work.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-[#003d7a]" />
            <h2 className="text-xl font-bold text-gray-900">Return Window</h2>
          </div>
          <p className="text-gray-600 mb-4">
            You may request a return within <strong>7 days</strong> of delivery for unused items in their original,
            undamaged packaging. Faulty items are covered under our warranty policy for the applicable warranty period.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900">Eligible for Return</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Unused items in original packaging with all accessories</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Faulty or defective products (covered by warranty)</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Incorrect item delivered</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">Not Eligible for Return</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Items damaged through misuse or incorrect installation</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Products with broken seals where stated (e.g. licensed software)</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Special-order or custom-configured items</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to Request a Return</h2>
          <ol className="space-y-3 text-sm text-gray-600 list-decimal list-inside">
            <li>Contact us within the return window with your order number and reason for return.</li>
            <li>We&apos;ll confirm eligibility and provide return instructions.</li>
            <li>Once we receive and inspect the item, we&apos;ll process a refund, replacement, or repair.</li>
          </ol>
          <p className="text-gray-500 text-sm mt-4">
            Approved refunds are processed to your original payment method within 7&ndash;14 business days.
            This policy operates alongside your rights under the South African Consumer Protection Act (CPA).
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
            <p>Email: {brand.emailSupport}</p>
            <p>Phone / WhatsApp: {brand.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
