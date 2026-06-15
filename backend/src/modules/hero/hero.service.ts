import { HeroSettings } from './hero.dto';
import prisma from '../../lib/prisma';
import { logger } from '../../lib/logger';

const log = logger.child('HeroService');

const HERO_SETTINGS_KEY = 'hero_settings';

// Default hero settings
const DEFAULT_HERO_SETTINGS: HeroSettings = {
  badge: {
    text: 'Enterprise Solutions',
    visible: true,
  },
  headline: 'Power Your Business',
  headlineHighlight: 'With Technology',
  subheadline: 'Premium networking, security, and power solutions for South African enterprises',
  ctaButtons: [
    { text: 'Explore Products', link: '/products', style: 'primary' },
    { text: 'Our Services', link: '/services', style: 'secondary' },
  ],
  trustIndicators: [
    { text: 'Certified Partners', visible: true },
    { text: '24/7 Support', visible: true },
    { text: 'Nationwide Delivery', visible: true },
  ],
  backgroundGradient: 'linear-gradient(135deg, #001a3d 0%, #003d7a 50%, #002244 100%)',
  nodes: [
    { x: 10, y: 20, size: '12px', delay: 0, color: '#003d7a' },
    { x: 25, y: 60, size: '16px', delay: 0.5, color: '#0055a4' },
    { x: 15, y: 80, size: '10px', delay: 1, color: '#003d7a' },
    { x: 80, y: 15, size: '14px', delay: 0.3, color: '#003d7a' },
    { x: 90, y: 50, size: '18px', delay: 0.8, color: '#0055a4' },
    { x: 75, y: 75, size: '12px', delay: 1.2, color: '#003d7a' },
    { x: 50, y: 30, size: '20px', delay: 0.2, color: '#f97316' },
    { x: 45, y: 70, size: '15px', delay: 0.7, color: '#f97316' },
  ],
  connectionLines: [
    { x1: 10, y1: 20, x2: 25, y2: 60, delay: 0.2 },
    { x1: 25, y1: 60, x2: 15, y2: 80, delay: 0.4 },
    { x1: 80, y1: 15, x2: 90, y2: 50, delay: 0.3 },
    { x1: 90, y1: 50, x2: 75, y2: 75, delay: 0.5 },
    { x1: 50, y1: 30, x2: 25, y2: 60, delay: 0.6 },
    { x1: 50, y1: 30, x2: 90, y2: 50, delay: 0.7 },
    { x1: 45, y1: 70, x2: 15, y2: 80, delay: 0.8 },
    { x1: 45, y1: 70, x2: 75, y2: 75, delay: 0.9 },
  ],
  wifiSignals: [
    { x: 50, y: 30, delay: 0 },
    { x: 25, y: 60, delay: 1 },
    { x: 90, y: 50, delay: 2 },
  ],
  particleConfig: {
    count: 20,
    speed: 4,
    sizeMin: 2,
    sizeMax: 6,
  },
  animationSpeed: {
    nodeDuration: 4,
    lineDuration: 3,
    wifiDuration: 2,
    particleDuration: 4,
  },
  height: 'clamp(280px, 35vh, 400px)',
};

export class HeroService {
  private cache: HeroSettings | null = null;

  async getSettings(): Promise<HeroSettings> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const row = await prisma.setting.findUnique({ where: { key: HERO_SETTINGS_KEY } });
      if (row) {
        this.cache = JSON.parse(row.value) as HeroSettings;
        return this.cache;
      }
    } catch (err) {
      log.error('Failed to load hero settings from DB', { error: (err as Error).message });
    }

    this.cache = DEFAULT_HERO_SETTINGS;
    return this.cache;
  }

  async updateSettings(settings: Partial<HeroSettings>): Promise<HeroSettings> {
    const current = await this.getSettings();
    const merged = { ...current, ...settings } as HeroSettings;

    try {
      await prisma.setting.upsert({
        where: { key: HERO_SETTINGS_KEY },
        update: { value: JSON.stringify(merged) },
        create: {
          key: HERO_SETTINGS_KEY,
          value: JSON.stringify(merged),
          group: 'hero',
          description: 'Hero banner settings',
          isPublic: true,
        },
      });
      log.info('Hero settings saved to database');
    } catch (err) {
      log.error('Failed to save hero settings to DB', { error: (err as Error).message });
    }

    this.cache = merged;
    return this.cache;
  }

  async resetToDefaults(): Promise<HeroSettings> {
    try {
      await prisma.setting.upsert({
        where: { key: HERO_SETTINGS_KEY },
        update: { value: JSON.stringify(DEFAULT_HERO_SETTINGS) },
        create: {
          key: HERO_SETTINGS_KEY,
          value: JSON.stringify(DEFAULT_HERO_SETTINGS),
          group: 'hero',
          description: 'Hero banner settings',
          isPublic: true,
        },
      });
    } catch (err) {
      log.error('Failed to reset hero settings in DB', { error: (err as Error).message });
    }

    this.cache = DEFAULT_HERO_SETTINGS;
    return this.cache;
  }
}

export const heroService = new HeroService();
