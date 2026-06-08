import { HeroSettings } from './hero.dto';

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
  private settings: HeroSettings | null = null;

  async getSettings(): Promise<HeroSettings> {
    if (this.settings) {
      return this.settings;
    }

    // In production, fetch from database
    // For now, return default settings
    this.settings = DEFAULT_HERO_SETTINGS;
    return this.settings;
  }

  async updateSettings(settings: Partial<HeroSettings>): Promise<HeroSettings> {
    // Merge with existing settings
    const current = await this.getSettings();
    this.settings = { ...current, ...settings } as HeroSettings;

    // In production, save to database
    // For now, just update in memory

    return this.settings;
  }

  async resetToDefaults(): Promise<HeroSettings> {
    this.settings = DEFAULT_HERO_SETTINGS;
    return this.settings;
  }
}

export const heroService = new HeroService();
