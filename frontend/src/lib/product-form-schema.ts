import { z } from '@/lib/form';

export const productConditionEnum = z.enum(['NEW', 'REFURBISHED']);

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  mainCategoryId: z.string().optional(),
  condition: productConditionEnum,
  costPrice: z.string().refine(
    (val) => val !== '' && parseFloat(val) > 0,
    'Cost price must be positive',
  ),
  markupPercent: z.string().optional(),
  sellingPrice: z.string().refine(
    (val) => val !== '' && parseFloat(val) > 0,
    'Selling price must be positive',
  ),
  originalPrice: z.string().optional(),
  discountExpiresAt: z.string().optional(),
  stockQuantity: z.string().refine(
    (val) => val !== '' && parseInt(val, 10) >= 0,
    'Stock must be 0 or more',
  ),
  stockCpt: z.string().optional(),
  stockJhb: z.string().optional(),
  stockDbn: z.string().optional(),
  lowStockThreshold: z.string().optional(),
  supplierName: z.string().optional(),
  sku: z.string().optional(),
  shippingDays: z.string().optional(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function getProductFormDefaultValues(initialData?: any): ProductFormValues {
  return {
    name: initialData?.name || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || initialData?.category?.id || '',
    mainCategoryId: initialData?.category?.parentId || '',
    condition: initialData?.condition || 'NEW',
    costPrice: initialData?.costPrice ? String(initialData.costPrice) : '',
    markupPercent: '',
    sellingPrice: initialData?.sellingPrice ? String(initialData.sellingPrice) : '',
    originalPrice: initialData?.originalPrice ? String(initialData.originalPrice) : '',
    discountExpiresAt: initialData?.discountExpiresAt
      ? new Date(initialData.discountExpiresAt).toISOString().slice(0, 16)
      : '',
    stockQuantity: initialData?.stockQuantity !== undefined ? String(initialData.stockQuantity) : '',
    stockCpt: initialData?.stockCpt !== undefined ? String(initialData.stockCpt) : '0',
    stockJhb: initialData?.stockJhb !== undefined ? String(initialData.stockJhb) : '0',
    stockDbn: initialData?.stockDbn !== undefined ? String(initialData.stockDbn) : '0',
    lowStockThreshold:
      initialData?.lowStockThreshold !== undefined ? String(initialData.lowStockThreshold) : '5',
    supplierName: initialData?.supplierName || '',
    sku: initialData?.sku || '',
    shippingDays: initialData?.shippingDays !== undefined ? String(initialData.shippingDays) : '3',
    isFeatured: initialData?.isFeatured || false,
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  };
}
