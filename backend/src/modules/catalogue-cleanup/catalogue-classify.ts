/**
 * BretuneTech catalogue classification for Networking / CCTV / Wi-Fi focus.
 * Pure functions — safe for dry-run (no DB writes).
 */

export type ClassificationBucket = 'KEEP' | 'REVIEW' | 'REMOVE';

export type ClassifiableProduct = {
  name: string;
  sku?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  displayName?: string | null;
  brandName?: string | null;
  categorySlug?: string | null;
  parentSlug?: string | null;
  categoryName?: string | null;
  tags?: string[];
};

export type ClassificationResult = {
  bucket: ClassificationBucket;
  reason: string;
};

const STRONG_KEEP_BRANDS = [
  'mikrotik', 'ruijie', 'reyee', 'ubiquiti', 'unifi',
  'hikvision', 'hiwatch', 'hiksemi', 'dahua', 'uniview', 'ezviz',
];

const KEEP_BRANDS = [
  ...STRONG_KEEP_BRANDS,
  'mikrotik routerboard', 'ruijie reyee', 'ui',
  'tp-link', 'tplink', 'tenda', 'mercusys', 'linkbasic',
  'd-link', 'dlink', 'cisco', 'netgear', 'grandstream', 'yealink',
  'axis', 'hanwha', 'wisenet', 'procet',
];

/** Brands that must never auto-KEEP / auto-REMOVE — always human REVIEW */
const FORCE_REVIEW_BRANDS = ['port'];

const KEEP_CATEGORY_SLUGS = new Set([
  'networking', 'internet-networking', 'routers', 'mesh-wifi-systems', 'access-points',
  'network-switches', 'network-cables', 'fibre-equipment', 'network-cabinets', 'poe-equipment',
  'cctv-security', 'cctv-cameras', 'cctv-camera', 'cctv-ip-cameras', 'cctv-nvrs', 'cctv-dvrs',
  'cctv-accessories', 'nvrs-dvrs', 'cameras',
  'wireless-solutions', 'outdoor-wireless', 'point-to-point-links', 'wifi-extenders',
  'wireless-bridges', 'antennas',
]);

const REVIEW_CATEGORY_SLUGS = new Set([
  'video-doorbells', 'access-control', 'alarm-systems', 'intercom-systems',
  'hard-drives', 'ssds', 'storage-memory', 'nas-storage', 'internal-hdd', 'external-hdd',
  'power-backup', 'power-solutions', 'ups-systems', 'surge-protectors', 'power-distribution-units',
  'accessories', 'general',
]);

const REMOVE_CATEGORY_SLUGS = new Set([
  'computers-laptops', 'technology', 'laptops', 'desktop-pcs', 'mini-pcs', 'all-in-one-pcs', 'notebook',
  'computer-components', 'motherboards', 'processors-cpus', 'graphics-cards-gpus', 'ram',
  'power-supplies-psus', 'pc-cases', 'cooling', 'fans', 'thermal-paste', 'coolers',
  'printers-office', 'printers', 'scanners', 'ink', 'toners', 'label-printers', 'office-equipment',
  'peripherals', 'monitors', 'keyboards', 'mice', 'webcams', 'speakers', 'headsets', 'docking-stations',
  'gaming', 'gaming-keyboards', 'gaming-mice', 'gaming-monitors', 'software', 'phones', 'tablets', 'tv', 'audio',
  'backpack',
]);

const KEEP_KEYWORDS = [
  'mikrotik', 'routerboard', 'ruijie', 'reyee', 'ubiquiti', 'unifi', 'hikvision', 'hiwatch', 'hiksemi', 'ezviz',
  'access point', 'accesspoint', ' outdoor ap', 'ceiling ap', 'indoor ap',
  'wifi 6', 'wi-fi 6', 'wifi 7', 'wi-fi 7', 'wifi 5', 'wi-fi 5', 'mesh wifi', 'mesh wi-fi',
  'wifi extender', 'wi-fi extender', 'range extender', 'wifi router', 'wi-fi router',
  'network switch', 'poe switch', 'managed switch', 'unmanaged switch', 'gigabit switch', 'ethernet switch',
  'poe injector', 'poe adapter', 'poe midspan',
  'nvr', 'dvr', 'ip camera', 'cctv', 'surveillance', 'bullet camera', 'dome camera', 'turret camera', 'ptz camera',
  'wireless bridge', 'point to point', 'point-to-point', 'ptp ',
  'cpe', 'nanostation', 'airmax', 'airfiber', 'litestation', 'powerbeam', 'rocket dish',
  'omnitik', 'hap ax', 'hap lite', 'hex ', 'crs3', 'crs1', 'rb4011', 'rb5009', 'ccr1',
  'sxt ', 'lhg ', 'wap ', 'cap ax', 'firewall', 'vlan',
  'sfp module', 'sfp+', 'fibre media converter', 'fiber media converter',
  'cat5e', 'cat6', 'cat6a', 'rj45', 'patch panel', 'patch cord', 'keystone',
  'network cabinet', 'rack mount', 'surveillance hdd', 'purple hdd', 'skyhawk', 'wd purple', 'seagate skyhawk',
  'unifi protect', 'unifi switch', 'unifi ap', 'dream machine', 'udm ',
];

