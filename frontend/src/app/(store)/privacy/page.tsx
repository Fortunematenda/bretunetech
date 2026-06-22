'use client';

import { Lock, Phone } from 'lucide-react';
import { brand } from '@/lib/brand';
import { COMPANY } from '@/lib/company';

const sections = [
  {
    title: 'Introduction',
    body: `${COMPANY.brandName} respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store and protect your information when you visit our website or purchase products from us.

${COMPANY.brandName} is operated by ${COMPANY.legalName}, a registered company in South Africa.`,
  },
  {
    title: 'Information We Collect',
    body: 'We may collect:\n\n• Full name\n• Email address\n• Phone number\n• Billing address\n• Delivery address\n• Order history\n• Website usage information',
  },
  {
    title: 'How We Use Your Information',
    body: 'We use your information to:\n\n• Process and fulfil orders\n• Arrange deliveries\n• Provide customer support\n• Improve our products and services\n• Communicate important updates regarding your orders',
  },
  {
    title: 'Information Sharing',
    body: 'We may share information with:\n\n• Courier and logistics providers\n• Payment processors\n• Technology service providers\n\nWe do not sell or rent customer information to third parties.',
  },
  {
    title: 'Website Analytics',
    body: 'We may collect anonymized website analytics data to understand website usage, improve performance, and enhance customer experience. This includes page views, device type, browser information, and general traffic patterns. We do not store raw IP addresses — only hashed identifiers are used for analytics purposes.',
  },
  {
    title: 'Google Maps Services',
    body: 'We use Google Maps services to assist with address autocomplete, address validation, and delivery location accuracy. When you enter a delivery address, we may send your address to Google to verify its accuracy and obtain geographic coordinates. This helps us ensure accurate deliveries. We do not track your live location — only the delivery address you provide during checkout.',
  },
  {
    title: 'Data Security',
    body: 'We take reasonable technical and organisational measures to protect your information against unauthorized access, disclosure or misuse.',
  },
  {
    title: 'POPIA Compliance',
    body: `We process personal information in accordance with the Protection of Personal Information Act (POPIA) of South Africa.`,
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. Updates will be published on this page.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#003d7a]/10 border border-[#003d7a]/30 rounded-full text-sm text-[#003d7a] font-medium mb-4">
          <Lock className="w-4 h-4" /> Privacy
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
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
            <h2 className="text-xl font-bold">Privacy Questions?</h2>
          </div>
          <p className="text-blue-100 mb-4">Contact us about your data or this policy.</p>
          <div className="space-y-2 text-sm">
            <p>Email: {COMPANY.supportEmail}</p>
            <p>Website: {COMPANY.website}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
