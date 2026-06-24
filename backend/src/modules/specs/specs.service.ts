import prisma from '../../lib/prisma';
import { logger } from '../../lib/logger';

const log = logger.child('specs-service');

// ─── Known canonical spec names ──────────────────────────────────────────────
const CANONICAL_NAMES: Record<string, string> = {
  power: 'Power',
  wattage: 'Power',
  watts: 'Power',
  voltage: 'Voltage',
  volts: 'Voltage',
  volt: 'Voltage',
  frequency: 'Frequency',
  ports: 'Ports',
  port: 'Ports',
  speed: 'Speed',
  'wifi standard': 'WiFi Standard',
  'wi-fi standard': 'WiFi Standard',
  wifi: 'WiFi Standard',
  'wireless standard': 'WiFi Standard',
  dimensions: 'Dimensions',
  dimension: 'Dimensions',
  size: 'Dimensions',
  weight: 'Weight',
  colour: 'Colour',
  color: 'Colour',
  material: 'Material',
  warranty: 'Warranty',
  capacity: 'Capacity',
  'operating temperature': 'Operating Temperature',
  temperature: 'Operating Temperature',
  interface: 'Interface',
  connector: 'Connector',
  connectors: 'Connector',
  standard: 'Standard',
  protocol: 'Protocol',
  compatibility: 'Compatibility',
  'data rate': 'Data Rate',
  datarate: 'Data Rate',
  throughput: 'Throughput',
  range: 'Range',
  antenna: 'Antenna',
  antennas: 'Antenna',
  cpu: 'CPU',
  processor: 'CPU',
  memory: 'Memory',
  ram: 'Memory',
  storage: 'Storage',
  flash: 'Flash Storage',
  'flash storage': 'Flash Storage',
  poe: 'PoE',
  'poe standard': 'PoE Standard',
  input: 'Input',
  output: 'Output',
  current: 'Current',
  ampere: 'Current',
  amps: 'Current',
  band: 'Band',
  bands: 'Band',
  'operating system': 'Operating System',
  os: 'Operating System',
  certification: 'Certification',
  certifications: 'Certification',
  mounting: 'Mounting',
  'mount type': 'Mounting',
  'ip rating': 'IP Rating',
  iprating: 'IP Rating',
  ip: 'IP Rating',
  model: 'Model',
  'model number': 'Model',
  sku: 'SKU',
  'part number': 'Part Number',
};

export interface ParsedSpec {
  key: string;
  value: string;
  sortOrder?: number;
}

export interface ExtractResult {
  scanned: number;
  specsCreated: number;
  duplicatesSkipped: number;
  errors: number;
  details: { id: string; name: string; extracted: number; status: 'ok' | 'skipped' | 'error'; reason?: string }[];
}

class SpecsService {
  // ─── Normalize a spec key to canonical form ───────────────────────────────
  normalizeKey(raw: string): string {
    const cleaned = raw.trim().toLowerCase().replace(/[_\-/]+/g, ' ').replace(/\s+/g, ' ');
    return CANONICAL_NAMES[cleaned] || raw.trim().replace(/\b\w/g, c => c.toUpperCase());
  }