const REMOVE_KEYWORDS = [
  'laptop', 'notebook', 'chromebook', 'thinkpad', 'macbook',
  'desktop pc', 'tower pc', 'all-in-one', 'all in one', 'mini pc',
  'motherboard', 'graphics card', 'geforce', 'radeon', 'rtx ', 'gtx ',
  'processor intel', 'core i5', 'core i7', 'core i9', 'ryzen',
  'printer', 'toner', 'inkjet', 'laserjet', 'cartridge', 'label printer',
  'monitor ', 'gaming mouse', 'gaming keyboard', 'mechanical keyboard',
  'headset', 'webcam', 'docking station', 'backpack', 'r-pet', 'recycled pet',
  'ups ', 'inverter', 'lithium battery', 'solar panel',
  'tablet', 'iphone', 'samsung galaxy', 'smartphone',
];

function norm(s: string | null | undefined): string {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function textBlob(p: ClassifiableProduct): string {
  return norm([
    p.name,
    p.displayName,
    p.sku,
    (p.description || '').slice(0, 800),
    p.shortDescription,
    p.brandName,
    p.categoryName,
    p.categorySlug,
    p.parentSlug,
    ...(p.tags || []),
  ].join(' '));
}

export function classifyProduct(p: ClassifiableProduct): ClassificationResult {
  const brand = norm(p.brandName);
  const cat = norm(p.categorySlug);
  const parent = norm(p.parentSlug);
  const blob = textBlob(p);

  if (FORCE_REVIEW_BRANDS.some((b) => brand === b || brand.includes(b))) {
    return { bucket: 'REVIEW', reason: `force-review brand (${p.brandName})` };
  }

  const strongBrand = STRONG_KEEP_BRANDS.some((b) => brand.includes(b) || blob.includes(b));
  const keepBrand = KEEP_BRANDS.some((b) => brand === b || brand.includes(b));
  const keepCat = KEEP_CATEGORY_SLUGS.has(cat) || KEEP_CATEGORY_SLUGS.has(parent);
  const removeCat = REMOVE_CATEGORY_SLUGS.has(cat) || REMOVE_CATEGORY_SLUGS.has(parent);
  const reviewCat = REVIEW_CATEGORY_SLUGS.has(cat) || REVIEW_CATEGORY_SLUGS.has(parent);
  const keepKw = KEEP_KEYWORDS.some((k) => blob.includes(k.toLowerCase()));
  const removeKw = REMOVE_KEYWORDS.some((k) => blob.includes(k.toLowerCase()));

  if (strongBrand) return { bucket: 'KEEP', reason: `strong brand (${p.brandName || 'in text'})` };
  if (keepCat && !removeKw) return { bucket: 'KEEP', reason: `category ${cat || parent}` };
  if (keepKw && !removeKw) return { bucket: 'KEEP', reason: 'networking/CCTV/WiFi keyword match' };
  if (keepBrand && keepKw) return { bucket: 'KEEP', reason: `brand + keyword (${p.brandName})` };

  if (/\bpoe\b/.test(blob) && (blob.includes('switch') || blob.includes('injector') || blob.includes('camera') || blob.includes('nvr'))) {
    return { bucket: 'KEEP', reason: 'PoE networking/CCTV equipment' };
  }
  if (
    (blob.includes('skyhawk') || blob.includes('wd purple') || blob.includes('surveillance')) &&
    (blob.includes('hdd') || blob.includes('hard drive') || blob.includes('hard disk'))
  ) {
    return { bucket: 'KEEP', reason: 'surveillance HDD' };
  }

  // TP-Link / Mercusys / Linkbasic in general with no remove keywords → KEEP (core Wi-Fi/network accessory brands)
  if (keepBrand && !removeKw && (cat === 'general' || !cat)) {
    return { bucket: 'KEEP', reason: `keep brand in general (${p.brandName})` };
  }

  if (removeCat && !keepKw && !strongBrand) {
    return { bucket: 'REMOVE', reason: `out-of-scope category ${cat || parent}` };
  }
  if (removeKw && !keepKw && !keepCat && !strongBrand) {
    return { bucket: 'REMOVE', reason: 'out-of-scope product keyword' };
  }
  if (reviewCat || (keepBrand && !keepKw) || (keepKw && removeKw) || (!keepCat && !removeCat && !keepKw && !removeKw)) {
    return { bucket: 'REVIEW', reason: reviewCat ? `borderline category ${cat || parent}` : 'insufficient signal' };
  }
  if (removeKw) return { bucket: 'REMOVE', reason: 'out-of-scope keyword' };
  return { bucket: 'REVIEW', reason: 'uncertain' };
}

export function escapeCsv(value: unknown): string {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function classifiedRowsToCsv(
  rows: Array<Record<string, unknown>>,
): string {
  const headers = [
    'id', 'classification', 'reason', 'name', 'sku', 'brand', 'category',
    'price', 'stock', 'status', 'isActive', 'discontinued', 'url',
  ];
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h])).join(','));
  }
  return lines.join('\n');
}
