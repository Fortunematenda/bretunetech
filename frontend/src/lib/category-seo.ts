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

/**
 * Legacy catalogue parents that now resolve to a live landing.
 * Permanent redirects only — categories are not deleted.
 */
export const LEGACY_CATEGORY_REDIRECTS: Record<string, string> = {
  'internet-networking': 'networking',
};

/**
 * Computers, laptops, and power-backup were removed from the catalogue.
 * These URLs stay gone. Do not redirect visitors back onto them.
 */
export const REMOVED_CATEGORY_SLUGS = [
  'computers-laptops',
  'laptops',
  'desktop-pcs',
  'mini-pcs',
  'all-in-one-pcs',
  'technology',
  'power-backup',
  'power-solutions',
  'ups-systems',
  'inverters',
  'batteries',
  'surge-protectors',
  'solar-accessories',
  'power-distribution-units',
] as const;

export function isRemovedCategorySlug(slug: string): boolean {
  return (REMOVED_CATEGORY_SLUGS as readonly string[]).includes(slug.trim().toLowerCase());
}

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
      'Shop networking equipment in South Africa — MikroTik, Ubiquiti, Reyee, and Ruijie routers, switches, and related gear from BretuneTech.',
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
    title: 'Wi-Fi Routers, Mesh Systems & Access Points | BretuneTech',
    description:
      'Shop Wi-Fi routers, mesh systems, wireless access points, and extenders in South Africa. Reyee, MikroTik, Ubiquiti, and related brands at BretuneTech.',
    h1: 'Wi-Fi Routers, Mesh & Access Points',
    intro:
      'Routers, mesh kits, indoor access points, and extenders for offices and homes. For outdoor bridges and point-to-point radios, see Wireless Solutions.',
    canonicalPath: '/products/category/wifi',
  },
  'wireless-solutions': {
    slug: 'wireless-solutions',
    title: 'Outdoor Wireless, Bridges & Point-to-Point CPEs | BretuneTech',
    description:
      'Outdoor wireless bridges, point-to-point CPEs, and antennas for South African links. Shop Ubiquiti, MikroTik, and related wireless gear at BretuneTech.',
    h1: 'Outdoor Wireless & Point-to-Point',
    intro:
      'Bridges, outdoor CPEs, and antennas for linking buildings. Indoor routers, mesh systems, and ceiling access points are listed under Wi-Fi.',
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

export function isConfiguredCategorySlug(slug: string): boolean {
  return Boolean(CATEGORY_SEO[slug.trim().toLowerCase()]);
}

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
