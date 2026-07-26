import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { ArrowRight, Wifi, Cable, Camera, Router, Headset, Wrench, Phone, MessageCircle, FileText } from 'lucide-react';
import { serviceCatalog, brand } from '@/lib/brand';
import { TrackedWhatsAppLink } from '@/components/analytics/TrackedLinks';

export const metadata: Metadata = generatePageMetadata({
  title: 'Network & IT Services in Cape Town',
  description:
    'Wi-Fi, fibre, CCTV, MikroTik, and remote support from BretuneTech. On-site work across Cape Town and the Western Cape, with remote help nationwide.',
  path: '/services',
});

const serviceIcons = {
  'wifi-installations': Wifi,
  'fibre-installations': Cable,
  'cctv-setup': Camera,
  'mikrotik-configuration': Router,
  'remote-support': Headset,
  'network-troubleshooting': Wrench,
} as const;

const serviceMessages: Record<string, string> = {
  'wifi-installations': "Hi BretuneTech! I'd like a quote for a Wi-Fi installation.",
  'fibre-installations': "Hi BretuneTech! I'd like a quote for a fibre installation.",
  'cctv-setup': "Hi BretuneTech! I'd like a quote for a CCTV setup.",
  'mikrotik-configuration': "Hi BretuneTech! I'd like a quote for MikroTik configuration.",
  'remote-support': "Hi BretuneTech! I need remote support assistance.",
  'network-troubleshooting': "Hi BretuneTech! I need help with network troubleshooting.",
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
        <p className="text-gray-500 max-w-2xl mx-auto">
          BretuneTech engineers plan, install, and support wireless, fibre, CCTV, and MikroTik networks. Primary on-site
          coverage is Cape Town and the Western Cape; remote support is available nationwide.
        </p>
      </div>

      <div className="mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6 text-sm text-gray-600 space-y-3">
        <p>
          Whether you need a single access point, a multi-building wireless design, or a MikroTik firewall hardened for
          dual-WAN failover, we scope the work clearly and quote before we start. Equipment can be supplied from our
          store or integrated with gear you already own.
        </p>
        <p>
          Book a visit for Cape Town metro sites, request a written quote for larger projects, or WhatsApp us for a quick
          feasibility check. We keep documentation practical so your team can operate the network after handover.
        </p>
        <p>
          <Link href="/services/areas/cape-town" className="font-semibold text-[#003d7a] hover:underline">
            Cape Town service area details →
          </Link>
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {serviceCatalog.map((service) => {
          const Icon = serviceIcons[service.slug as keyof typeof serviceIcons] ?? Wifi;
          const waMsg = serviceMessages[service.slug] || "Hi BretuneTech! I'd like a quote.";
          return (
            <article
              key={service.slug}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-sm transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#003d7a]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#003d7a]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  <Link href={`/services/${service.slug}`} className="hover:text-[#003d7a]">
                    {service.name}
                  </Link>
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
              <p className="text-xs text-gray-500 mb-1">
                <span className="font-semibold text-gray-700">Who it&apos;s for: </span>
                {service.audience}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                <span className="font-semibold text-gray-700">Process: </span>
                {service.process}
              </p>
              <div className="flex gap-2 mt-auto flex-wrap">
                <Link
                  href={`/services/${service.slug}`}
                  className="flex items-center gap-1.5 px-3 py-2 border border-[#003d7a] text-[#003d7a] hover:bg-[#003d7a]/5 text-xs font-semibold rounded-lg transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" /> Learn more
                </Link>
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
                <TrackedWhatsAppLink
                  location={`services_hub_${service.slug}`}
                  href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(waMsg)}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </TrackedWhatsAppLink>
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
            <TrackedWhatsAppLink
              location="services_hub_cta"
              href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent("Hi BretuneTech! I need a custom network deployment quote.")}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp Us
            </TrackedWhatsAppLink>
          </div>
        </div>
      </div>
    </div>
  );
}
