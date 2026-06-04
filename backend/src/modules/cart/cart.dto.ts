import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z.string().uuid().optional(),
  bundleId: z.string().uuid().optional(),
  quantity: z.number().int().positive().default(1),
}).refine((data) => data.productId || data.bundleId, {
  message: 'Either productId or bundleId must be provided',
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0),
});

export type AddCartItemDto = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;
