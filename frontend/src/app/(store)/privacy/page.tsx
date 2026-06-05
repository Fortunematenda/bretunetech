'use client';

import { Lock, Phone } from 'lucide-react';
import { brand } from '@/lib/brand';

const sections = [
  {
    title: 'Information We Collect',
    body: 'We collect information you provide when creating an account, placing an order, or contacting us — including your name, email address, phone number, delivery address, and order details. We also collect limited technical data such as your IP address and browser type to operate and secure the website.',
  },
  {
    title: 'How We Use Your Information',
    body: 'We use your information to process orders, arrange delivery, provide customer support, send order updates, and (where you consent) share promotions. We do not sell your personal information to third parties.',
  },
  {
    title: 'Sharing of Information',
    body: 'We share information only with service providers necessary to fulfil your order — such as couriers and payment processors — and where required by law. These parties are bound to protect your data.',
  },
  {
    title: 'Data Security',
    body: 'We apply reasonable technical and organisational measures to protect your personal information against unauthorised access, loss, or misuse. No method of transmission over the internet is completely secure, but we work to safeguard your data.',
  },
  {
    title: 'Your Rights (POPIA)',
    body: 'In line with the Protection of Personal Information Act (POPIA), you may request access to, correction of, or deletion of your personal information, and you may object to processing. Contact us to exercise these rights.',
  },
  {
    title: 'Cookies',
    body: 'We use cookies and similar technologies to keep you signed in, remember your cart, and improve your browsing experience. You can control cookies through your browser settings.',
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
          How {brand.fullName} collects, uses, and protects your personal information.
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
            <h2 className="text-xl font-bold">Privacy Questions?</h2>
          </div>
          <p className="text-blue-100 mb-4">Contact us about your data or this policy.</p>
          <div className="space-y-2 text-sm">
            <p>Email: {brand.emailSupport}</p>
            <p>Phone / WhatsApp: {brand.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
