import type { EmailBlock, NewsletterAudience } from './newsletter.types';

export type NewsletterTemplateSeed = {
  slug: string;
  name: string;
  description: string;
  title: string;
  subject: string;
  previewText: string;
  audience: NewsletterAudience;
  blocks: EmailBlock[];
};

export const NEWSLETTER_TEMPLATE_DEFAULTS: NewsletterTemplateSeed[] = [
  {
    slug: 'monthly-catalogue',
    name: 'Monthly catalogue',
    description: 'Hero, intro copy, networking + CCTV picks, services and shop CTA — ideal for a recurring month-end send.',
    title: 'BretuneTech monthly update',
    subject: 'Networking & security picks from BretuneTech',
    previewText: 'Routers, switches and CCTV highlights for South African sites.',
    audience: { consentOnly: true, activity: 'all' },
    blocks: [
      { type: 'hero', headline: 'BretuneTech monthly', subhead: 'Connectivity and security for your sites' },
      {
        type: 'richtext',
        html:
          '<p>Welcome to the BretuneTech monthly update. Below are catalogue highlights and services we are booking for Cape Town and nationwide support.</p>',
      },
      { type: 'category', categorySlug: 'networking', limit: 4 },
      { type: 'category', categorySlug: 'cctv-security', limit: 3 },
      { type: 'services', slugs: ['wifi-installations', 'cctv-setup', 'network-installation'] },
      { type: 'cta', label: 'Browse the full catalogue', href: '/products' },
    ],
  },
  {
    slug: 'networking-highlight',
    name: 'Networking highlight',
    description: 'Focused on switches, routers and Wi-Fi with a single category grid.',
    title: 'Networking gear — BretuneTech',
    subject: 'Upgrade your network with BretuneTech',
    previewText: 'Enterprise switches, routers and wireless from trusted brands.',
    audience: { consentOnly: true, activity: 'all', interests: ['networking'] },
    blocks: [
      { type: 'hero', headline: 'Networking that scales', subhead: 'MikroTik, Ubiquiti, Ruijie and more' },
      {
        type: 'richtext',
        html: '<p>Whether you are refreshing a site or planning a new deployment, our team supplies and supports enterprise networking across South Africa.</p>',
      },
      { type: 'category', categorySlug: 'networking', limit: 6 },
      { type: 'cta', label: 'Shop networking', href: '/products/category/networking' },
    ],
  },
  {
    slug: 'cctv-security-focus',
    name: 'CCTV & security',
    description: 'Camera and NVR highlights plus installation services.',
    title: 'CCTV & security — BretuneTech',
    subject: 'Secure your premises with BretuneTech CCTV',
    previewText: 'Cameras, recorders and professional installation.',
    audience: { consentOnly: true, activity: 'all' },
    blocks: [
      { type: 'hero', headline: 'CCTV & security', subhead: 'Design, supply and installation' },
      {
        type: 'richtext',
        html: '<p>From small offices to multi-site estates — we help you choose the right cameras and recording gear for POPIA-conscious deployments.</p>',
      },
      { type: 'category', categorySlug: 'cctv-security', limit: 6 },
      { type: 'services', slugs: ['cctv-setup'] },
      { type: 'cta', label: 'Explore CCTV gear', href: '/products/category/cctv-security' },
    ],
  },
  {
    slug: 'product-spotlight',
    name: 'Product spotlight',
    description: 'Hero plus hand-picked product slugs — edit slugs to match your catalogue.',
    title: 'Product spotlight',
    subject: 'Featured products from BretuneTech',
    previewText: 'A short list of items we recommend this week.',
    audience: { consentOnly: true, activity: 'all' },
    blocks: [
      { type: 'hero', headline: 'This week’s picks', subhead: 'Edit product slugs in the editor' },
      {
        type: 'richtext',
        html: '<p>Replace the product slugs below with live catalogue items (Admin → Products → slug in the URL).</p>',
      },
      { type: 'products', productSlugs: [] },
      { type: 'cta', label: 'View all products', href: '/products' },
    ],
  },
  {
    slug: 'services-booking',
    name: 'Services & bookings',
    description: 'Promote Wi-Fi, CCTV and network installation services.',
    title: 'Book BretuneTech services',
    subject: 'Installation and support from BretuneTech',
    previewText: 'Wi-Fi, CCTV and structured cabling for SA businesses.',
    audience: { consentOnly: true, activity: 'all' },
    blocks: [
      { type: 'hero', headline: 'On-site expertise', subhead: 'Cape Town & nationwide projects' },
      {
        type: 'richtext',
        html: '<p>Request a quote for Wi-Fi surveys, cable runs, cabinet builds and camera commissioning. Our engineers work with your existing hardware or supply turnkey kits.</p>',
      },
      { type: 'services', slugs: ['wifi-installations', 'network-installation', 'cctv-setup', 'structured-cabling'] },
      { type: 'cta', label: 'View services', href: '/services' },
    ],
  },
  {
    slug: 'announcement',
    name: 'Short announcement',
    description: 'Minimal layout for news, downtime, or policy updates.',
    title: 'BretuneTech announcement',
    subject: 'An update from BretuneTech',
    previewText: 'Important information for our customers.',
    audience: { consentOnly: true, activity: 'all' },
    blocks: [
      { type: 'hero', headline: 'News from BretuneTech', subhead: 'Replace this headline' },
      {
        type: 'richtext',
        html: '<p><strong>Your message here.</strong> Use this template for store updates, holiday hours, or new catalogue arrivals.</p>',
      },
      { type: 'cta', label: 'Visit bretunetech.com', href: '/' },
    ],
  },
];