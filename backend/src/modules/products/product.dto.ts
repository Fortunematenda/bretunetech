import { z } from 'zod';

export const listProductsSchema = z.object({
  search: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  condition: z.enum(['NEW', 'REFURBISHED']).optional(),
  tag: z.string().max(100).optional(),
  featured: z.enum(['true', 'false']).optional(),
  minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'name', '']).optional(),
  page: z.string().regex(/^\d+$/).default('1'),
  limit: z.string().regex(/^\d+$/).default('12'),
});

export const createProductSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  description: z.string().min(10).max(5000).trim(),
  categoryId: z.string().min(1, 'Category is required'),
  condition: z.enum(['NEW', 'REFURBISHED']).default('NEW'),
  costPrice: z.number().positive(),
  sellingPrice: z.number().positive(),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  supplierName: z.string().max(200).optional(),
  sku: z.string().max(50).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
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
  stockQuantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  supplierName: z.string().max(200).optional(),
  sku: z.string().max(50).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
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

export type ListProductsDto = z.infer<typeof listProductsSchema>;
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
