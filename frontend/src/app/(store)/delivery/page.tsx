'use client';

import { Truck, Clock, MapPin, Package, AlertCircle, Phone } from 'lucide-react';
import { brand } from '@/lib/brand';
import { COMPANY } from '@/lib/company';

const sections = [
  {
    title: 'Delivery Coverage',
    body: `${COMPANY.brandName} delivers throughout South Africa.`,
  },
  {
    title: 'Processing Time',
    body: 'Orders are typically processed within 1–3 business days after payment confirmation.',
  },
  {
    title: 'Estimated Delivery Times',
    body: 'Major Cities: 1–3 Business Days\n\nRegional Areas: 2–5 Business Days\n\nRemote Areas: 3–7 Business Days\n\nDelivery times are estimates and may vary depending on supplier stock availability, courier operations and location.',
  },
  {
    title: 'Order Tracking',
    body: 'Customers will receive delivery updates and tracking information once an order has been dispatched.',
  },
  {
    title: 'Delivery Delays',
    body: 'While we strive to meet estimated delivery times, delays may occur due to factors beyond our control, including courier disruptions and supplier delays.',
  },
];

export default function DeliveryPage() {
  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-600 font-medium mb-4">
          <Truck className="w-4 h-4" /> Delivery Information
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Shipping & Delivery Policy</h1>
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

        {/* Contact */}
        <div className="bg-[#003d7a] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-6 h-6" />
            <h2 className="text-xl font-bold">Questions About Delivery?</h2>
          </div>
          <p className="text-blue-100 mb-4">If you have questions about delivery to your area, contact us.</p>
          <div className="space-y-2 text-sm">
            <p>Email: {COMPANY.supportEmail}</p>
            <p>Website: {COMPANY.website}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
