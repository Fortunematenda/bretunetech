import { z } from 'zod';

export const listProductsSchema = z.object({
  search: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  condition: z.enum(['NEW', 'REFURBISHED']).optional(),
  tag: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  featured: z.enum(['true', 'false']).optional(),
  discount: z.enum(['true', 'false']).optional(),
  inStock: z.enum(['true', 'false']).optional(),
  newArrivals: z.enum(['true', 'false']).optional(),
  minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'name', '']).optional(),
  page: z.string().regex(/^\d+$/).default('1'),
  limit: z.string().regex(/^\d+$/).default('12'),
});

export const exportProductsSchema = z.object({
  search: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  condition: z.enum(['NEW', 'REFURBISHED']).optional(),
  brand: z.string().max(100).optional(),
  featured: z.enum(['true', 'false']).optional(),
  ids: z.string().optional(), // Comma-separated product IDs for selected export
});

export const createProductSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  description: z.string().min(10).max(5000).trim(),
  categoryId: z.string().min(1, 'Category is required'),
  condition: z.enum(['NEW', 'REFURBISHED']).default('NEW'),
  costPrice: z.number().positive(),
  sellingPrice: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  discountExpiresAt: z.string().datetime().optional(),
  stockQuantity: z.number().int().min(0).default(0),
  stockCpt: z.number().int().min(0).default(0),
  stockJhb: z.number().int().min(0).default(0),
  stockDbn: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  shippingDays: z.number().int().min(1).max(30).default(3),
  supplierName: z.string().max(200).optional(),
  sku: z.string().max(50).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  brandId: z.string().uuid().optional(),
  manualUrl: z.string().url().optional(),
  additionalInfo: z.string().max(10000).optional(),
  images: z.array(z.object({
    url: z.string().min(1, 'Image URL is required'),
    altText: z.string().max(200).optional(),
    sortOrder: z.number().int().default(0),
    isPrimary: z.boolean().default(false),
  })).optional(),
  tags: z.array(z.string().max(100)).optional(),
  specifications: z.array(z.object({
    key: z.string().min(1).max(100),
    value: z.string().min(1).max(200),
    sortOrder: z.number().int().optional(),
  })).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(200).trim().optional(),
  description: z.string().min(10).max(5000).trim().optional(),
  categoryId: z.string().min(1).optional(),
  condition: z.enum(['NEW', 'REFURBISHED']).optional(),
  costPrice: z.number().positive().optional(),
  sellingPrice: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  discountExpiresAt: z.string().datetime().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  stockCpt: z.number().int().min(0).optional(),
  stockJhb: z.number().int().min(0).optional(),
  stockDbn: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  shippingDays: z.number().int().min(1).max(30).optional(),
  supplierName: z.string().max(200).optional(),
  sku: z.string().max(50).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  brandId: z.string().uuid().nullable().optional(),
  manualUrl: z.string().url().nullable().optional(),
  additionalInfo: z.string().max(10000).nullable().optional(),
  images: z.array(z.object({
    url: z.string().min(1, 'Image URL is required'),
    altText: z.string().max(200).optional(),
    sortOrder: z.number().int().default(0),
    isPrimary: z.boolean().default(false),
  })).optional(),
  tags: z.array(z.string().max(100)).optional(),
  specifications: z.array(z.object({
    key: z.string().min(1).max(100),
    value: z.string().min(1).max(200),
    sortOrder: z.number().int().optional(),
  })).optional(),
});

export const bulkUpdateStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one product ID is required'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

export type ListProductsDto = z.infer<typeof listProductsSchema>;
export type ExportProductsDto = z.infer<typeof exportProductsSchema>;
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
