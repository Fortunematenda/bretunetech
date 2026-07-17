import { Metadata } from 'next';
import { brand } from './brand';

const SITE_URL = 'https://bretunetech.com';

export const siteConfig = {
  url: SITE_URL,
  name: brand.name,
  description: 'Premium enterprise networking, power solutions, and computing products for South African businesses.',
  ogImage: `${SITE_URL}/assets/logo/og-image.png`,
  twitterHandle: '@bretunetech',
  locale: 'en_ZA',
};

export function generatePageMetadata({
  title,
  description,
  path = '',
  image,
  type = 'website',
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || siteConfig.ogImage;

  return {
    title: `${title} | ${siteConfig.name}`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      type,
      locale: siteConfig.locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [ogImage],
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

export function generateProductMetadata(product: {
  name: string;
  slug: string;
  description?: string;
  displayName?: string;
  fullDescription?: string;
  seoTitle?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  images?: { url: string }[];
  category?: { name: string };
  brand?: { name: string };
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
}): Metadata {
  const displayName = product.displayName || product.name;
  const configuredTitle = product.seoTitle || product.metaTitle || displayName;
  const title = /bretunetech/i.test(configuredTitle) ? configuredTitle : `${configuredTitle} | BretuneTech`;
  const sourceDescription = product.fullDescription || product.description || '';
  const desc = product.metaDescription
    || (sourceDescription
      ? sourceDescription.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').substring(0, 157).trim() + (sourceDescription.length > 157 ? '...' : '')
      : `${displayName} from BretuneTech, with product specifications available for South African customers.`);
  const image = product.images?.[0]?.url || siteConfig.ogImage;
  const url = product.canonicalUrl || `${SITE_URL}/products/${product.slug}`;

  return {
    title,
    description: desc,
    keywords: product.focusKeyword || `${product.brand?.name || ''} ${displayName} ${product.category?.name || ''}`.trim(),
    alternates: { canonical: url },
    robots: product.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: siteConfig.name,
      type: 'website',
      locale: siteConfig.locale,
      images: [{ url: image, width: 1200, height: 630, alt: displayName }],
    },
    twitter: { card: 'summary_large_image', title, description: desc, images: [image] },
  };
}

// JSON-LD Schema helpers
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    legalName: brand.fullName,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/logo/logo.png`,
    description: siteConfig.description,
    email: brand.email,
    telephone: brand.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cape Town',
      addressRegion: 'Western Cape',
      addressCountry: 'ZA',
    },
    sameAs: [
      'https://www.linkedin.com/company/bretunetech',
      'https://www.facebook.com/bretunetech',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: brand.emailSales,
        telephone: brand.phone,
        areaServed: 'ZA',
        availableLanguage: ['en'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: brand.emailSupport,
        telephone: brand.phone,
        areaServed: 'ZA',
        availableLanguage: ['en'],
      },
    ],
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brand.name,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateProductSchema(product: {
  name: string;
  slug: string;
  description?: string;
  displayName?: string;
  fullDescription?: string;
  canonicalUrl?: string;
  sellingPrice?: number;
  originalPrice?: number;
  images?: { url: string; altText?: string }[];
  category?: { name: string };
  brand?: { name: string };
  condition?: string;
  sku?: string;
  stockQuantity?: number;
  averageRating?: number;
  reviewCount?: number;
}) {
  const image = product.images?.[0]?.url || `${SITE_URL}/assets/logo/logo.png`;
  const availability = (product.stockQuantity ?? 0) > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  const conditionMap: Record<string, string> = {
    NEW: 'https://schema.org/NewCondition',
    USED: 'https://schema.org/UsedCondition',
    REFURBISHED: 'https://schema.org/RefurbishedCondition',
  };

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.displayName || product.name,
    description: product.fullDescription || product.description || `${product.displayName || product.name} available at BretuneTech`,
    image: product.images?.length ? product.images.map(img => img.url) : [image],
    url: product.canonicalUrl || `${SITE_URL}/products/${product.slug}`,
    sku: product.sku || product.slug,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || 'Bretunetech',
    },
    category: product.category?.name,
    itemCondition: conditionMap[product.condition || 'NEW'] || conditionMap.NEW,
    offers: {
      '@type': 'Offer',
      url: product.canonicalUrl || `${SITE_URL}/products/${product.slug}`, 
      priceCurrency: 'ZAR',
      price: product.sellingPrice || 0,
      availability,
      seller: {
        '@type': 'Organization',
        name: brand.name,
      },
    },
  };

  return schema;
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
