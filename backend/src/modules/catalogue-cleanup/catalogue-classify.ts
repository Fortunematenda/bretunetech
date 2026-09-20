/**
 * Strict BretuneTech catalogue classifier.
 * Focus: Networking / CCTV / Wi-Fi only.
 * Fallback = REMOVE. Description is supporting evidence only.
 * Pure functions — safe for dry-run (no DB writes).
 */

export type ClassificationBucket = 'KEEP' | 'REVIEW' | 'REMOVE';
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type FocusArea =
  | 'networking'
  | 'cctv'
  | 'wifi'
  | 'networking_accessories'
  | 'cctv_accessories'
  | 'ambiguous'
  | 'computers'
  | 'storage'
  | 'general_electronics'
  | 'other';

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
  matchedRule: string;
  confidence: Confidence;
  focusArea: FocusArea;
};

function norm(s: string | null | undefined): string {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function includesAny(hay: string, needles: string[]): boolean {
  return needles.some((n) => hay.includes(n.toLowerCase()));
}

function wordOrPhrase(hay: string, phrase: string): boolean {
  const p = phrase.toLowerCase().trim();
  if (!p) return false;
  if (p.includes(' ')) return hay.includes(p);
  // whole-ish word: boundaries or non-alnum neighbours
  const re = new RegExp(`(?:^|[^a-z0-9])${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[^a-z0-9]|$)`, 'i');
  return re.test(hay);
}

function anyWord(hay: string, words: string[]): boolean {
  return words.some((w) => wordOrPhrase(hay, w));
}

/** Primary signals: brand + name + sku + category + tags (NOT full description). */
function primaryBlob(p: ClassifiableProduct): string {
  return norm(
    [
      p.brandName,
      p.name,
      p.displayName,
      p.sku,
      p.categoryName,
      p.categorySlug,
      p.parentSlug,
      ...(p.tags || []).filter((t) => t !== 'catalogue-archived'),
    ].join(' '),
  );
}

/** Description only as light supporting evidence. */
function descriptionBlob(p: ClassifiableProduct): string {
  return norm([(p.shortDescription || '').slice(0, 400), (p.description || '').slice(0, 400)].join(' '));
}

const NETWORKING_PRIORITY_BRANDS = [
  'mikrotik', 'reyee', 'ruijie', 'ubiquiti', 'unifi',
];

const CCTV_PRIORITY_BRANDS = [
  'hikvision', 'hiwatch', 'hiksemi',
];

const WIFI_PRIORITY_BRANDS = [
  'mikrotik', 'reyee', 'ruijie', 'ubiquiti', 'unifi',
];

const SECONDARY_WIFI_BRANDS = [
  'tp-link', 'tplink', 'tenda', 'mercusys', 'd-link', 'dlink', 'netgear',
];

const FALSE_SWITCH = [
  'hdmi switch', 'usb switch', 'kvm switch', 'power switch', 'light switch',
  'electrical switch', 'transfer switch', 'dip switch', 'limit switch',
  'switch mode power', 'switch-mode', 'switched mode',
];

const FALSE_ROUTER = [
  'cnc router', 'wood router', 'router bit', 'plunge router',
];

const FALSE_CAMERA = [
  'webcam', 'dash cam', 'dashcam', 'action camera', 'gopro', 'phone camera',
  'camera bag', 'camera strap', 'camera lens for phone',
];

const OUTSIDE_FOCUS = [
  'laptop', 'notebook', 'chromebook', 'thinkpad', 'macbook', 'latitude', 'vostro', 'elitebook',
  'desktop pc', 'tower pc', 'all-in-one', 'all in one', 'mini pc', 'nuc ',
  'motherboard', 'graphics card', 'geforce', 'radeon', 'rtx ', 'gtx ',
  'core i3', 'core i5', 'core i7', 'core i9', 'ryzen', 'processor intel',
  'printer', 'toner', 'inkjet', 'laserjet', 'cartridge', 'label printer',
  'monitor ', 'gaming mouse', 'gaming keyboard', 'mechanical keyboard', 'keyboard', ' mouse',
  'headset', 'headphone', 'speaker', 'webcam', 'docking station', 'backpack',
  'tablet', 'iphone', 'smartphone', 'samsung galaxy',
  'nvme', 'm.2 ssd', 'solid state drive', 'usb flash', 'flash drive', 'memory card', 'microsd',
  'desktop hdd', 'laptop hdd', 'portable ssd', 'external ssd',
  'ups ', 'inverter', 'solar panel', 'lithium battery pack',
  'gaming chair', 'r-pet', 'recycled pet',
];

const SURVEILLANCE_HDD = [
  'skyhawk', 'wd purple', 'western digital purple', 'surveillance hdd',
  'surveillance hard', 'purple hdd', 'purple hard drive',
];

const NETWORKING_PRODUCT_TYPES = [
  'access point', 'accesspoint', 'ceiling ap', 'outdoor ap', 'indoor ap',
  'wifi 6 ap', 'wi-fi 6 ap', 'wifi 7 ap', 'uniFi ap', 'unifi ap',
  'managed switch', 'unmanaged switch', 'poe switch', 'poé switch', 'gigabit switch',
  'ethernet switch', 'network switch', 'layer 2 switch', 'layer 3 switch', 'l2 switch', 'l3 switch',
  'poe injector', 'poe adapter', 'poe midspan', 'passive poe',
  'wireless bridge', 'point to point', 'point-to-point', 'ptp bridge', 'ptmp',
  'point to multipoint', 'point-to-multipoint',
  'wireless cpe', 'wifi cpe', 'wi-fi cpe', ' outdoor cpe',
  'sfp module', 'sfp+ module', 'sfp transceiver', 'sfp+ transceiver', 'dac cable',
  'fibre media converter', 'fiber media converter',
  'routerboard', 'cloud router', 'edge router', 'edgerouter', 'dream machine',
  'firewall appliance', 'security gateway',
];

const MIKROTIK_SKU_HINTS = [
  'rb-', 'rb4011', 'rb5009', 'ccr', 'crs', 'hex', 'hap ', 'hap ax', 'cap ax',
  'wap ', 'sxt', 'lhg', 'omnitik', 'audience', 'netpower', 'css', 'c52',
];

const UBIQUITI_PRODUCT_HINTS = [
  'unifi', 'uap-', 'usw-', 'udm', 'uxg', 'ucg', 'u6-', 'u7-', 'nanostation',
  'airmax', 'airfiber', 'powerbeam', 'litebeam', 'rocket', 'edgerouter', 'edgeswitch',
  'unifi protect', 'uvc-', 'g4 ', 'g5 ', 'g6 ',
];

const WIFI_PRODUCT_TYPES = [
  'wifi router', 'wi-fi router', 'wireless router', 'mesh wifi', 'mesh wi-fi', 'mesh system',
  'wifi extender', 'wi-fi extender', 'range extender', 'wifi repeater', 'wi-fi repeater',
  'wifi 6', 'wi-fi 6', 'wifi 7', 'wi-fi 7', 'ax1800', 'ax3000', 'ax5400', 'ax6000',
  'deco ', 'eero ', 'orbi ',
];

const CCTV_PRODUCT_TYPES = [
  'ip camera', 'network camera', 'cctv camera', 'bullet camera', 'dome camera',
  'turret camera', 'ptz camera', 'fisheye camera', 'nvr', 'dvr', 'video recorder',
  'ds-2cd', 'ds-2ce', 'ds-2de', 'ds-7616', 'ds-7732', 'ds-7608', 'ds-7604',
  'cctv poe', 'poe nvr', 'camera junction', 'junction box', 'camera bracket',
  'cctv bracket', 'camera mount', 'cctv mount', 'turbo hd', 'acusense',
];

const CCTV_EXCLUDE = [
  'ups', 'ssd', 'usb flash', 'memory card', 'keyboard', 'mouse', 'monitor',
  'nas ', 'switch mode', 'power cord',
];

const KEEP_NETWORKING_CATS = new Set([
  'networking', 'internet-networking', 'routers', 'network-switches', 'access-points',
  'poe-equipment', 'fibre-equipment', 'wireless-solutions', 'outdoor-wireless',
  'point-to-point-links', 'wireless-bridges', 'antennas',
]);

const KEEP_WIFI_CATS = new Set([
  'mesh-wifi-systems', 'wifi-extenders', 'access-points',
]);

const KEEP_CCTV_CATS = new Set([
  'cctv-security', 'cctv-cameras', 'cctv-camera', 'cctv-ip-cameras', 'cctv-nvrs',
  'cctv-dvrs', 'nvrs-dvrs', 'cctv-accessories', 'cameras',
]);

const REVIEW_ACCESSORY_CATS = new Set([
  'network-cables', 'network-cabinets', 'accessories',
]);

const REVIEW_AMBIGUOUS_CATS = new Set([
  'general', 'power-backup', 'power-solutions', 'ups-systems', 'surge-protectors',
  'access-control', 'video-doorbells', 'alarm-systems', 'intercom-systems',
]);

function result(
  bucket: ClassificationBucket,
  reason: string,
  matchedRule: string,
  confidence: Confidence,
  focusArea: FocusArea,
): ClassificationResult {
  return { bucket, reason, matchedRule, confidence, focusArea };
}

function brandIs(primary: string, brands: string[]): boolean {
  return brands.some((b) => primary.includes(b));
}

function isFalseSwitch(primary: string): boolean {
  return includesAny(primary, FALSE_SWITCH);
}

function isFalseRouter(primary: string): boolean {
  return includesAny(primary, FALSE_ROUTER);
}

function isFalseCamera(primary: string): boolean {
  return includesAny(primary, FALSE_CAMERA);
}

function isOutsideFocus(primary: string): boolean {
  return includesAny(primary, OUTSIDE_FOCUS);
}

function isSurveillanceHdd(primary: string): boolean {
  return includesAny(primary, SURVEILLANCE_HDD);
}

function hasNetworkingType(primary: string): boolean {
  if (isFalseSwitch(primary) || isFalseRouter(primary)) return false;
  if (includesAny(primary, NETWORKING_PRODUCT_TYPES)) return true;
  if (anyWord(primary, MIKROTIK_SKU_HINTS)) return true;
  if (includesAny(primary, UBIQUITI_PRODUCT_HINTS.filter((h) => !h.includes('uvc') && !h.includes('protect') && !h.startsWith('g4') && !h.startsWith('g5') && !h.startsWith('g6')))) {
    return true;
  }
  // Careful switch detection: require network context, not lone "switch"
  if (
    wordOrPhrase(primary, 'switch') &&
    (includesAny(primary, ['poe', 'gigabit', 'managed', 'unmanaged', 'ethernet', 'rj45', 'sfp', 'layer', 'port switch', 'ports']) ||
      brandIs(primary, [...NETWORKING_PRIORITY_BRANDS, 'cisco', 'netgear', 'tp-link', 'tplink', 'd-link', 'dlink', 'tenda', 'reyee', 'ruijie']))
  ) {
    return !isFalseSwitch(primary);
  }
  if (
    wordOrPhrase(primary, 'router') &&
    !isFalseRouter(primary) &&
    (brandIs(primary, [...NETWORKING_PRIORITY_BRANDS, ...SECONDARY_WIFI_BRANDS]) ||
      includesAny(primary, ['wifi', 'wi-fi', 'wireless', 'ethernet', 'gigabit', 'ax', 'vpn']))
  ) {
    return true;
  }
  return false;
}

function hasWifiType(primary: string): boolean {
  if (includesAny(primary, WIFI_PRODUCT_TYPES)) return true;
  if (includesAny(primary, ['access point', 'ceiling ap', 'outdoor ap', 'indoor ap', 'wifi ap', 'wi-fi ap'])) return true;
  if (includesAny(primary, ['mesh', 'extender', 'repeater']) && includesAny(primary, ['wifi', 'wi-fi', 'wireless'])) return true;
  return false;
}

function hasCctvType(primary: string): boolean {
  if (isFalseCamera(primary)) return false;
  if (includesAny(primary, CCTV_EXCLUDE)) return false;
  if (includesAny(primary, CCTV_PRODUCT_TYPES)) return true;
  if (isSurveillanceHdd(primary)) return true;
  if (wordOrPhrase(primary, 'camera') && brandIs(primary, [...CCTV_PRIORITY_BRANDS, 'ubiquiti', 'unifi', 'ezviz', 'dahua', 'uniview', 'tp-link', 'tplink'])) {
    return true;
  }
  // NVR/DVR as whole words — avoid NVMe
  if ((wordOrPhrase(primary, 'nvr') || wordOrPhrase(primary, 'dvr')) && !includesAny(primary, ['nvme'])) return true;
  // Hikvision PoE switch for CCTV kits
  if (brandIs(primary, CCTV_PRIORITY_BRANDS) && includesAny(primary, ['poe switch', 'poé switch', 'poe network switch'])) return true;
  return false;
}

function catIn(slug: string, parent: string, set: Set<string>): boolean {
  return set.has(slug) || set.has(parent);
}

export function classifyProduct(p: ClassifiableProduct): ClassificationResult {
  const brand = norm(p.brandName);
  const cat = norm(p.categorySlug);
  const parent = norm(p.parentSlug);
  const primary = primaryBlob(p);
  const desc = descriptionBlob(p);

  // ── Hard REMOVE: clear outside-focus from name/brand/sku/category ─────────
  if (isOutsideFocus(primary) && !hasNetworkingType(primary) && !hasWifiType(primary) && !hasCctvType(primary) && !isSurveillanceHdd(primary)) {
    let focusArea: FocusArea = 'other';
    if (includesAny(primary, ['laptop', 'notebook', 'desktop', 'mini pc', 'motherboard', 'graphics', 'ryzen', 'core i'])) {
      focusArea = 'computers';
    } else if (includesAny(primary, ['ssd', 'hdd', 'nvme', 'flash drive', 'memory card', 'hard drive'])) {
      focusArea = 'storage';
    } else if (includesAny(primary, ['printer', 'monitor', 'keyboard', 'mouse', 'headset', 'speaker', 'tablet', 'phone'])) {
      focusArea = 'general_electronics';
    }
    return result('REMOVE', 'Outside Networking / CCTV / Wi-Fi focus', 'OUTSIDE_FOCUS', 'HIGH', focusArea);
  }

  // Junk import categories (bags / recycled materials)
  if (includesAny(cat, ['material-', 'backpack', 'r-pet', 'recycled']) || includesAny(primary, ['backpack', 'r-pet tote'])) {
    return result('REMOVE', 'Non-catalogue / merchandise category', 'OUTSIDE_FOCUS', 'HIGH', 'other');
  }

  // ── CCTV KEEP ────────────────────────────────────────────────────────────
  if (brandIs(brand, CCTV_PRIORITY_BRANDS) && hasCctvType(primary)) {
    return result('KEEP', `${p.brandName || 'Hikvision'} CCTV equipment`, 'CCTV_APPROVED_BRAND_PRODUCT', 'HIGH', 'cctv');
  }
  if (brandIs(brand, CCTV_PRIORITY_BRANDS) && catIn(cat, parent, KEEP_CCTV_CATS) && !includesAny(primary, CCTV_EXCLUDE)) {
    return result('KEEP', `${p.brandName} in CCTV category`, 'CCTV_APPROVED_BRAND_CATEGORY', 'HIGH', 'cctv');
  }
  if (
    brandIs(brand, CCTV_PRIORITY_BRANDS) &&
    (includesAny(primary, ['camera', 'nvr', 'dvr', 'ds-2cd', 'ds-2ce', 'acusense', 'turret', 'bullet', 'dome']) ||
      includesAny(desc, ['ip camera', 'network video recorder'])) &&
    !includesAny(primary, CCTV_EXCLUDE)
  ) {
    return result('KEEP', `${p.brandName} camera/recorder`, 'CCTV_APPROVED_BRAND_PRODUCT', 'HIGH', 'cctv');
  }
  if (brandIs(brand, CCTV_PRIORITY_BRANDS) && includesAny(primary, ['poe switch', 'smart poe', 'gigabit smart poe'])) {
    return result('KEEP', `${p.brandName} CCTV PoE switch`, 'CCTV_POE_SWITCH', 'HIGH', 'cctv');
  }
  if (brandIs(brand, CCTV_PRIORITY_BRANDS) && includesAny(primary, ['ups', 'ssd', 'flash'])) {
    return result('REVIEW', `${p.brandName} peripheral/power — confirm CCTV relevance`, 'CCTV_BRAND_NON_CORE', 'LOW', 'ambiguous');
  }
  if (isSurveillanceHdd(primary)) {
    return result('KEEP', 'Surveillance HDD (SkyHawk / WD Purple)', 'CCTV_SURVEILLANCE_HDD', 'HIGH', 'cctv');
  }
  if (hasCctvType(primary) && catIn(cat, parent, KEEP_CCTV_CATS)) {
    return result('KEEP', 'CCTV product in CCTV category', 'CCTV_CATEGORY_PRODUCT', 'HIGH', 'cctv');
  }
  if (brandIs(primary, ['ubiquiti', 'unifi']) && includesAny(primary, ['protect', 'uvc-', 'g4 ', 'g5 ', 'g6 ', 'camera'])) {
    return result('KEEP', 'UniFi Protect CCTV camera', 'CCTV_UNIFI_PROTECT', 'HIGH', 'cctv');
  }

  // ── Networking KEEP (priority brands + clear product type) ───────────────
  if (brandIs(brand, NETWORKING_PRIORITY_BRANDS) && hasNetworkingType(primary) && !isFalseSwitch(primary) && !isFalseRouter(primary)) {
    const kind = includesAny(primary, ['switch']) ? 'switch'
      : includesAny(primary, ['access point', ' ap', 'cap ', 'uap']) ? 'access point'
        : includesAny(primary, ['router', 'hex', 'hap', 'udm', 'gateway']) ? 'router'
          : includesAny(primary, ['bridge', 'cpe', 'ptp', 'nanostation', 'powerbeam']) ? 'wireless CPE/bridge'
            : 'networking equipment';
    return result('KEEP', `${p.brandName} ${kind}`, 'NETWORKING_APPROVED_BRAND_PRODUCT', 'HIGH', 'networking');
  }
  if (brandIs(brand, NETWORKING_PRIORITY_BRANDS) && catIn(cat, parent, KEEP_NETWORKING_CATS)) {
    return result('KEEP', `${p.brandName} in networking category`, 'NETWORKING_APPROVED_BRAND_CATEGORY', 'HIGH', 'networking');
  }
  if (brandIs(brand, NETWORKING_PRIORITY_BRANDS) && anyWord(primary, MIKROTIK_SKU_HINTS)) {
    return result('KEEP', 'MikroTik RouterBOARD / SKU family', 'NETWORKING_MIKROTIK_SKU', 'HIGH', 'networking');
  }
  if (hasNetworkingType(primary) && catIn(cat, parent, KEEP_NETWORKING_CATS) && !isFalseSwitch(primary)) {
    return result('KEEP', 'Networking product type + category', 'NETWORKING_CATEGORY_PRODUCT', 'HIGH', 'networking');
  }

  // ── Wi-Fi KEEP (priority brands + clear Wi-Fi type) ───────────────────────
  if (brandIs(brand, WIFI_PRIORITY_BRANDS) && hasWifiType(primary)) {
    return result('KEEP', `${p.brandName} Wi-Fi equipment`, 'WIFI_APPROVED_BRAND_PRODUCT', 'HIGH', 'wifi');
  }
  if (brandIs(brand, WIFI_PRIORITY_BRANDS) && catIn(cat, parent, KEEP_WIFI_CATS)) {
    return result('KEEP', `${p.brandName} in Wi-Fi category`, 'WIFI_APPROVED_BRAND_CATEGORY', 'HIGH', 'wifi');
  }
  if (hasWifiType(primary) && catIn(cat, parent, KEEP_WIFI_CATS)) {
    return result('KEEP', 'Wi-Fi product in Wi-Fi category', 'WIFI_CATEGORY_PRODUCT', 'HIGH', 'wifi');
  }
  // Secondary Wi-Fi brands only KEEP with clear Wi-Fi type AND category/name evidence
  if (brandIs(brand, SECONDARY_WIFI_BRANDS) && hasWifiType(primary) && (catIn(cat, parent, KEEP_WIFI_CATS) || catIn(cat, parent, KEEP_NETWORKING_CATS))) {
    return result('KEEP', `${p.brandName} Wi-Fi device (clear type + category)`, 'WIFI_SECONDARY_BRAND_CLEAR', 'MEDIUM', 'wifi');
  }

  // ── REVIEW: related but needs judgement ──────────────────────────────────
  if (brandIs(brand, NETWORKING_PRIORITY_BRANDS) || brandIs(brand, CCTV_PRIORITY_BRANDS) || brandIs(brand, WIFI_PRIORITY_BRANDS)) {
    return result(
      'REVIEW',
      `${p.brandName} priority brand but product type unclear`,
      'PRIORITY_BRAND_UNCLEAR_TYPE',
      'MEDIUM',
      'ambiguous',
    );
  }

  if (hasNetworkingType(primary) && !isFalseSwitch(primary)) {
    return result('REVIEW', 'Generic / non-priority networking equipment', 'GENERIC_NETWORKING_EQUIPMENT', 'MEDIUM', 'networking_accessories');
  }
  if (hasWifiType(primary)) {
    return result('REVIEW', 'Generic / secondary-brand Wi-Fi equipment', 'GENERIC_WIFI_EQUIPMENT', 'MEDIUM', 'networking_accessories');
  }
  if (hasCctvType(primary) && !isFalseCamera(primary)) {
    return result('REVIEW', 'Generic CCTV equipment', 'GENERIC_CCTV_EQUIPMENT', 'MEDIUM', 'cctv_accessories');
  }

  if (
    includesAny(primary, [
      'cat5e', 'cat6', 'cat6a', 'rj45', 'patch panel', 'patch cord', 'keystone',
      'network cabinet', 'rack mount', 'ethernet cable', 'fibre cable', 'fiber cable',
      'sfp ', 'media converter', 'cable manager',
    ])
  ) {
    return result('REVIEW', 'Networking accessory / cabling / rack', 'NETWORKING_ACCESSORY', 'MEDIUM', 'networking_accessories');
  }

  if (
    includesAny(primary, ['poe', 'injector', 'midspan']) &&
    !includesAny(primary, ['camera lens', 'phone'])
  ) {
    return result('REVIEW', 'Generic PoE equipment', 'GENERIC_POE_EQUIPMENT', 'MEDIUM', 'networking_accessories');
  }

  if (catIn(cat, parent, REVIEW_ACCESSORY_CATS) || catIn(cat, parent, KEEP_NETWORKING_CATS) || catIn(cat, parent, KEEP_CCTV_CATS) || catIn(cat, parent, KEEP_WIFI_CATS)) {
    return result('REVIEW', 'Category suggests networking/CCTV/Wi-Fi but name is weak', 'CATEGORY_WEAK_NAME', 'LOW', 'ambiguous');
  }

  if (catIn(cat, parent, REVIEW_AMBIGUOUS_CATS) && includesAny(primary, ['router', 'switch', 'camera', 'nvr', 'ap ', 'wifi', 'wi-fi', 'poe'])) {
    // Weak name tokens in general — still REVIEW not KEEP
    return result('REVIEW', 'Ambiguous product with weak networking/CCTV signal', 'AMBIGUOUS_WEAK_SIGNAL', 'LOW', 'ambiguous');
  }

  if (brandIs(brand, SECONDARY_WIFI_BRANDS)) {
    return result('REVIEW', `${p.brandName} brand — confirm Networking/Wi-Fi relevance`, 'SECONDARY_BRAND_REVIEW', 'LOW', 'ambiguous');
  }

  if (brand === 'port' || brand === 'linkbasic') {
    return result('REVIEW', `${p.brandName || 'Port'} — often cabling/accessories; needs judgement`, 'ACCESSORY_BRAND_REVIEW', 'LOW', 'networking_accessories');
  }

  // Description-only hints must NOT KEEP — at most REVIEW if strong phrase
  if (
    includesAny(desc, ['poe switch', 'access point', 'ip camera', 'network video recorder', 'mesh wifi']) &&
    !isOutsideFocus(primary)
  ) {
    return result('REVIEW', 'Description suggests focus area; name/brand weak', 'DESCRIPTION_ONLY_HINT', 'LOW', 'ambiguous');
  }

  // ── Default REMOVE ───────────────────────────────────────────────────────
  return result(
    'REMOVE',
    'Does not confidently match Networking, CCTV or Wi-Fi',
    'OUTSIDE_FOCUS',
    'HIGH',
    'other',
  );
}

export function escapeCsv(value: unknown): string {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function classifiedRowsToCsv(rows: Array<Record<string, unknown>>): string {
  const headers = [
    'id', 'classification', 'reason', 'matchedRule', 'confidence', 'focusArea',
    'name', 'sku', 'brand', 'category', 'price', 'stock', 'status', 'isActive', 'url',
  ];
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h])).join(','));
  }
  return lines.join('\n');
}

