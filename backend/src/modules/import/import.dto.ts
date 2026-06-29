import { z } from 'zod';

// ─── Manual Import (single product) ──────────────────
export const manualImportSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  description: z.string().min(5).max(5000).trim(),
  category: z.string().min(1).max(1000).trim(),
  brandName: z.string().max(200).trim().optional(),
  supplierName: z.string().max(200).trim().optional(),
  supplierSku: z.string().max(100).trim().optional(),
  costPrice: z.number().positive(),
  markupPercentage: z.number().min(0).max(500).optional(),
  sellingPrice: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  condition: z.enum(['NEW', 'REFURBISHED']).default('NEW'),
  stockQuantity: z.number().int().min(0).default(0),
  stockCpt: z.number().int().min(0).default(0).optional(),
  stockJhb: z.number().int().min(0).default(0).optional(),
  stockDbn: z.number().int().min(0).default(0).optional(),
  lowStockThreshold: z.number().int().min(0).default(5).optional(),
  shippingDays: z.number().int().min(1).max(30).default(3).optional(),
  isFeatured: z.boolean().default(false).optional(),
  tags: z.array(z.string().max(100)).optional(),
  additionalInfo: z.string().max(10000).optional(),
  specifications: z.array(z.object({
    key: z.string().min(1).max(100),
    value: z.string().min(1).max(200),
    sortOrder: z.number().int().optional(),
  })).optional(),
});

export type ManualImportDto = z.infer<typeof manualImportSchema>;

