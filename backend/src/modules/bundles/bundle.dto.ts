import { z } from 'zod';

export const listBundlesSchema = z.object({
  featured: z.enum(['true', 'false']).optional(),
});

export const createBundleSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  description: z.string().min(10).max(5000).trim(),
  bundlePrice: z.number().positive(),
  imageUrl: z.string().url().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive().default(1),
  })).min(1, 'Bundle must contain at least one product'),
});

export const updateBundleSchema = z.object({
  name: z.string().min(2).max(200).trim().optional(),
  description: z.string().min(10).max(5000).trim().optional(),
  bundlePrice: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type ListBundlesDto = z.infer<typeof listBundlesSchema>;
export type CreateBundleDto = z.infer<typeof createBundleSchema>;
export type UpdateBundleDto = z.infer<typeof updateBundleSchema>;
