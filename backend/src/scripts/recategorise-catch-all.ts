/**
 * Move products out of the catch-all categories (general, speciality) into the
 * focused storefront categories, using the catalogue classifier.
 *
 * Dry run by default: writes a CSV report and changes nothing.
 *
 *   npm run catalogue:recategorise                       # dry run
 *   npm run catalogue:recategorise -- --include-medium   # also MEDIUM-confidence matches
 *   npm run catalogue:recategorise -- --apply            # create target categories + move products
 *   npm run catalogue:recategorise -- --rollback reports/recategorise-<stamp>.csv
 *
 * Only KEEP classifications move. REVIEW / REMOVE products stay where they are
 * for the admin catalogue-cleanup screen. Categories are never deleted.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';
import { classifyProduct, escapeCsv, type FocusArea } from '../modules/catalogue-cleanup/catalogue-classify';

const CATCH_ALL_SLUGS = ['general', 'speciality'];

/** Target slugs equal the storefront landing slugs, so each landing has exactly one category page. */
const TARGETS = {
  networking: { name: 'Networking', description: 'Routers, switches, cabling and network infrastructure.' },
  wifi: { name: 'Wi-Fi', description: 'Wi-Fi routers, mesh systems, access points and extenders.' },
  'wireless-solutions': { name: 'Outdoor Wireless', description: 'Outdoor bridges, point-to-point links, CPEs and antennas.' },
  'cctv-security': { name: 'CCTV & Security', description: 'CCTV cameras, NVRs and security hardware.' },
} as const;
type TargetSlug = keyof typeof TARGETS;

const OUTDOOR_RE =
  /\b(ptp|ptmp|point[- ]to[- ]point|bridge|cpe|sector|dish|60 ?ghz|lhg|sxt|litebeam|nanobeam|powerbeam|nanostation|airfiber|airmax|wireless wire|antenna)\b/i;
const INDOOR_AP_RE = /\b(access point|ceiling ap|indoor ap|mesh|extender|repeater|router)\b/i;
const WIFI_RE = /\b(wi-?fi|wireless router|access point|ceiling ap|mesh|extender|repeater)\b/i;

export function targetFor(focus: FocusArea, name: string): TargetSlug | null {
  const outdoor = OUTDOOR_RE.test(name) && !INDOOR_AP_RE.test(name);
  switch (focus) {
    case 'wifi':
      return outdoor ? 'wireless-solutions' : 'wifi';
    case 'networking':
    case 'networking_accessories':
      if (outdoor) return 'wireless-solutions';
      return WIFI_RE.test(name) ? 'wifi' : 'networking';
    case 'cctv':
    case 'cctv_accessories':
      return 'cctv-security';
    default:
      return null;
  }
}

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const split = (line: string) => {
    const out: string[] = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') quoted = false;
        else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const header = split(lines[0]);
  return lines.slice(1).map((l) => Object.fromEntries(split(l).map((v, i) => [header[i], v])));
}

async function rollback(file: string) {
  const rows = parseCsv(fs.readFileSync(file, 'utf8')).filter((r) => r.action === 'move');
  const slugs = [...new Set(rows.map((r) => r.fromCategory))];
  const cats = await prisma.category.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true } });
  const idBySlug = new Map(cats.map((c) => [c.slug, c.id]));
  const missing = slugs.filter((s) => !idBySlug.has(s));
  if (missing.length) throw new Error(`Rollback aborted: source categories missing: ${missing.join(', ')}`);
  await prisma.$transaction(
    rows.map((r) => prisma.product.update({ where: { id: r.id }, data: { categoryId: idBySlug.get(r.fromCategory)! } })),
  );
  console.log(`Rolled back ${rows.length} products.`);
}

async function main() {
  const rollbackFile = argValue('--rollback');
  if (rollbackFile) return rollback(rollbackFile);

  const apply = process.argv.includes('--apply');
  const includeMedium = process.argv.includes('--include-medium');

  const products = await prisma.product.findMany({
    where: { isDeleted: false, OR: CATCH_ALL_SLUGS.map((slug) => ({ category: { slug } })) },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      status: true,
      description: true,
      shortDescription: true,
      displayName: true,
      brand: { select: { name: true } },
      category: { select: { name: true, slug: true, parent: { select: { slug: true } } } },
      tags: { select: { tag: true } },
    },
    orderBy: { name: 'asc' },
  });

  const rows = products.map((p) => {
    const c = classifyProduct({
      name: p.name,
      sku: p.sku,
      description: p.description,
      shortDescription: p.shortDescription,
      displayName: p.displayName,
      brandName: p.brand?.name,
      categorySlug: p.category?.slug,
      parentSlug: p.category?.parent?.slug,
      categoryName: p.category?.name,
      tags: p.tags.map((t) => t.tag),
    });
    const eligible = c.bucket === 'KEEP' && (c.confidence === 'HIGH' || (includeMedium && c.confidence === 'MEDIUM'));
    const target = eligible ? targetFor(c.focusArea, p.displayName || p.name) : null;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      status: p.status,
      fromCategory: p.category?.slug || '',
      toCategory: target || '',
      action: target ? 'move' : 'stay',
      bucket: c.bucket,
      confidence: c.confidence,
      focusArea: c.focusArea,
      rule: c.matchedRule,
    };
  });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.resolve(process.cwd(), 'reports');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `recategorise-${stamp}.csv`);
  const headers = Object.keys(rows[0] || { id: '' }) as Array<keyof (typeof rows)[number]>;
  fs.writeFileSync(file, [headers.join(','), ...rows.map((r) => headers.map((h) => escapeCsv(r[h])).join(','))].join('\n'));

  const moves = rows.filter((r) => r.action === 'move');
  const tally = (key: 'toCategory' | 'bucket') =>
    rows.reduce<Record<string, number>>((acc, r) => {
      const k = key === 'toCategory' ? r.toCategory || '(stay)' : r.bucket;
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  console.log(`Products in ${CATCH_ALL_SLUGS.join(' + ')}: ${rows.length}`);
  console.log('By classification:', tally('bucket'));
  console.log('Planned destination:', tally('toCategory'));
  console.log(`Report: ${file}`);

  if (!apply) {
    console.log('\nDry run only. Re-run with --apply to create target categories and move products.');
    return;
  }

  const ids: Record<string, string> = {};
  for (const slug of Object.keys(TARGETS) as TargetSlug[]) {
    if (!moves.some((m) => m.toCategory === slug)) continue;
    const existing = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
    if (existing) { ids[slug] = existing.id; continue; }
    const nameTaken = await prisma.category.findUnique({ where: { name: TARGETS[slug].name }, select: { slug: true } });
    if (nameTaken) throw new Error(`Category name "${TARGETS[slug].name}" already used by "${nameTaken.slug}"; rename it first.`);
    ids[slug] = (await prisma.category.create({ data: { slug, ...TARGETS[slug] }, select: { id: true } })).id;
    console.log(`Created category ${slug}`);
  }

  await prisma.$transaction(
    moves.map((m) => prisma.product.update({ where: { id: m.id }, data: { categoryId: ids[m.toCategory] } })),
  );
  console.log(`Moved ${moves.length} products. Roll back with: --rollback ${file}`);
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
