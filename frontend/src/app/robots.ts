import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin-login',
          '/api/',
          '/account/',
          '/checkout',
          '/cart',
        ],
      },
    ],
    sitemap: 'https://www.bretunetech.com/sitemap.xml',
  };
}