export function buildBreakdown(rows: Array<{ classification: ClassificationBucket; focusArea?: FocusArea }>) {
  const empty = () => ({ networking: 0, cctv: 0, wifi: 0, networking_accessories: 0, cctv_accessories: 0, ambiguous: 0, computers: 0, storage: 0, general_electronics: 0, other: 0 });
  const keep = empty();
  const review = empty();
  const remove = empty();

  for (const r of rows) {
    const area = r.focusArea || 'other';
    const bucket = r.classification === 'KEEP' ? keep : r.classification === 'REVIEW' ? review : remove;
    if (area in bucket) (bucket as any)[area] += 1;
    else bucket.other += 1;
  }

  return {
    KEEP: {
      Networking: keep.networking,
      CCTV: keep.cctv,
      'Wi-Fi': keep.wifi,
    },
    REVIEW: {
      'Networking accessories': review.networking_accessories + review.networking,
      'CCTV accessories': review.cctv_accessories + review.cctv,
      'Other ambiguous': review.ambiguous + review.wifi + review.other,
    },
    REMOVE: {
      Computers: remove.computers,
      'General electronics': remove.general_electronics,
      Storage: remove.storage,
      Other: remove.other + remove.networking + remove.cctv + remove.wifi + remove.networking_accessories + remove.cctv_accessories + remove.ambiguous,
    },
  };
}
