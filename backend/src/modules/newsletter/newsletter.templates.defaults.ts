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
    slug: 'holiday-connected',
    name: 'Holiday connection',
    description: 'December-style layout: eyebrow, headline, CCTV and Wi-Fi cards, and a full-width shop button.',
    title: 'December 2026 Newsletter',
    subject: 'Keep your home and business connected this holiday season',
    previewText: 'CCTV, Wi-Fi and networking from BretuneTech.',
    audience: { consentOnly: true, activity: 'all' },
    blocks: [
      { type: 'eyebrow', text: 'DECEMBER 2026 NEWSLETTER' },
      {
        type: 'hero',
        headline: 'Keep Your Home & Business Connected This Holiday Season',
        subhead:
          'Discover reliable CCTV, Wi-Fi and networking solutions to help protect your property and keep you connected.',
      },
      {
        type: 'features',
        items: [
          {
            imageUrl: '/assets/hero/camera.png',
            title: 'CCTV Security',
            text: 'Protect your property with professional installations.',
          },
          {
            imageUrl: '/assets/hero/networking.png',
            title: 'Better Wi-Fi',
            text: 'Improve coverage throughout your home or business.',
          },
        ],
      },
      { type: 'cta', label: 'Explore Products & Services', href: '/', sublabel: 'www.bretunetech.com' },
    ],
  },
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
      { type: 'hero', headline: 'This week’s picks', subhead: 'A few products we recommend' },
      {
        type: 'richtext',
        html: '<p>Here are a few products from the BretuneTech catalogue.</p>',
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
  {
    slug: 'wifi-coverage',
    name: 'Wi-Fi coverage & networking',
    description: 'Promote site surveys, access points and networking upgrades.',
    title: 'Better Wi-Fi coverage',
    subject: 'Improve Wi-Fi coverage with BretuneTech',
    previewText: 'Surveys, access points and cabling for reliable coverage.',
    audience: { consentOnly: true, activity: 'all', interests: ['networking'] },
    blocks: [
      { type: 'eyebrow', text: 'WI-FI & NETWORKING' },
      {
        type: 'hero',
        headline: 'Coverage that keeps teams productive',
        subhead: 'From access-point placement to backbone switches — designed for South African sites.',
      },
      {
        type: 'richtext',
        html: '<p>Dead zones and slow roaming cost hours every week. BretuneTech designs and installs Wi-Fi that performs under load.</p>',
      },
      { type: 'category', categorySlug: 'networking', limit: 4 },
      { type: 'services', slugs: ['wifi-installations', 'network-installation'] },
      { type: 'cta', label: 'Book a Wi-Fi survey', href: '/services/wifi-installations' },
      { type: 'contact', phone: '+27 contact via website', email: 'sales@bretunetech.com', address: 'Cape Town, South Africa' },
    ],
  },
  {
    slug: 'business-it-solutions',
    name: 'Business IT solutions',
    description: 'Cross-sell networking, CCTV and managed IT for SMEs.',
    title: 'Business IT solutions',
    subject: 'IT solutions that keep your business online',
    previewText: 'Networking, security and connectivity for growing teams.',
    audience: { consentOnly: true, activity: 'purchased' },
    blocks: [
      { type: 'hero', headline: 'IT that works when you do', subhead: 'Practical kits and installation for SMEs' },
      { type: 'divider' },
      {
        type: 'features',
        items: [
          {
            imageUrl: '/assets/hero/networking.png',
            title: 'Reliable networks',
            text: 'Switches, routers and Wi-Fi sized for your floor plan.',
          },
          {
            imageUrl: '/assets/hero/camera.png',
            title: 'Site security',
            text: 'CCTV and NVR packages with professional commissioning.',
          },
        ],
      },
      { type: 'services', slugs: ['network-installation', 'cctv-setup', 'wifi-installations'] },
      { type: 'cta', label: 'Talk to BretuneTech', href: '/contact' },
    ],
  },
  {
    slug: 'structured-cabling',
    name: 'Structured cabling',
    description: 'Promote cable runs, cabinets and certification-ready installs.',
    title: 'Structured cabling',
    subject: 'Structured cabling by BretuneTech',
    previewText: 'Clean cable plant for offices, warehouses and campuses.',
    audience: { consentOnly: true, activity: 'all' },
    blocks: [
      { type: 'hero', headline: 'Cabling done properly', subhead: 'Labelled, tested and ready for growth' },
      {
        type: 'richtext',
        html: '<p>Messy patching slows every change request. Our technicians deliver neat cabinet builds and structured runs you can expand later.</p>',
      },
      { type: 'services', slugs: ['structured-cabling', 'network-installation'] },
      { type: 'project', title: 'Office refresh', summary: 'Multi-floor Cat6 plant with labelled panels and uplink redundancy.', href: '/services' },
      { type: 'cta', label: 'Request a cabling quote', href: '/services' },
    ],
  },
  {
    slug: 'backup-connectivity',
    name: 'Backup connectivity',
    description: 'Failover links, LTE and redundancy messaging for always-on sites.',
    title: 'Backup connectivity',
    subject: 'Stay online when your primary link fails',
    previewText: 'Failover and backup connectivity options from BretuneTech.',
    audience: { consentOnly: true, activity: 'all' },
    blocks: [
      { type: 'hero', headline: 'When the primary link drops', subhead: 'Failover options that keep POS, CCTV and VoIP alive' },
      {
        type: 'richtext',
        html: '<p>Single points of failure are expensive. We help you add backup paths and monitoring so outages are minutes, not days.</p>',
      },
      { type: 'offer', headline: 'Connectivity health check', detail: 'Ask about a site review of primary and failover paths.', code: 'BACKUP-CHECK' },
      { type: 'cta', label: 'Discuss backup options', href: '/contact' },
    ],
  },
  {
    slug: 'seasonal-offers',
    name: 'Seasonal offers',
    description: 'Promo layout with offer block, products and expiry messaging.',
    title: 'Seasonal offers',
    subject: 'Seasonal offers from BretuneTech',
    previewText: 'Limited-time networking and security promotions.',
    audience: { consentOnly: true, activity: 'all' },
    blocks: [
      { type: 'eyebrow', text: 'LIMITED TIME' },
      { type: 'hero', headline: 'Seasonal savings on gear that matters', subhead: 'Selected networking and CCTV packages' },
      {
        type: 'offer',
        headline: 'Seasonal package pricing',
        detail: 'Ask sales for current package pricing on Wi-Fi + CCTV bundles.',
        expiresAt: 'End of month',
      },
      { type: 'spacer', height: 16 },
      { type: 'category', categorySlug: 'networking', limit: 3 },
      { type: 'cta', label: 'Shop the catalogue', href: '/products' },
      { type: 'contact', email: 'sales@bretunetech.com', address: 'Cape Town, South Africa' },
    ],
  },
];