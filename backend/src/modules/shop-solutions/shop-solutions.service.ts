import prisma from '../../lib/prisma';
import { logger } from '../../lib/logger';
import {
  ShopSolutionsSettings,
  shopSolutionsSettingsSchema,
} from './shop-solutions.dto';

const log = logger.child('ShopSolutions');
const SETTINGS_KEY = 'shop_by_solutions';

export const DEFAULT_SHOP_SOLUTIONS: ShopSolutionsSettings = {
  sectionTitle: 'Shop by Solution',
  sectionSubtitle: 'Find products matched to your business need',
  items: [
    {
      id: 'networking',
      title: 'Networking & WiFi',
      slug: 'networking',
      desc: 'Routers, switches, access points',
      icon: 'wifi',
      color: 'bg-blue-500',
      enabled: true,
      sortOrder: 0,
    },
    {
      id: 'cctv-security',
      title: 'CCTV & Security',
      slug: 'cctv-security',
      desc: 'Cameras, NVRs, access control',
      icon: 'camera',
      color: 'bg-purple-500',
      enabled: true,
      sortOrder: 1,
    },
    {
      id: 'power-backup',
      title: 'Power & Backup',
      slug: 'power-backup',
      desc: 'UPS, inverters, batteries',
      icon: 'zap',
      color: 'bg-yellow-500',
      enabled: true,
      sortOrder: 2,
    },
    {
      id: 'computers-laptops',
      title: 'Computers & Laptops',
      slug: 'computers-laptops',
      desc: 'Desktops, laptops, mini PCs',
      icon: 'monitor',
      color: 'bg-cyan-500',
      enabled: true,
      sortOrder: 3,
    },
    {
      id: 'wireless-solutions',
      title: 'Wireless Solutions',
      slug: 'wireless-solutions',
      desc: 'Outdoor links, antennas, bridges',
      icon: 'network',
      color: 'bg-pink-500',
      enabled: true,
      sortOrder: 4,
    },
    {
      id: 'printers-office',
      title: 'Printers & Office',
      slug: 'printers-office',
      desc: 'Printers, scanners, ink & toner',
      icon: 'printer',
      color: 'bg-green-500',
      enabled: true,
      sortOrder: 5,
    },
  ],
};

function normalize(settings: ShopSolutionsSettings): ShopSolutionsSettings {
  const items = [...settings.items]
    .map((item, index) => ({
      ...item,
      id: item.id || item.slug,
      sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : index,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return { ...settings, items };
}

export class ShopSolutionsService {
  async getSettings(): Promise<ShopSolutionsSettings> {
    try {
      const row = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
      if (!row?.value) return normalize(DEFAULT_SHOP_SOLUTIONS);
      const parsed = shopSolutionsSettingsSchema.safeParse(JSON.parse(row.value));
      if (!parsed.success) {
        log.warn('Invalid shop solutions settings — using defaults', { issues: parsed.error.issues });
        return normalize(DEFAULT_SHOP_SOLUTIONS);
      }
      return normalize(parsed.data);
    } catch (err) {
      log.error('Failed to load shop solutions', { err });
      return normalize(DEFAULT_SHOP_SOLUTIONS);
    }
  }

  /** Public storefront payload — enabled items only. */
  async getPublic() {
    const settings = await this.getSettings();
    return {
      sectionTitle: settings.sectionTitle,
      sectionSubtitle: settings.sectionSubtitle,
      items: settings.items.filter((i) => i.enabled),
    };
  }

  async updateSettings(input: unknown): Promise<ShopSolutionsSettings> {
    const parsed = shopSolutionsSettingsSchema.parse(input);
    const normalized = normalize(parsed);
    await prisma.setting.upsert({
      where: { key: SETTINGS_KEY },
      create: {
        key: SETTINGS_KEY,
        value: JSON.stringify(normalized),
        group: 'storefront',
        description: 'Shop by Solution homepage cards',
        isPublic: true,
      },
      update: {
        value: JSON.stringify(normalized),
        group: 'storefront',
        description: 'Shop by Solution homepage cards',
        isPublic: true,
      },
    });
    return normalized;
  }

  async resetToDefaults(): Promise<ShopSolutionsSettings> {
    const defaults = normalize(DEFAULT_SHOP_SOLUTIONS);
    await this.updateSettings(defaults);
    return defaults;
  }
}

export const shopSolutionsService = new ShopSolutionsService();
