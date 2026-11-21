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
 * Categories deliberately removed in the catalogue cleanup (computers, power,
 * components, printers, peripherals, gaming, phones; see REMOVE_CATEGORY_SLUGS
 * in backend/src/scripts/_audit-catalogue-dryrun.ts). These URLs answer
 * 410 Gone and are never redirected back into the catalogue.
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
  'computer-components',
  'motherboards',
  'processors-cpus',
  'graphics-cards-gpus',
  'ram',
  'power-supplies-psus',
  'pc-cases',
  'cooling',
  'fans',
  'thermal-paste',
  'printers-office',
  'printers',
  'scanners',
  'ink',
  'toners',
  'label-printers',
  'office-equipment',
  'peripherals',
  'monitors',
  'keyboards',
  'mice',
  'webcams',
  'speakers',
  'headsets',
  'docking-stations',
  'gaming',
  'gaming-keyboards',
  'gaming-mice',
  'gaming-monitors',
  'software',
  'phones',
  'tablets',
  'tv',
  'audio',
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

/** Category record fields from GET /categories?all=true used to build SEO copy. */
export type CategoryRecord = {
  slug: string;
  name?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
};

export function getCategorySeo(slug: string, record?: CategoryRecord | null): CategorySeoConfig {
  const key = slug.trim().toLowerCase();
  if (CATEGORY_SEO[key]) return CATEGORY_SEO[key];

  const name =
    record?.name?.trim() || key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const seoTitle = record?.seoTitle?.trim();
  const description =
    record?.metaDescription?.trim() ||
    record?.description?.trim() ||
    `Shop ${name} at BretuneTech, with current prices and stock for delivery across South Africa.`;
  return {
    slug: key,
    title: seoTitle ? (/bretunetech/i.test(seoTitle) ? seoTitle : `${seoTitle} | BretuneTech`) : `${name} | BretuneTech`,
    description: description.slice(0, 160),
    h1: name,
    intro:
      record?.description?.trim() ||
      `Browse ${name} currently listed in the BretuneTech catalogue. Filter by brand, price, and stock.`,
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
