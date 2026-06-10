'use client';

import { FileText, Phone } from 'lucide-react';
import { brand } from '@/lib/brand';
import { COMPANY } from '@/lib/company';

const sections = [
  {
    title: 'Acceptance of Terms',
    body: `By accessing or using ${COMPANY.brandName}, you agree to these Terms of Service.`,
  },
  {
    title: 'Products and Pricing',
    body: 'All prices displayed are in South African Rand (ZAR).\n\nPrices, product availability and specifications may change without notice.',
  },
  {
    title: 'Orders',
    body: 'All orders are subject to stock availability and acceptance.\n\n' + `${COMPANY.brandName} reserves the right to cancel or refuse orders where necessary.`,
  },
  {
    title: 'Payments',
    body: 'Orders will only be processed once payment has been successfully received and verified.',
  },
  {
    title: 'Product Information',
    body: 'We make reasonable efforts to ensure product descriptions, specifications and images are accurate. However, errors may occasionally occur.',
  },
  {
    title: 'Limitation of Liability',
    body: `${COMPANY.brandName} shall not be liable for indirect or consequential losses arising from the use of products purchased through the website.`,
  },
  {
    title: 'Governing Law',
    body: 'These Terms are governed by the laws of South Africa.',
  },
  {
    title: 'Changes',
    body: 'We reserve the right to modify these Terms at any time.',
  },
];

export default function TermsPage() {
  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#003d7a]/10 border border-[#003d7a]/30 rounded-full text-sm text-[#003d7a] font-medium mb-4">
          <FileText className="w-4 h-4" /> Legal
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Last Updated: June 2026
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((s) => (
          <div key={s.title} className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{s.body}</p>
          </div>
        ))}

        <div className="bg-[#003d7a] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-6 h-6" />
            <h2 className="text-xl font-bold">Questions?</h2>
          </div>
          <p className="text-blue-100 mb-4">Contact us about these terms.</p>
          <div className="space-y-2 text-sm">
            <p>Email: {COMPANY.supportEmail}</p>
            <p>Website: {COMPANY.website}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
