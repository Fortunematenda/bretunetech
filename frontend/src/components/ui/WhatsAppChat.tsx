'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, X, Wifi, Cable, Camera, Router, Headset, Wrench, FileText } from 'lucide-react';
import { brand, serviceCatalog } from '@/lib/brand';

const serviceIcons: Record<string, any> = {
  'wifi-installations': Wifi,
  'fibre-installations': Cable,
  'cctv-setup': Camera,
  'mikrotik-configuration': Router,
  'remote-support': Headset,
  'network-troubleshooting': Wrench,
};

const serviceMessages: Record<string, string> = {
  'wifi-installations': "Hi Bretunetech! I'd like a quote for a Wi-Fi installation.",
  'fibre-installations': "Hi Bretunetech! I'd like a quote for a fibre installation.",
  'cctv-setup': "Hi Bretunetech! I'd like a quote for a CCTV setup.",
  'mikrotik-configuration': "Hi Bretunetech! I'd like a quote for MikroTik configuration.",
  'remote-support': "Hi Bretunetech! I need remote support assistance.",
  'network-troubleshooting': "Hi Bretunetech! I need help with network troubleshooting.",
};

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-lg shadow-green-600/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Bretunetech</p>
                <p className="text-green-100 text-xs">Reply within 1 hour</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-gray-50 space-y-3">
            {/* Greeting */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <p className="text-gray-700 text-sm">Hi! 👋 What can we help you with today?</p>
            </div>

            {/* General chat */}
            <a
              href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent('Hi Bretunetech! I have a question.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full px-3 py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" /> General Enquiry
            </a>

            {/* Service shortcuts */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">Quick Quote by Service</p>
              {serviceCatalog.map((svc) => {
                const Icon = serviceIcons[svc.slug] ?? Wifi;
                return (
                  <a
                    key={svc.slug}
                    href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(serviceMessages[svc.slug] || "Hi Bretunetech!")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0 group"
                  >
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-green-600 shrink-0" />
                    <span className="text-xs text-gray-700 group-hover:text-green-700">{svc.name}</span>
                    <MessageCircle className="w-3 h-3 text-gray-300 group-hover:text-green-500 ml-auto shrink-0" />
                  </a>
                );
              })}
            </div>

            {/* Quote form link */}
            <Link
              href="/quote"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-[#003d7a] hover:bg-[#0056b3] text-white font-semibold rounded-xl transition-colors text-sm"
            >
              <FileText className="w-4 h-4" /> Submit a Quote Request
            </Link>
          </div>

          <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 text-center">
            <p className="text-gray-400 text-xs">Powered by WhatsApp · {brand.phone}</p>
          </div>
        </div>
      )}
    </>
  );
}
