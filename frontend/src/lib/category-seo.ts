/**
 * Indexable category landing SEO + clean URL helpers.
 */

export const SITE_URL = 'https://bretunetech.com';

/** Primary BretuneTech catalogue focus (post cleanup). */
export const PRIMARY_CATEGORY_SLUGS = [
  'networking',
  'cctv-security',
  'wifi',
  'wireless-solutions',
  'internet-networking',
] as const;

export type CategorySeoConfig = {
  slug: string;
  /** Absolute <title> (includes BretuneTech once). */
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** Canonical path without domain, e.g. /products/category/networking */
  canonicalPath: string;
};

const CATEGORY_SEO: Record<string, CategorySeoConfig> = {
  networking: {
    slug: 'networking',
    title: 'Networking Equipment South Africa | MikroTik, Reyee & Ubiquiti | BretuneTech',
    description:
      'Shop enterprise networking equipment in South Africa — routers, switches, access points, and PoE from MikroTik, Reyee, and Ubiquiti. Fast delivery from BretuneTech.',
    h1: 'Networking Equipment',
    intro:
      'Browse routers, switches, access points, and network infrastructure for homes and businesses across South Africa. We stock MikroTik, Reyee, Ubiquiti, and complementary networking gear ready to ship.',
    canonicalPath: '/products/category/networking',
  },
  'cctv-security': {
    slug: 'cctv-security',
    title: 'Hikvision CCTV Cameras & NVRs South Africa | BretuneTech',
    description:
      'Hikvision CCTV cameras, NVRs, and security hardware for South African homes and businesses. Expert advice and nationwide delivery from BretuneTech.',
    h1: 'CCTV & Security',
    intro:
      'Find CCTV cameras, NVRs, and related security hardware for reliable surveillance installs. We focus on practical Hikvision and compatible solutions for South African sites.',
    canonicalPath: '/products/category/cctv-security',
  },
  wifi: {
    slug: 'wifi',
    title: 'Wi-Fi Routers, Mesh & Access Points South Africa | BretuneTech',
    description:
      'Wi-Fi routers, mesh systems, and access points for strong wireless coverage in South Africa. Shop Reyee, MikroTik, Ubiquiti, and more at BretuneTech.',
    h1: 'Wi-Fi & Wireless',
    intro:
      'Choose Wi-Fi routers, mesh kits, and access points built for reliable coverage. Ideal for offices, warehouses, and homes that need dependable wireless networking.',
    canonicalPath: '/products/category/wifi',
  },
  'wireless-solutions': {
    slug: 'wireless-solutions',
    title: 'Wi-Fi Routers, Mesh & Access Points South Africa | BretuneTech',
    description:
      'Outdoor wireless links, bridges, antennas, and Wi-Fi gear for South African deployments. Browse wireless solutions at BretuneTech.',
    h1: 'Wireless Solutions',
    intro:
      'Outdoor wireless links, bridges, antennas, and Wi-Fi equipment for point-to-point and coverage projects across South Africa.',
    canonicalPath: '/products/category/wireless-solutions',
  },
  'internet-networking': {
    slug: 'internet-networking',
    title: 'Networking Equipment South Africa | MikroTik, Reyee & Ubiquiti | BretuneTech',
    description:
      'Internet and networking products including routers, switches, and fibre gear. Shop BretuneTech for South African delivery.',
    h1: 'Internet & Networking',
    intro:
      'Routers, switches, and networking hardware for connecting sites and expanding wired or wireless infrastructure.',
    canonicalPath: '/products/category/networking',
  },
};

export function getCategorySeo(slug: string): CategorySeoConfig {
  const key = slug.trim().toLowerCase();
  if (CATEGORY_SEO[key]) return CATEGORY_SEO[key];

  const name = key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    slug: key,
    title: `${name} Products | BretuneTech`,
    description: `Shop ${name} products at BretuneTech. Quality technology products with fast delivery across South Africa.`,
    h1: name,
    intro: `Browse our ${name} selection. Filter by brand, price, and stock to find the right product for your project.`,
    canonicalPath: `/products/category/${key}`,
  };
}

export function categoryPath(slug: string): string {
  return `/products/category/${encodeURIComponent(slug)}`;
}

/** Query keys that make a listing a filtered / non-canonical variant. */
export const LISTING_FILTER_KEYS = [
  'search',
  'brand',
  'sort',
  'discount',
  'minPrice',
  'maxPrice',
  'priceMin',
  'priceMax',
  'condition',
  'bestSeller',
  'newArrivals',
  'inStock',
  'filter',
  'solution',
  'tag',
  'featured',
] as const;

export function listingHasExtraFilters(
  params: Record<string, string | undefined | null>,
  opts?: { ignoreCategory?: boolean },
): boolean {
  for (const key of LISTING_FILTER_KEYS) {
    const v = params[key];
    if (v !== undefined && v !== null && String(v).trim() !== '') return true;
  }
  if (!opts?.ignoreCategory) {
    // page alone is also non-canonical for category landings beyond page 1
  }
  const page = parseInt(String(params.page || '1'), 10);
  if (Number.isFinite(page) && page > 1) return true;
  return false;
}

export function isPrimaryCategorySlug(slug: string): boolean {
  return (PRIMARY_CATEGORY_SLUGS as readonly string[]).includes(slug.trim().toLowerCase());
}
