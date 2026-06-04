import { z } from 'zod';

export const createAddressSchema = z.object({
  label: z.string().max(50).optional(),
  street: z.string().min(1).max(200).trim(),
  city: z.string().min(1).max(100).trim(),
  province: z.string().min(1).max(100).trim(),
  postalCode: z.string().min(1).max(10).trim(),
  country: z.string().max(100).default('South Africa'),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = z.object({
  label: z.string().max(50).optional(),
  street: z.string().min(1).max(200).trim().optional(),
  city: z.string().min(1).max(100).trim().optional(),
  province: z.string().min(1).max(100).trim().optional(),
  postalCode: z.string().min(1).max(10).trim().optional(),
  country: z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
});

export type CreateAddressDto = z.infer<typeof createAddressSchema>;
export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;
