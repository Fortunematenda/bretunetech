import { z } from 'zod';

// ─── Manual Import (single product) ──────────────────
export const manualImportSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  description: z.string().min(5).max(5000).trim(),
  category: z.string().min(1).max(100).trim(),
  supplierName: z.string().max(200).trim().optional(),
  supplierSku: z.string().max(100).trim().optional(),
  costPrice: z.number().positive(),
  markupPercentage: z.number().min(0).max(500).optional(),
  sellingPrice: z.number().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  condition: z.enum(['NEW', 'REFURBISHED']).default('NEW'),
  stockQuantity: z.number().int().min(0).default(0),
  tags: z.array(z.string().max(100)).optional(),
});

export type ManualImportDto = z.infer<typeof manualImportSchema>;

// ─── CSV row schema ──────────────────────────────────
export const csvRowSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  description: z.string().min(5).max(5000).trim(),
  category: z.string().min(1).max(100).trim(),
  supplier_name: z.string().max(200).trim().optional().default(''),
  supplier_sku: z.string().max(100).trim().optional().default(''),
  cost_price: z.string().or(z.number()).transform((v) => {
    const n = typeof v === 'number' ? v : parseFloat(v);
    if (isNaN(n) || n <= 0) throw new Error('cost_price must be a positive number');
    return n;
  }),
  image_url: z.string().optional().default(''),
  condition: z.enum(['NEW', 'REFURBISHED']).optional().default('NEW'),
  stock_quantity: z.string().or(z.number()).optional().default('0').transform((v) => {
    const n = typeof v === 'number' ? v : parseInt(String(v), 10);
    return isNaN(n) ? 0 : Math.max(0, n);
  }),
  markup_percentage: z.string().or(z.number()).optional().default('').transform((v) => {
    if (v === '' || v === undefined || v === null) return undefined;
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return isNaN(n) ? undefined : n;
  }),
  tags: z.string().optional().default(''),
});

export type CsvRowDto = z.infer<typeof csvRowSchema>;

// ─── Bulk import settings ────────────────────────────
export const bulkImportSettingsSchema = z.object({
  globalMarkup: z.number().min(0).max(500).default(25),
  skipDuplicates: z.boolean().default(true),
  uploadImages: z.boolean().default(true),
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
