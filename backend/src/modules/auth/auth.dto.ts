import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  firstName: z.string().min(1, 'First name is required').max(100).trim(),
  lastName: z.string().min(1, 'Last name is required').max(100).trim(),
  phone: z.string().max(20).optional(),
  acceptedTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
  password: z.string().min(1, 'Password is required').max(128),
}).strict();

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  phone: z.string().max(20).optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export const createAdminSchema = z.object({
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  firstName: z.string().min(1, 'First name is required').max(100).trim(),
  lastName: z.string().min(1, 'Last name is required').max(100).trim(),
  phone: z.string().max(20).optional(),
  role: z.enum(['ADMIN', 'STAFF', 'VENDOR', 'CUSTOMER']),
  customRoleId: z.string().uuid().optional(),
});

export const updateAdminSchema = z.object({
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase().optional(),
  firstName: z.string().min(1, 'First name is required').max(100).trim().optional(),
  lastName: z.string().min(1, 'Last name is required').max(100).trim().optional(),
  phone: z.string().max(20).optional(),
  role: z.enum(['ADMIN', 'STAFF', 'VENDOR', 'CUSTOMER']).optional(),
  customRoleId: z.string().uuid().optional(),
});

export type CreateAdminDto = z.infer<typeof createAdminSchema>;
export type UpdateAdminDto = z.infer<typeof updateAdminSchema>;