// ─── CSV row schema ──────────────────────────────────
export const csvRowSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  // description is optional — defaults to the product name if not provided
  description: z.string().max(5000).trim().optional().default('').transform((v) => v || ''),
  // category is optional — defaults to 'general' if not provided
  category: z.string().max(1000).trim().optional().default('general'),
  supplier_name: z.string().max(200).trim().optional().default(''),
  supplier_sku: z.string().max(100).trim().optional().default(''),
  brand: z.string().max(200).trim().optional().default(''),
  original_price: z.string().or(z.number()).optional().default('').transform((v) => {
    if (v === '' || v === undefined || v === null) return undefined;
    const cleaned = typeof v === 'string' ? v.replace(/[R$£€,\s]/g, '').trim() : v;
    const n = typeof cleaned === 'number' ? cleaned : parseFloat(String(cleaned));
    return isNaN(n) || n <= 0 ? undefined : n;
  }),
  low_stock_threshold: z.string().or(z.number()).optional().default('5').transform((v) => {
    const n = typeof v === 'number' ? v : parseInt(String(v).replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? 5 : Math.max(0, n);
  }),
  shipping_days: z.string().or(z.number()).optional().default('3').transform((v) => {
    const n = typeof v === 'number' ? v : parseInt(String(v).replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? 3 : Math.min(30, Math.max(1, n));
  }),
  is_featured: z.string().or(z.boolean()).optional().default('').transform((v) => {
    if (typeof v === 'boolean') return v;
    return v === 'true' || v === '1' || v === 'yes';
  }),
  cost_price: z.string().or(z.number()).optional().transform((v) => {
    // If empty or undefined, return undefined to skip row
    if (v === '' || v === undefined || v === null) return undefined;
    // Strip currency symbols (R, $, £, €) and thousands separators
    const cleaned = typeof v === 'string' ? v.replace(/[R$£€,\s]/g, '').trim() : v;
    const n = typeof cleaned === 'number' ? cleaned : parseFloat(String(cleaned));
    if (isNaN(n) || n <= 0) return undefined; // Return undefined instead of throwing error
    return n;
  }),
  image_url: z.string().optional().default(''),
  condition: z.string().optional().default('NEW').transform((v) => {
    const upper = v.toUpperCase().trim();
    return upper === 'REFURBISHED' || upper === 'USED' || upper === 'REFURB' ? 'REFURBISHED' : 'NEW';
  }),
  stock_quantity: z.string().or(z.number()).optional().default('0').transform((v) => {
    const n = typeof v === 'number' ? v : parseInt(String(v).replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? 0 : Math.max(0, n);
  }),
  markup_percentage: z.string().or(z.number()).optional().default('').transform((v) => {
    if (v === '' || v === undefined || v === null) return undefined;
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? undefined : n;
  }),
  // selling_price — when provided, used directly instead of markup calculation
  selling_price: z.string().or(z.number()).optional().default('').transform((v) => {
    if (v === '' || v === undefined || v === null) return undefined;
    const cleaned = typeof v === 'string' ? v.replace(/[R$£€,\s]/g, '').trim() : v;
    const n = typeof cleaned === 'number' ? cleaned : parseFloat(String(cleaned));
    return isNaN(n) || n <= 0 ? undefined : n;
  }),
  stock_cpt: z.string().or(z.number()).optional().default('0').transform((v) => {
    const n = typeof v === 'number' ? v : parseInt(String(v).replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? 0 : Math.max(0, n);
  }),
  stock_jhb: z.string().or(z.number()).optional().default('0').transform((v) => {
    const n = typeof v === 'number' ? v : parseInt(String(v).replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? 0 : Math.max(0, n);
  }),
  stock_dbn: z.string().or(z.number()).optional().default('0').transform((v) => {
    const n = typeof v === 'number' ? v : parseInt(String(v).replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? 0 : Math.max(0, n);
  }),
  tags: z.string().optional().default(''),
  additional_info: z.string().max(10000).optional().default(''),
  specifications: z.string().optional().default(''),
});

export type CsvRowDto = z.infer<typeof csvRowSchema>;

// ─── Bulk import settings ────────────────────────────
export const bulkImportSettingsSchema = z.object({
  globalMarkup: z.number().min(0).max(500).default(35),
  skipDuplicates: z.boolean().default(true),
  uploadImages: z.boolean().default(true),
  addVatToCost: z.boolean().default(false),
  vatRate: z.number().min(0).max(100).default(15),
});

export type BulkImportSettings = z.infer<typeof bulkImportSettingsSchema>;

export const updateImportSettingsSchema = z.object({
  globalMarkup: z.number().min(0).max(500),
});

export type UpdateImportSettingsDto = z.infer<typeof updateImportSettingsSchema>;

// ─── Category auto-mapping ───────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'technology': [
    'laptop', 'desktop', 'computer', 'pc', 'tablet', 'monitor', 'printer',
    'scanner', 'server', 'workstation', 'chromebook', 'macbook', 'thinkpad',
    'dell', 'lenovo', 'hp', 'acer', 'asus',
  ],
  'power-solutions': [
    'battery', 'ups', 'inverter', 'solar', 'charger', 'power', 'generator',
    'lithium', 'energy', 'kwh', 'mppt', 'panel', 'backup', 'load shedding',
    'mecer', 'must', 'hubble', 'allgrand', 'deye',
  ],
  'internet-networking': [
    'router', 'switch', 'network', 'wifi', 'access point', 'ap', 'modem',
    'ethernet', 'cable', 'cat6', 'cat5', 'fiber', 'optic', 'antenna',
    'mikrotik', 'ubiquiti', 'unifi', 'tp-link', 'cisco', 'netgear',
  ],
  'accessories': [
    'keyboard', 'mouse', 'headset', 'webcam', 'usb', 'adapter', 'cable',
    'stand', 'bag', 'case', 'dock', 'hub', 'dongle', 'speaker', 'mic',
    'logitech', 'combo', 'wireless', 'bluetooth', 'hdmi', 'displayport',
  ],
};

/**
 * Auto-map a free-text category string to our known category slugs.
 * Returns the matched slug or the original string lowercased.
 */
export function autoMapCategory(input: string): string {
  const lower = input.toLowerCase().trim();

  // Direct slug match
  if (Object.keys(CATEGORY_KEYWORDS).includes(lower)) return lower;

  // Common direct mappings
  const directMap: Record<string, string> = {
    'tech': 'technology',
    'computers': 'technology',
    'laptops': 'technology',
    'power': 'power-solutions',
    'energy': 'power-solutions',
    'solar': 'power-solutions',
    'networking': 'internet-networking',
    'network': 'internet-networking',
    'internet': 'internet-networking',
    'accessory': 'accessories',
  };

  if (directMap[lower]) return directMap[lower];

  // Keyword scan
  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return slug;
    }
  }

  // Fallback: return as-is (will need manual review or new category creation)
  return lower.replace(/\s+/g, '-');
}

/**
 * Calculate selling price from cost + markup.
 */
export function calculateSellingPrice(costPrice: number, markupPercentage: number): number {
  return Math.round(costPrice * (1 + markupPercentage / 100));
}
