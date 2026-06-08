import Link from 'next/link';
import { ArrowRight, Wifi, Cable, Camera, Router, Headset, Wrench, Phone, MessageCircle, FileText } from 'lucide-react';
import { serviceCatalog, brand } from '@/lib/brand';

const serviceIcons = {
  'wifi-installations': Wifi,
  'fibre-installations': Cable,
  'cctv-setup': Camera,
  'mikrotik-configuration': Router,
  'remote-support': Headset,
  'network-troubleshooting': Wrench,
} as const;

const serviceMessages: Record<string, string> = {
  'wifi-installations': "Hi Bretunetech! I'd like a quote for a Wi-Fi installation.",
  'fibre-installations': "Hi Bretunetech! I'd like a quote for a fibre installation.",
  'cctv-setup': "Hi Bretunetech! I'd like a quote for a CCTV setup.",
  'mikrotik-configuration': "Hi Bretunetech! I'd like a quote for MikroTik configuration.",
  'remote-support': "Hi Bretunetech! I need remote support assistance.",
  'network-troubleshooting': "Hi Bretunetech! I need help with network troubleshooting.",
};

export default function ServicesPage() {
  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#003d7a]/10 border border-[#003d7a]/20 rounded-full text-sm text-[#003d7a] font-semibold mb-4">
          <Wifi className="w-4 h-4" /> Enterprise Services
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Network Services for South African Businesses</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Certified networking engineers for wireless rollouts, fibre installations, CCTV, MikroTik, and remote support.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {serviceCatalog.map((service) => {
          const Icon = serviceIcons[service.slug as keyof typeof serviceIcons] ?? Wifi;
          const waMsg = serviceMessages[service.slug] || "Hi Bretunetech! I'd like a quote.";
          return (
            <article
              key={service.slug}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-sm transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#003d7a]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#003d7a]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{service.name}</h2>
              </div>
              <p className="text-sm text-gray-600 flex-1 mb-4">{service.description}</p>
              <div className="flex gap-2 mt-auto flex-wrap">
                <Link
                  href={`/services/book?service=${service.slug}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#003d7a] hover:bg-[#0056b3] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> Book Now
                </Link>
                <Link
                  href={`/quote?service=${service.slug}`}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 hover:border-[#003d7a] text-gray-700 hover:text-[#003d7a] text-xs font-semibold rounded-lg transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> Get Quote
                </Link>
                <a
                  href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(waMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {/* CTA Card */}
      <div className="bg-[#003d7a] rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Phone className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-bold">Need a custom network deployment?</h2>
            </div>
            <p className="text-blue-100 text-sm">
              Talk to our engineering team for a tailored scope and fixed-price quote.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm transition-colors"
            >
              <FileText className="w-4 h-4" /> Request a Quote
            </Link>
            <a
              href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent("Hi Bretunetech! I need a custom network deployment quote.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
