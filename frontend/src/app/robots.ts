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
          '/shop',
          '/wishlist',
          '/maintenance',
          '/downloads/',
          '/forgot-password',
          '/reset-password',
          '/register',
        ],
      },
    ],
    sitemap: 'https://bretunetech.com/sitemap.xml',
  };
}
