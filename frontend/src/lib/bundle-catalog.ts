export type BundleCatalogItem = {
  id: string;
  name: string;
  slug: string;
  bundlePrice: number;
  originalPrice: number;
  description: string;
  items: { name: string; price: number; qty: number; desc: string }[];
};

export const bundleCatalog: Record<string, BundleCatalogItem> = {
  'work-from-home-kit': {
    id: 'b1',
    name: 'Work From Home Kit',
    slug: 'work-from-home-kit',
    bundlePrice: 9499,
    originalPrice: 10297,
    description:
      'Everything you need to work remotely — a refurbished laptop, reliable UPS for load shedding, and wireless peripherals. Set up your home office in minutes.',
    items: [
      { name: 'Refurbished Dell Latitude 5520', price: 6999, qty: 1, desc: 'i5, 16GB RAM, 256GB SSD' },
      { name: 'Mecer 1200VA UPS', price: 2699, qty: 1, desc: '720W line-interactive' },
      { name: 'Logitech MK270 Wireless Combo', price: 599, qty: 1, desc: 'Keyboard + Mouse' },
    ],
  },
  'load-shedding-backup-kit': {
    id: 'b2',
    name: 'Load Shedding Backup Kit',
    slug: 'load-shedding-backup-kit',
    bundlePrice: 23999,
    originalPrice: 25498,
    description:
      'Beat load shedding with a powerful inverter and lithium battery combo. Keep your home or office running through any stage of load shedding.',
    items: [
      { name: 'Must 3KW Hybrid Solar Inverter', price: 8499, qty: 1, desc: '3000W with MPPT charger' },
      { name: 'Hubble AM-2 5.1kWh Lithium Battery', price: 16999, qty: 1, desc: '6000+ cycles, wall-mountable' },
    ],
  },
  'small-business-network-kit': {
    id: 'b3',
    name: 'Small Business Network Kit',
    slug: 'small-business-network-kit',
    bundlePrice: 4999,
    originalPrice: 5797,
    description:
      'Professional networking setup for small businesses — router, access point, and bulk cabling for a complete network installation.',
    items: [
      { name: 'MikroTik hAP ac3 Router', price: 2299, qty: 1, desc: 'Dual-band, 5x Gigabit' },
      { name: 'Ubiquiti UniFi U6 Lite AP', price: 2199, qty: 1, desc: 'WiFi 6, PoE powered' },
      { name: 'CAT6 Network Cable 305m', price: 1299, qty: 1, desc: 'Pure copper UTP' },
    ],
  },
};

export function getBundleBySlug(slug: string): BundleCatalogItem | undefined {
  return bundleCatalog[slug];
}
