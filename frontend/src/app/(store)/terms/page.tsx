'use client';

import { FileText, Phone } from 'lucide-react';
import { brand } from '@/lib/brand';

const sections = [
  {
    title: 'Acceptance of Terms',
    body: `By accessing or using ${brand.website} you agree to these Terms of Service. If you do not agree, please do not use the website.`,
  },
  {
    title: 'Products & Pricing',
    body: 'We aim to keep product descriptions, specifications, and prices accurate. Prices are shown in South African Rand (ZAR) and include VAT where applicable. We reserve the right to correct errors and to change prices without prior notice. Stock availability is not guaranteed until an order is confirmed.',
  },
  {
    title: 'Orders',
    body: 'When you place an order, you make an offer to purchase. We may accept or decline an order, for example where an item is out of stock or a pricing error has occurred. A contract of sale is formed once we confirm and accept your order.',
  },
  {
    title: 'Payment',
    body: 'We accept the payment methods displayed at checkout (such as EFT and WhatsApp order). Orders are dispatched once payment has been received and cleared.',
  },
  {
    title: 'Delivery',
    body: 'Delivery timeframes are estimates and may vary. Risk in the goods passes to you on delivery. Please inspect items on receipt and report any issues promptly.',
  },
  {
    title: 'Warranty & Returns',
    body: 'Products are covered by the warranty stated on the relevant product page or our Warranty page. Returns and refunds are handled in accordance with our Returns & Refunds Policy and the Consumer Protection Act.',
  },
  {
    title: 'Limitation of Liability',
    body: `To the extent permitted by law, ${brand.fullName} is not liable for indirect or consequential loss arising from the use of our products or website. Nothing in these terms limits rights you have under applicable consumer law.`,
  },
  {
    title: 'Governing Law',
    body: 'These Terms are governed by the laws of the Republic of South Africa, and any disputes are subject to the jurisdiction of South African courts.',
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
          The terms that govern your use of {brand.website} and purchases from {brand.fullName}.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((s) => (
          <div key={s.title} className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{s.body}</p>
          </div>
        ))}

        <div className="bg-[#003d7a] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-6 h-6" />
            <h2 className="text-xl font-bold">Questions?</h2>
          </div>
          <p className="text-blue-100 mb-4">Contact us about these terms.</p>
          <div className="space-y-2 text-sm">
            <p>Email: {brand.emailSales}</p>
            <p>Phone / WhatsApp: {brand.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
