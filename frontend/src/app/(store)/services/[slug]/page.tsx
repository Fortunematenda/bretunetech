import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  MessageCircle,
  Phone,
  MapPin,
} from 'lucide-react';
import { brand } from '@/lib/brand';
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generatePageMetadata,
  generateServiceSchema,
} from '@/lib/seo';
import { getAllServiceSlugs, getServiceLanding, serviceLandings } from '@/lib/service-landings';
import { TrackedPhoneLink, TrackedWhatsAppLink } from '@/components/analytics/TrackedLinks';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceLanding(slug);
  if (!service) {
    return generatePageMetadata({
      title: 'Service Not Found',
      description: 'This BretuneTech service page could not be found.',
      path: `/services/${slug}`,
      noIndex: true,
    });
  }
  return generatePageMetadata({
    title: service.title,
    description: service.metaDescription,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceLandingPage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceLanding(slug);
  if (!service) notFound();

  const related = serviceLandings.filter((s) => s.slug !== service.slug).slice(0, 3);
  const serviceSchema = generateServiceSchema({
    name: service.h1,
    description: service.metaDescription,
    slug: service.slug,
  });
  const faqSchema = generateFAQSchema(service.faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.name, url: `/services/${service.slug}` },
  ]);

  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#003d7a] mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> All services
      </Link>

      <p className="text-xs font-semibold uppercase tracking-wider text-[#003d7a] mb-2">
        BretuneTech Services
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{service.h1}</h1>
      <p className="text-gray-600 text-base sm:text-lg mb-6">{service.intro}</p>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href={`/services/book?service=${service.slug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#003d7a] hover:bg-[#0056b3] text-white text-sm font-semibold rounded-xl"
        >
          <FileText className="w-4 h-4" /> Book a visit
        </Link>
        <Link
          href={`/quote?service=${service.slug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 hover:border-[#003d7a] text-gray-800 text-sm font-semibold rounded-xl"
        >
          Get a quote
        </Link>
        <TrackedWhatsAppLink
          location={`service_${service.slug}`}
          href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(service.whatsappMessage)}`}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl"
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </TrackedWhatsAppLink>
        <TrackedPhoneLink
          location={`service_${service.slug}`}
          href={`tel:${brand.phone.replace(/\s/g, '')}`}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl"
        >
          <Phone className="w-4 h-4" /> {brand.phone}
        </TrackedPhoneLink>
      </div>

      <div className="prose prose-sm sm:prose-base max-w-none text-gray-600 space-y-4 mb-8">
        {service.paragraphs.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Who it&apos;s for</h2>
          <p className="text-sm text-gray-600">{service.audience}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-2">How we work</h2>
          <p className="text-sm text-gray-600">{service.process}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#003d7a]/20 bg-[#003d7a]/5 p-5 mb-8">
        <h2 className="text-sm font-bold text-gray-900 mb-2">Pricing guidance</h2>
        <p className="text-sm text-gray-600">{service.pricingNote}</p>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
        <div className="space-y-3">
          {service.faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-gray-200 bg-white open:shadow-sm"
            >
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-gray-900 flex items-center justify-between gap-3">
                {faq.question}
                <CheckCircle2 className="w-4 h-4 text-[#003d7a] shrink-0 opacity-40 group-open:opacity-100" />
              </summary>
              <p className="px-4 pb-4 text-sm text-gray-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 p-5 mb-10">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#003d7a] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">Service area</h2>
            <p className="text-sm text-gray-600 mb-2">
              On-site work across Cape Town and the Western Cape. Remote support nationwide.
            </p>
            <Link
              href="/services/areas/cape-town"
              className="text-sm font-semibold text-[#003d7a] hover:underline"
            >
              Cape Town coverage details →
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Related services</h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/services/${r.slug}`}
                  className="text-sm font-medium text-[#003d7a] hover:underline"
                >
                  {r.h1}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
