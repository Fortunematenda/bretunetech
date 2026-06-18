'use client';

/**
 * Schema.org Organization Structured Data
 * Includes social media profiles and company information
 */
export default function SchemaOrgData() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bretunetech',
    url: 'https://www.bretunetech.com',
    logo: 'https://www.bretunetech.com/assets/logo/logo.png',
    description: 'Premium enterprise networking ecommerce and management platform for South African businesses.',
    sameAs: [
      'https://www.linkedin.com/company/bretunetech',
      'https://www.facebook.com/bretunetech',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@bretunetech.com',
      areaServed: 'ZA',
      availableLanguage: ['en'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ZA',
      addressLocality: 'South Africa',
    },
    socialProfiles: [
      {
        '@type': 'Thing',
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/company/bretunetech',
      },
      {
        '@type': 'Thing',
        name: 'Facebook',
        url: 'https://www.facebook.com/bretunetech',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
