import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, MessageCircle, FileText, Phone } from 'lucide-react';
import { brand } from '@/lib/brand';
import { generateBreadcrumbSchema, generatePageMetadata } from '@/lib/seo';
import { serviceLandings } from '@/lib/service-landings';
import { TrackedPhoneLink, TrackedWhatsAppLink } from '@/components/analytics/TrackedLinks';

export const metadata: Metadata = generatePageMetadata({
  title: 'Network Services in Cape Town',
  description:
    'BretuneTech on-site network services across Cape Town and the Western Cape — Wi-Fi, fibre, CCTV, MikroTik, and troubleshooting. Remote support nationwide.',
  path: '/services/areas/cape-town',
});

const suburbs = [
  'Cape Town CBD',
  'Sea Point & Atlantic Seaboard',
  'Southern Suburbs (Claremont, Rondebosch, Wynberg)',
  'Northern Suburbs (Bellville, Durbanville, Brackenfell)',
  'Century City & surrounds',
  'Stellenbosch & Somerset West (by arrangement)',
  'Industrial nodes (Epping, Montague Gardens, Airport Industria)',
];

export default function CapeTownServiceAreaPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: 'Cape Town', url: '/services/areas/cape-town' },
  ]);

  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#003d7a]/10 border border-[#003d7a]/20 rounded-full text-sm text-[#003d7a] font-semibold mb-4">
        <MapPin className="w-4 h-4" /> Service area
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
        Network Services in Cape Town
      </h1>
      <p className="text-gray-600 text-base sm:text-lg mb-8">
        BretuneTech is based in {brand.location}. We provide on-site installations and diagnostics across
        the Cape Town metro and wider Western Cape, with remote support available nationwide.
      </p>

      <section className="mb-10 space-y-4 text-sm sm:text-base text-gray-600">
        <p>
          Response expectations depend on suburb, job type, and parts availability. Same-week visits are
          common for Cape Town metro surveys and small installs when diaries allow; larger projects are
          scheduled after a written scope and quote.
        </p>
        <p>
          We do not publish a street-level storefront address for walk-ins. Contact us by phone, email, or
          WhatsApp to book a site visit. Product orders ship across South Africa from our ecommerce store.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Areas we commonly serve</h2>
        <ul className="grid sm:grid-cols-2 gap-2">
          {suburbs.map((name) => (
            <li
              key={name}
              className="flex items-start gap-2 text-sm text-gray-700 rounded-lg border border-gray-200 bg-white px-3 py-2"
            >
              <MapPin className="w-3.5 h-3.5 text-[#003d7a] mt-0.5 shrink-0" />
              {name}
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Outside these nodes we still quote — travel time is included transparently before you accept.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Services available on-site</h2>
        <ul className="space-y-2">
          {serviceLandings.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="text-sm font-medium text-[#003d7a] hover:underline"
              >
                {s.h1}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-2xl bg-[#003d7a] p-6 text-white">
        <h2 className="text-lg font-bold mb-2">Book a Cape Town visit</h2>
        <p className="text-sm text-blue-100 mb-4">
          Tell us your suburb, site type, and what is broken or missing — we will confirm timing before we travel.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/services/book"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-[#003d7a] text-sm font-semibold rounded-xl"
          >
            <FileText className="w-4 h-4" /> Book a service
          </Link>
          <Link
            href="/quote"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold rounded-xl"
          >
            Request a quote
          </Link>
          <TrackedWhatsAppLink
            location="service_area_cape_town"
            href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent('Hi BretuneTech! I need a Cape Town site visit.')}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </TrackedWhatsAppLink>
          <TrackedPhoneLink
            location="service_area_cape_town"
            href={`tel:${brand.phone.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-white/40 text-white text-sm font-semibold rounded-xl"
          >
            <Phone className="w-4 h-4" /> {brand.phone}
          </TrackedPhoneLink>
        </div>
      </div>
    </div>
  );
}
