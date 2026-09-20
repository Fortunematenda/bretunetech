/**
 * Shop-by-solution cards — defaults + helpers.
 * Live content is loaded from GET /api/shop-solutions (admin-editable).
 */

import { DEFAULT_API_URL } from '@/lib/config';

export type ShopSolutionIcon =
  | 'wifi' | 'camera' | 'zap' | 'network' | 'printer' | 'monitor'
  | 'router' | 'shield' | 'antenna' | 'cable' | 'server' | 'radio';

export type ShopSolutionColor =
  | 'bg-blue-500' | 'bg-purple-500' | 'bg-yellow-500' | 'bg-cyan-500'
  | 'bg-pink-500' | 'bg-green-500' | 'bg-orange-500' | 'bg-red-500'
  | 'bg-indigo-500' | 'bg-teal-500' | 'bg-slate-600';

export type ShopSolutionItem = {
  id: string;
  title: string;
  slug: string;
  desc: string;
  icon: ShopSolutionIcon;
  color: ShopSolutionColor;
  enabled: boolean;
  sortOrder: number;
};

export type ShopSolutionsSettings = {
  sectionTitle: string;
  sectionSubtitle: string;
  items: ShopSolutionItem[];
};

export const DEFAULT_SHOP_SOLUTIONS: ShopSolutionsSettings = {
  sectionTitle: 'Shop by Solution',
  sectionSubtitle: 'Find products matched to your business need',
  items: [
    { id: 'networking', title: 'Networking & WiFi', slug: 'networking', desc: 'Routers, switches, access points', icon: 'wifi', color: 'bg-blue-500', enabled: true, sortOrder: 0 },
    { id: 'cctv-security', title: 'CCTV & Security', slug: 'cctv-security', desc: 'Cameras, NVRs, access control', icon: 'camera', color: 'bg-purple-500', enabled: true, sortOrder: 1 },
    { id: 'power-backup', title: 'Power & Backup', slug: 'power-backup', desc: 'UPS, inverters, batteries', icon: 'zap', color: 'bg-yellow-500', enabled: true, sortOrder: 2 },
    { id: 'computers-laptops', title: 'Computers & Laptops', slug: 'computers-laptops', desc: 'Desktops, laptops, mini PCs', icon: 'monitor', color: 'bg-cyan-500', enabled: true, sortOrder: 3 },
    { id: 'wireless-solutions', title: 'Wireless Solutions', slug: 'wireless-solutions', desc: 'Outdoor links, antennas, bridges', icon: 'network', color: 'bg-pink-500', enabled: true, sortOrder: 4 },
    { id: 'printers-office', title: 'Printers & Office', slug: 'printers-office', desc: 'Printers, scanners, ink & toner', icon: 'printer', color: 'bg-green-500', enabled: true, sortOrder: 5 },
  ],
};

/** @deprecated Prefer fetchShopSolutions(); kept for sync label lookups. */
export const SHOP_SOLUTIONS = DEFAULT_SHOP_SOLUTIONS.items;

export type SolutionSlug = string;

export function getSolutionLabel(
  slug: string | null | undefined,
  items: Array<{ slug: string; title: string }> = DEFAULT_SHOP_SOLUTIONS.items,
): string | null {
  if (!slug) return null;
  return items.find((s) => s.slug === slug)?.title ?? null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

export async function fetchShopSolutions(): Promise<{
  sectionTitle: string;
  sectionSubtitle: string;
  items: ShopSolutionItem[];
}> {
  try {
    const res = await fetch(`${API_URL}/shop-solutions`, { cache: 'no-store' });
    if (!res.ok) {
      return {
        sectionTitle: DEFAULT_SHOP_SOLUTIONS.sectionTitle,
        sectionSubtitle: DEFAULT_SHOP_SOLUTIONS.sectionSubtitle,
        items: DEFAULT_SHOP_SOLUTIONS.items.filter((i) => i.enabled),
      };
    }
    const data = await res.json();
    return {
      sectionTitle: data.sectionTitle || DEFAULT_SHOP_SOLUTIONS.sectionTitle,
      sectionSubtitle: data.sectionSubtitle || DEFAULT_SHOP_SOLUTIONS.sectionSubtitle,
      items: Array.isArray(data.items) ? data.items : DEFAULT_SHOP_SOLUTIONS.items.filter((i) => i.enabled),
    };
  } catch {
    return {
      sectionTitle: DEFAULT_SHOP_SOLUTIONS.sectionTitle,
      sectionSubtitle: DEFAULT_SHOP_SOLUTIONS.sectionSubtitle,
      items: DEFAULT_SHOP_SOLUTIONS.items.filter((i) => i.enabled),
    };
  }
}

export async function fetchShopSolutionsAdmin(token: string): Promise<ShopSolutionsSettings> {
  const res = await fetch(`${API_URL}/shop-solutions/admin`, {
    headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load shop solutions');
  return res.json();
}

export async function saveShopSolutionsAdmin(
  token: string,
  settings: ShopSolutionsSettings,
): Promise<ShopSolutionsSettings> {
  const res = await fetch(`${API_URL}/shop-solutions/admin`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save shop solutions');
  }
  return res.json();
}

export async function resetShopSolutionsAdmin(token: string): Promise<ShopSolutionsSettings> {
  const res = await fetch(`${API_URL}/shop-solutions/admin/reset`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to reset shop solutions');
  return res.json();
}
