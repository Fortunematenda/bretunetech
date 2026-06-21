import { z } from 'zod';

// Template types
export const templateTypeSchema = z.enum([
  'powder_splash',
  'neon_tech',
  'modern_gradient',
  'premium_showcase',
  'hero_banner',
]);

// Export format types
export const exportFormatSchema = z.enum([
  'facebook_post',
  'facebook_cover',
  'instagram_post',
  'instagram_story',
  'website_hero',
  'whatsapp_promo',
]);

// Export format dimensions
export const exportDimensions = {
  facebook_post: { width: 1080, height: 1080 },
  facebook_cover: { width: 1640, height: 624 },
  instagram_post: { width: 1080, height: 1080 },
  instagram_story: { width: 1080, height: 1920 },
  website_hero: { width: 1920, height: 1080 },
  whatsapp_promo: { width: 1200, height: 1200 },
};

// Benefit item schema
const benefitSchema = z.object({
  text: z.string().min(1),
  icon: z.string().default('✓'),
});

// Pricing schema
const pricingSchema = z.object({
  currentPrice: z.string().min(1),
  oldPrice: z.string().optional(),
  currency: z.string().default('R'),
  showSpecial: z.boolean().default(true),
  showDiscount: z.boolean().default(true),
});

// Branding schema
const brandingSchema = z.object({
  showLogo: z.boolean().default(true),
  showWebsite: z.boolean().default(true),
  showPhone: z.boolean().default(true),
  showFacebook: z.boolean().default(true),
  showLinkedIn: z.boolean().default(true),
  websiteUrl: z.string().optional(),
  phoneNumber: z.string().optional(),
  facebookUrl: z.string().optional(),
  linkedInUrl: z.string().optional(),
});

// Product info schema
const productInfoSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1),
  productImage: z.string().url().optional(),
  price: z.string().optional(),
  salePrice: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
});

// Main marketing ad schema
export const createMarketingAdSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  template: templateTypeSchema,
  product: productInfoSchema,
  headline: z.string().min(1, 'Headline is required'),
  subheading: z.string().optional(),
  benefits: z.array(benefitSchema).default([]),
  pricing: pricingSchema.optional(),
  branding: brandingSchema.default({
    showLogo: true,
    showWebsite: true,
    showPhone: true,
    showFacebook: true,
    showLinkedIn: true,
  }),
  exportFormat: exportFormatSchema.default('facebook_post'),
  generatedImageUrl: z.string().url().optional(),
  generatedThumbnailUrl: z.string().url().optional(),
  downloadCount: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const updateMarketingAdSchema = createMarketingAdSchema.partial();

export const listMarketingAdsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  template: templateTypeSchema.optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
}).passthrough();

// AI generation request schema
export const generateMarketingCopySchema = z.object({
  productName: z.string().min(1),
  productDescription: z.string().optional(),
  price: z.string().optional(),
  category: z.string().optional(),
});

export type CreateMarketingAdDto = z.infer<typeof createMarketingAdSchema>;
export type UpdateMarketingAdDto = z.infer<typeof updateMarketingAdSchema>;
export type ListMarketingAdsDto = z.infer<typeof listMarketingAdsSchema>;
export type GenerateMarketingCopyDto = z.infer<typeof generateMarketingCopySchema>;
export type TemplateType = z.infer<typeof templateTypeSchema>;
export type ExportFormat = z.infer<typeof exportFormatSchema>;
