import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  firstName: z.string().min(1, 'First name is required').max(100).trim(),
  lastName: z.string().min(1, 'Last name is required').max(100).trim(),
  phone: z.string().min(1, 'Phone is required').max(20),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
  password: z.string().min(1, 'Password is required').max(128),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  phone: z.string().max(20).optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
