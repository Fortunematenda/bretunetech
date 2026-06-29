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
          '/products?page=*',
          '/products?sort=*',
          '/products?search=*',
          '/products?filter=*',
          '/products?discount=*',
        ],
      },
    ],
    sitemap: 'https://bretunetech.com/sitemap.xml',
  };
}