  // ─── Parse additional info text into key-value specs ─────────────────────
  parseAdditionalInfo(text: string): ParsedSpec[] {
    if (!text || !text.trim()) return [];

    const specs: ParsedSpec[] = [];
    const seen = new Set<string>();

    // Split by semicolon OR newline, keeping entries
    const segments = text
      .split(/[;\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const segment of segments) {
      let key = '';
      let value = '';

      // Try: "Key: Value" or "Key = Value" or "Key - Value" or "Key : Value"
      const colonMatch = segment.match(/^([^:=\-]{1,80})[:\-=]\s*(.+)$/);
      if (colonMatch) {
        key = colonMatch[1].trim();
        value = colonMatch[2].trim();
      } else {
        // Try comma-separated "Key, Value" (only if short and looks like a spec)
        const commaMatch = segment.match(/^([^,]{1,50}),\s*(.+)$/);
        if (commaMatch && commaMatch[1].split(' ').length <= 4) {
          key = commaMatch[1].trim();
          value = commaMatch[2].trim();
        }
      }

      // Validate
      if (!key || !value) continue;
      if (key.length > 100) continue;
      if (value.length > 200) { value = value.substring(0, 200); }
      if (/^\d+$/.test(key)) continue; // pure numeric key
      if (key.split(' ').length > 6) continue; // key too long to be a spec name

      const normalizedKey = this.normalizeKey(key);
      const dedupKey = normalizedKey.toLowerCase();

      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      specs.push({ key: normalizedKey, value });
    }

    return specs;
  }

  // ─── Remove parsed specs from the additional info text ───────────────────
  removeSpecsFromText(text: string, specs: ParsedSpec[]): string {
    let result = text;
    for (const spec of specs) {
      // Remove lines that match "Key: Value", "Key = Value", "Key - Value"
      const escaped = spec.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Also match original raw form
      result = result
        .replace(new RegExp(`^${escaped}\\s*[:=\\-]\\s*.*?(;|$)`, 'gmi'), '')
        .replace(new RegExp(`^[^;\\n]*${escaped}\\s*[:=\\-]\\s*.*?(;|$)`, 'gmi'), '');
    }
    return result.replace(/^[\s;,]+|[\s;,]+$/g, '').replace(/\n{3,}/g, '\n\n').trim();
  }

  // ─── Extract specs for a single product ──────────────────────────────────
  async extractForProduct(
    productId: string,
    options: { onlyIfEmpty?: boolean; replace?: boolean; removeFromAdditionalInfo?: boolean }
  ): Promise<{ extracted: number; skipped: number; reason?: string }> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        additionalInfo: true,
        specifications: { select: { key: true } },
      },
    });

    if (!product) return { extracted: 0, skipped: 0, reason: 'Not found' };
    if (!product.additionalInfo?.trim()) return { extracted: 0, skipped: 0, reason: 'No additional info' };

    const existingKeys = new Set(product.specifications.map(s => s.key.toLowerCase()));

    // If onlyIfEmpty and product already has specs, skip
    if (options.onlyIfEmpty && existingKeys.size > 0) {
      return { extracted: 0, skipped: 1, reason: 'Already has specs' };
    }

    const parsed = this.parseAdditionalInfo(product.additionalInfo);
    if (parsed.length === 0) return { extracted: 0, skipped: 0, reason: 'No parseable specs found' };

    // Filter duplicates unless replacing
    const toCreate = options.replace
      ? parsed
      : parsed.filter(s => !existingKeys.has(s.key.toLowerCase()));

    if (toCreate.length === 0) return { extracted: 0, skipped: parsed.length, reason: 'All duplicates' };

    // If replacing, delete existing first
    if (options.replace) {
      await prisma.productSpecification.deleteMany({ where: { productId } });
    }

    // Create specs
    await prisma.productSpecification.createMany({
      data: toCreate.map((s, i) => ({
        productId,
        key: s.key,
        value: s.value,
        sortOrder: (product.specifications.length + i),
      })),
      skipDuplicates: true,
    });

    // Optionally clean additionalInfo
    if (options.removeFromAdditionalInfo) {
      const cleaned = this.removeSpecsFromText(product.additionalInfo, toCreate);
      await prisma.product.update({
        where: { id: productId },
        data: { additionalInfo: cleaned || null },
      });
    }

    return { extracted: toCreate.length, skipped: parsed.length - toCreate.length };
  }

  // ─── Bulk extract specs from all products ────────────────────────────────
  async bulkExtract(options: {
    onlyWithoutSpecs: boolean;
    replace: boolean;
    removeFromAdditionalInfo: boolean;
  }): Promise<ExtractResult> {
    const where: any = {
      isDeleted: false,
      NOT: [{ additionalInfo: null }, { additionalInfo: '' }],
    };

    if (options.onlyWithoutSpecs) {
      where.specifications = { none: {} };
    }

    const products = await prisma.product.findMany({
      where,
      select: { id: true, name: true },
    });

    let specsCreated = 0;
    let duplicatesSkipped = 0;
    let errors = 0;
    const details: ExtractResult['details'] = [];

    for (const product of products) {
      try {
        const result = await this.extractForProduct(product.id, {
          onlyIfEmpty: false,
          replace: options.replace,
          removeFromAdditionalInfo: options.removeFromAdditionalInfo,
        });

        specsCreated += result.extracted;
        duplicatesSkipped += result.skipped;

        if (result.reason === 'Already has specs' && !options.replace) {
          details.push({ id: product.id, name: product.name, extracted: 0, status: 'skipped', reason: result.reason });
        } else {
          details.push({ id: product.id, name: product.name, extracted: result.extracted, status: 'ok', reason: result.reason });
        }
      } catch (err: any) {
        errors++;
        log.error('Spec extraction failed', { id: product.id, error: err.message });
        details.push({ id: product.id, name: product.name, extracted: 0, status: 'error', reason: err.message });
      }
    }

    log.info('Bulk spec extraction complete', { scanned: products.length, specsCreated, duplicatesSkipped, errors });

    return { scanned: products.length, specsCreated, duplicatesSkipped, errors, details };
  }

  // ─── Auto-extract specs when a product is saved ──────────────────────────
  async autoExtractOnSave(productId: string, additionalInfo: string): Promise<void> {
    if (!additionalInfo?.trim()) return;
    const parsed = this.parseAdditionalInfo(additionalInfo);
    if (parsed.length === 0) return;

    const existing = await prisma.productSpecification.findMany({
      where: { productId },
      select: { key: true },
    });

    const existingKeys = new Set(existing.map(s => s.key.toLowerCase()));
    const toCreate = parsed.filter(s => !existingKeys.has(s.key.toLowerCase()));
    if (toCreate.length === 0) return;

    await prisma.productSpecification.createMany({
      data: toCreate.map((s, i) => ({
        productId,
        key: s.key,
        value: s.value,
        sortOrder: existing.length + i,
      })),
      skipDuplicates: true,
    });

    log.info('Auto-extracted specs on save', { productId, count: toCreate.length });
  }
}

export const specsService = new SpecsService();
