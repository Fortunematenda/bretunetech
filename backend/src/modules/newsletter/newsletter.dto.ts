import { z } from 'zod';

const emailBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('eyebrow'), text: z.string().min(1).max(80) }),
  z.object({ type: z.literal('hero'), headline: z.string().min(1), subhead: z.string().optional(), imageUrl: z.string().optional() }),
  z.object({ type: z.literal('richtext'), html: z.string().max(50_000) }),
  z.object({
    type: z.literal('features'),
    items: z.array(z.object({
      imageUrl: z.string().min(1),
      title: z.string().min(1).max(120),
      text: z.string().min(1).max(300),
    })).min(1).max(4),
  }),
  z.object({ type: z.literal('products'), productSlugs: z.array(z.string()).max(12) }),
  z.object({ type: z.literal('category'), categorySlug: z.string(), limit: z.number().int().min(1).max(12).optional() }),
  z.object({ type: z.literal('services'), slugs: z.array(z.string()).max(8).optional() }),
  z.object({ type: z.literal('cta'), label: z.string().min(1), href: z.string().min(1), sublabel: z.string().max(120).optional() }),
]);

export const audienceSchema = z.object({
  consentOnly: z.boolean().default(true),
  interests: z.array(z.string()).optional(),
  activity: z.enum(['all', 'purchased', 'never_purchased']).default('all'),
});

export const subscribeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().max(80).optional(),
  interests: z.array(z.string()).max(10).optional(),
  marketingConsent: z.boolean().refine((v) => v === true, { message: 'Marketing consent is required' }),
  source: z.string().max(100).default('website-footer'),
});

export const unsubscribeSchema = z.object({
  token: z.string().min(10).optional(),
  subscriberId: z.string().uuid().optional(),
}).refine((d) => Boolean(d.token && (d.subscriberId || d.token.length >= 20)), { message: 'token is required' });

export const createCampaignSchema = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  previewText: z.string().max(200).optional(),
  fromName: z.string().max(100).optional(),
  fromEmail: z.string().email().optional(),
  audience: audienceSchema,
  blocks: z.array(emailBlockSchema).min(1),
  monthKey: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  title: z.string().min(1).max(200).optional(),
  subject: z.string().min(1).max(200).optional(),
  previewText: z.string().max(200).optional(),
  audience: audienceSchema.optional(),
  blocks: z.array(emailBlockSchema).min(1).optional(),
});

export const createCampaignFromTemplateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  monthKey: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

export const testSendSchema = z.object({
  email: z.string().email(),
});

export const listSubscribersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'UNSUBSCRIBED', 'SUPPRESSED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(25),
});

export const importSubscribersSchema = z.object({
  rows: z
    .array(
      z.object({
        email: z.string().email(),
        firstName: z.string().optional(),
        interests: z.array(z.string()).optional(),
        consentAt: z.string().datetime(),
        source: z.string(),
      }),
    )
    .min(1)
    .max(5000),
});

export const scheduleSettingsSchema = z.object({
  enabled: z.boolean(),
  dayOfMonth: z.number().int().min(1).max(28),
  hour: z.number().int().min(0).max(23),
  timeZone: z.string().default('Africa/Johannesburg'),
});