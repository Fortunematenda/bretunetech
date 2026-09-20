import { z } from 'zod';

export const shopSolutionItemSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().min(1).max(80),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  desc: z.string().max(160).default(''),
  icon: z.enum([
    'wifi', 'camera', 'zap', 'network', 'printer', 'monitor',
    'router', 'shield', 'antenna', 'cable', 'server', 'radio',
  ]).default('wifi'),
  color: z.enum([
    'bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-cyan-500',
    'bg-pink-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500',
    'bg-indigo-500', 'bg-teal-500', 'bg-slate-600',
  ]).default('bg-blue-500'),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(100).default(0),
});

export const shopSolutionsSettingsSchema = z.object({
  sectionTitle: z.string().min(1).max(80).default('Shop by Solution'),
  sectionSubtitle: z.string().max(160).default('Find products matched to your business need'),
  items: z.array(shopSolutionItemSchema).max(24),
});

export type ShopSolutionItem = z.infer<typeof shopSolutionItemSchema>;
export type ShopSolutionsSettings = z.infer<typeof shopSolutionsSettingsSchema>;

export const updateShopSolutionsSchema = shopSolutionsSettingsSchema;
