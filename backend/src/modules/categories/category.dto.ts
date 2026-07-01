import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().min(1).optional(),
  parentId: z.string().uuid().optional().nullable().transform(val => val === "" ? null : val),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().min(1).optional(),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
