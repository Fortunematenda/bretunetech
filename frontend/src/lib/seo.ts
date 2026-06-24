import { Metadata } from 'next';
import { brand } from './brand';

const SITE_URL = 'https://www.bretunetech.com';

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
  sellingPrice?: number;
  images?: { url: string }[];
  category?: { name: string };
  brand?: { name: string };
  condition?: string;
  sku?: string;
}): Metadata {
  const title = product.name;
  const desc = product.description
    ? product.description.substring(0, 160)
    : `Buy ${product.name} from Bretunetech. ${product.category?.name || 'Enterprise technology'} for South African businesses.`;
  const image = product.images?.[0]?.url || siteConfig.ogImage;
  const url = `${SITE_URL}/products/${product.slug}`;

  return {
    title: `${title} | ${siteConfig.name}`,
    description: desc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description: desc,
      url,
      siteName: siteConfig.name,
      type: 'website',
      locale: siteConfig.locale,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description: desc,
      images: [image],
    },
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

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} available at Bretunetech`,
    image: product.images?.map(img => img.url) || [image],
    url: `${SITE_URL}/products/${product.slug}`,
    sku: product.sku || product.slug,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || 'Bretunetech',
    },
    category: product.category?.name,
    itemCondition: conditionMap[product.condition || 'NEW'] || conditionMap.NEW,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'ZAR',
      price: product.sellingPrice || 0,
      availability,
      seller: {
        '@type': 'Organization',
        name: brand.name,
      },
    },
  };

  if (product.averageRating && product.reviewCount && product.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
    };
  }

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
