import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.string().uuid().optional(),
  paymentMethod: z.enum(['EFT', 'PAYFAST', 'OZOW', 'WHATSAPP']).default('EFT'),
  notes: z.string().max(1000).optional(),
  idempotencyKey: z.string().uuid().optional(), // Prevent duplicate orders
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED']),
});

export const listOrdersQuerySchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED']).optional(),
  page: z.string().regex(/^\d+$/).default('1'),
  limit: z.string().regex(/^\d+$/).default('20'),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
export type ListOrdersQueryDto = z.infer<typeof listOrdersQuerySchema>;
