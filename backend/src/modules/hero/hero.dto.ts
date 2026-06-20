import { z } from 'zod';

// Node configuration
const nodeSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  size: z.string(),
  delay: z.number().min(0).max(5),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

// Connection line configuration
const connectionLineSchema = z.object({
  x1: z.number().min(0).max(100),
  y1: z.number().min(0).max(100),
  x2: z.number().min(0).max(100),
  y2: z.number().min(0).max(100),
  delay: z.number().min(0).max(5),
});

// WiFi signal configuration
const wifiSignalSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  delay: z.number().min(0).max(5),
});

// Particle configuration
const particleConfigSchema = z.object({
  count: z.number().min(0).max(100),
  speed: z.number().min(1).max(10),
  sizeMin: z.number().min(1).max(10),
  sizeMax: z.number().min(1).max(20),
});

// Animation speed configuration
const animationSpeedSchema = z.object({
  nodeDuration: z.number().min(1).max(10),
  lineDuration: z.number().min(1).max(10),
  wifiDuration: z.number().min(1).max(10),
  particleDuration: z.number().min(1).max(10),
});

// CTA button configuration
const ctaButtonSchema = z.object({
  text: z.string().min(1).max(50),
  link: z.string().url(),
  style: z.enum(['primary', 'secondary']),
});

// Trust indicator configuration
const trustIndicatorSchema = z.object({
  text: z.string().min(1).max(50),
  visible: z.boolean(),
});

// Main hero settings schema
export const heroSettingsSchema = z.object({
  // Text content
  badge: z.object({
    text: z.string().min(1).max(50),
    visible: z.boolean(),
    position: z.object({
      horizontal: z.enum(['left', 'center', 'right']),
      vertical: z.enum(['top', 'center', 'bottom']),
    }).optional(),
  }),
  headline: z.string().min(1).max(100),
  headlineHighlight: z.string().min(1).max(50),
  headlinePosition: z.object({
    horizontal: z.enum(['left', 'center', 'right']),
    vertical: z.enum(['top', 'center', 'bottom']),
  }).optional(),
  headlineHighlightPosition: z.object({
    horizontal: z.enum(['left', 'center', 'right']),
    vertical: z.enum(['top', 'center', 'bottom']),
  }).optional(),
  subheadline: z.string().min(1).max(200),
  subheadlinePosition: z.object({
    horizontal: z.enum(['left', 'center', 'right']),
    vertical: z.enum(['top', 'center', 'bottom']),
  }).optional(),
  ctaButtons: z.array(ctaButtonSchema).min(0).max(3),
  ctaButtonsPosition: z.object({
    horizontal: z.enum(['left', 'center', 'right']),
    vertical: z.enum(['top', 'center', 'bottom']),
  }).optional(),
  trustIndicators: z.array(trustIndicatorSchema).min(0).max(5),
  trustIndicatorsPosition: z.object({
    horizontal: z.enum(['left', 'center', 'right']),
    vertical: z.enum(['top', 'center', 'bottom']),
  }).optional(),

  // Background
  backgroundGradient: z.string().min(1),
  backgroundColor: z.string().optional(),
  backgroundImageUrl: z.string().url().optional(),
  contentImageUrl: z.string().url().optional(),
  contentImagePosition: z.object({
    horizontal: z.enum(['left', 'center', 'right']),
    vertical: z.enum(['top', 'center', 'bottom']),
  }).optional(),

  // Visual elements
  nodes: z.array(nodeSchema).min(0).max(20),
  connectionLines: z.array(connectionLineSchema).min(0).max(30),
  wifiSignals: z.array(wifiSignalSchema).min(0).max(10),
  particleConfig: particleConfigSchema,
  animationSpeed: animationSpeedSchema,

  // Dimensions
  height: z.string().optional(),
});

export type HeroSettings = z.infer<typeof heroSettingsSchema>;

export const updateHeroSettingsSchema = heroSettingsSchema.partial();
