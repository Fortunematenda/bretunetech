/**
 * READ-ONLY catalogue classification audit. Does NOT modify products.
 * Run: npx ts-node --transpile-only src/scripts/_audit-catalogue-dryrun.ts
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';

type Bucket = 'KEEP' | 'REVIEW' | 'REMOVE';

const STRONG_KEEP_BRANDS = [
  'mikrotik', 'ruijie', 'reyee', 'ubiquiti', 'unifi', 'hikvision', 'hiwatch', 'dahua', 'uniview',
];
const KEEP_BRANDS = [
  ...STRONG_KEEP_BRANDS,
  'mikrotik routerboard', 'ruijie reyee', 'ui', 'tp-link', 'tplink', 'tenda',
  'd-link', 'dlink', 'cisco', 'netgear', 'grandstream', 'yealink', 'axis', 'hanwha', 'wisenet',
];

const KEEP_CATEGORY_SLUGS = new Set([
  'networking', 'internet-networking', 'routers', 'mesh-wifi-systems', 'access-points',
  'network-switches', 'network-cables', 'fibre-equipment', 'network-cabinets', 'poe-equipment',
  'cctv-security', 'cctv-cameras', 'nvrs-dvrs', 'cameras',
  'wireless-solutions', 'outdoor-wireless', 'point-to-point-links', 'wifi-extenders',
  'wireless-bridges', 'antennas',
]);

const REVIEW_CATEGORY_SLUGS = new Set([
  'video-doorbells', 'access-control', 'alarm-systems', 'intercom-systems',
  'hard-drives', 'ssds', 'storage-memory', 'nas-storage',
  'power-backup', 'power-solutions', 'ups-systems', 'surge-protectors', 'power-distribution-units',
  'accessories', 'general',
]);

const REMOVE_CATEGORY_SLUGS = new Set([
  'computers-laptops', 'technology', 'laptops', 'desktop-pcs', 'mini-pcs', 'all-in-one-pcs',
  'computer-components', 'motherboards', 'processors-cpus', 'graphics-cards-gpus', 'ram',
  'power-supplies-psus', 'pc-cases', 'cooling', 'fans', 'thermal-paste',
  'printers-office', 'printers', 'scanners', 'ink', 'toners', 'label-printers', 'office-equipment',
  'peripherals', 'monitors', 'keyboards', 'mice', 'webcams', 'speakers', 'headsets', 'docking-stations',
  'gaming', 'gaming-keyboards', 'gaming-mice', 'gaming-monitors', 'software', 'phones', 'tablets', 'tv', 'audio',
]);

const KEEP_KEYWORDS = [
  'mikrotik', 'routerboard', 'ruijie', 'reyee', 'ubiquiti', 'unifi', 'hikvision', 'hiwatch',
  'access point', 'accesspoint', ' outdoor ap', 'ceiling ap',
  'wifi 6', 'wi-fi 6', 'wifi 7', 'wi-fi 7', 'mesh wifi', 'mesh wi-fi',
  'wifi extender', 'wi-fi extender', 'range extender',
  'network switch', 'poe switch', 'managed switch', 'unmanaged switch', 'gigabit switch', 'ethernet switch',
  'poe injector', 'poe adapter', 'nvr', 'dvr', 'ip camera', 'cctv', 'surveillance',
  'bullet camera', 'dome camera', 'turret camera', 'ptz camera',
  'wireless bridge', 'point to point', 'point-to-point', 'ptp ',
  'cpe', 'nanostation', 'airmax', 'airfiber', 'litestation', 'powerbeam', 'rocket dish',
  'omnitik', 'hap ax', 'hap lite', 'hex ', 'crs3', 'crs1', 'rb4011', 'rb5009', 'ccr1',
  'sxt ', 'lhg ', 'wap ', 'cap ax', 'firewall', 'vlan',
  'sfp module', 'sfp+', 'fibre media converter', 'fiber media converter',
  'cat5e', 'cat6', 'cat6a', 'rj45', 'patch panel', 'patch cord', 'keystone',
  'network cabinet', 'rack mount', 'surveillance hdd', 'purple hdd', 'skyhawk', 'wd purple', 'seagate skyhawk',
];

const REMOVE_KEYWORDS = [
  'laptop', 'notebook', 'chromebook', 'thinkpad', 'macbook',
  'desktop pc', 'tower pc', 'all-in-one', 'all in one', 'mini pc',
  'motherboard', 'graphics card', 'geforce', 'radeon', 'rtx ', 'gtx ',
  'processor intel', 'core i5', 'core i7', 'core i9', 'ryzen',
  'printer', 'toner', 'inkjet', 'laserjet', 'cartridge',
  'monitor ', 'gaming mouse', 'gaming keyboard', 'mechanical keyboard',
  'headset', 'webcam', 'docking station',
  'ups ', 'inverter', 'lithium battery', 'solar panel',
  'tablet', 'iphone', 'samsung galaxy', 'smartphone',
];

function norm(s: string | null | undefined): string {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function textBlob(p: {
  name: string;
  sku?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  displayName?: string | null;
  brandName?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  parentSlug?: string | null;
  tags?: string[];
}): string {
  return norm([
    p.name, p.displayName, p.sku,
    (p.description || '').slice(0, 800),
    p.shortDescription, p.brandName, p.categoryName, p.categorySlug, p.parentSlug,
    ...(p.tags || []),
  ].join(' '));
}

function classify(p: {
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
}): { bucket: Bucket; reason: string } {
  const brand = norm(p.brandName);
  const cat = norm(p.categorySlug);
  const parent = norm(p.parentSlug);
  const blob = textBlob(p);

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
  if ((blob.includes('skyhawk') || blob.includes('wd purple') || blob.includes('surveillance')) &&
      (blob.includes('hdd') || blob.includes('hard drive') || blob.includes('hard disk'))) {
    return { bucket: 'KEEP', reason: 'surveillance HDD' };
  }
  if (removeCat && !keepKw && !strongBrand) return { bucket: 'REMOVE', reason: `out-of-scope category ${cat || parent}` };
  if (removeKw && !keepKw && !keepCat && !strongBrand) return { bucket: 'REMOVE', reason: 'out-of-scope product keyword' };
  if (reviewCat || (keepBrand && !keepKw) || (keepKw && removeKw) || (!keepCat && !removeCat && !keepKw && !removeKw)) {
    return { bucket: 'REVIEW', reason: reviewCat ? `borderline category ${cat || parent}` : 'insufficient signal' };
  }
  if (removeKw) return { bucket: 'REMOVE', reason: 'out-of-scope keyword' };
  return { bucket: 'REVIEW', reason: 'uncertain' };
}

async function main() {
  const [total, published, inactive, deleted, draft] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: 'PUBLISHED', isActive: true, isDeleted: false } }),
    prisma.product.count({ where: { isActive: false } }),
    prisma.product.count({ where: { isDeleted: true } }),
    prisma.product.count({ where: { status: 'DRAFT' } }),
  ]);

  const brands = await prisma.brand.findMany({
    select: { name: true, slug: true, isActive: true, _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  const categories = await prisma.category.findMany({
    select: {
      name: true, slug: true, parentId: true,
      parent: { select: { slug: true, name: true } },
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });

  const products = await prisma.product.findMany({
    select: {
      id: true, name: true, slug: true, sku: true, sellingPrice: true,
      stockQuantity: true, stockCpt: true, stockJhb: true, stockDbn: true,
      isActive: true, status: true, isDeleted: true,
      description: true, shortDescription: true, displayName: true,
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true, parent: { select: { name: true, slug: true } } } },
      tags: { select: { tag: true } },
    },
  });

  const counts = { KEEP: 0, REVIEW: 0, REMOVE: 0 };
  const reasonTop: Record<string, number> = {};
  const samples: Record<Bucket, Array<Record<string, unknown>>> = { KEEP: [], REVIEW: [], REMOVE: [] };
  const byCategory: Record<string, { KEEP: number; REVIEW: number; REMOVE: number }> = {};

  for (const p of products) {
    const result = classify({
      name: p.name, sku: p.sku, description: p.description, shortDescription: p.shortDescription,
      displayName: p.displayName, brandName: p.brand?.name,
      categorySlug: p.category?.slug, parentSlug: p.category?.parent?.slug,
      categoryName: p.category?.name, tags: p.tags.map((t) => t.tag),
    });
    counts[result.bucket]++;
    reasonTop[result.reason] = (reasonTop[result.reason] || 0) + 1;
    const catKey = p.category?.parent?.slug
      ? `${p.category.parent.slug}/${p.category.slug}`
      : p.category?.slug || 'uncategorised';
    if (!byCategory[catKey]) byCategory[catKey] = { KEEP: 0, REVIEW: 0, REMOVE: 0 };
    byCategory[catKey][result.bucket]++;
    if (samples[result.bucket].length < 15) {
      samples[result.bucket].push({
        name: p.name, sku: p.sku, brand: p.brand?.name || '',
        category: catKey, reason: result.reason, status: p.status, isActive: p.isActive,
      });
    }
  }

  const report = {
    summary: {
      total, publishedActive: published, inactive, deletedFlag: deleted, draft,
      classified: counts,
      pct: {
        KEEP: total ? Math.round((counts.KEEP / total) * 1000) / 10 : 0,
        REVIEW: total ? Math.round((counts.REVIEW / total) * 1000) / 10 : 0,
        REMOVE: total ? Math.round((counts.REMOVE / total) * 1000) / 10 : 0,
      },
    },
    brandCount: brands.length,
    brands: brands.map((b) => ({ name: b.name, slug: b.slug, active: b.isActive, products: b._count.products })),
    categoryCount: categories.length,
    categories: categories.map((c) => ({
      name: c.name, slug: c.slug, parent: c.parent?.slug || null, products: c._count.products,
    })),
    topReasons: Object.entries(reasonTop).sort((a, b) => b[1] - a[1]).slice(0, 30),
    categoryBreakdownTop50: Object.entries(byCategory)
      .map(([k, v]) => ({ category: k, ...v, total: v.KEEP + v.REVIEW + v.REMOVE }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 50),
    samples,
  };

  const out = path.join(__dirname, '_audit-catalogue-report.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log('Wrote', out);
  console.log(JSON.stringify(report.summary, null, 2));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
