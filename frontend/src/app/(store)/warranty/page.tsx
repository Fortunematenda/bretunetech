'use client';

import { Shield, CheckCircle, Clock, Phone } from 'lucide-react';
import { brand } from '@/lib/brand';
import { COMPANY } from '@/lib/company';

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
          All products sold through {COMPANY.brandName} include manufacturer warranty coverage for your peace of mind.
        </p>
      </div>

      {/* Warranty Details */}
      <div className="space-y-8">
        {/* Manufacturer Warranty */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900">Manufacturer Warranty</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Most products sold by {COMPANY.brandName} include a manufacturer warranty. Warranty periods vary depending on the manufacturer and product category.
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Warranty periods vary by product and manufacturer
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Covers manufacturer defects
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Replacement or repair based on manufacturer policy
            </li>
          </ul>
        </div>

        {/* Warranty Claims */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900">Warranty Claims</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Customers may be required to provide proof of purchase, product serial number, and description of the fault when making a warranty claim.
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              Proof of purchase required
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              Product serial number
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              Description of the fault
            </li>
          </ul>
        </div>

        {/* Warranty Exclusions */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">Warranty Exclusions</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Warranty coverage does not apply to physical damage, water damage, improper installation, misuse or negligence, or unauthorized modifications.
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              Physical damage
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              Water damage
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              Improper installation
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              Misuse or negligence
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              Unauthorized modifications
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
            <p>Email: {COMPANY.supportEmail}</p>
            <p>Website: {COMPANY.website}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
