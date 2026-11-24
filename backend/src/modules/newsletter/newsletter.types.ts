export type EmailBlock =
  | { type: 'eyebrow'; text: string }
  | { type: 'hero'; headline: string; subhead?: string; imageUrl?: string }
  | { type: 'richtext'; html: string }
  | { type: 'features'; items: { imageUrl?: string; title: string; text: string }[] }
  | { type: 'products'; productSlugs: string[] }
  | { type: 'category'; categorySlug: string; limit?: number }
  | { type: 'services'; slugs?: string[] }
  | { type: 'cta'; label: string; href: string; sublabel?: string }
  | { type: 'divider' }
  | { type: 'spacer'; height?: number }
  | { type: 'contact'; phone?: string; email?: string; address?: string; hours?: string }
  | { type: 'offer'; headline: string; detail: string; code?: string; expiresAt?: string }
  | { type: 'project'; title: string; summary: string; imageUrl?: string; href?: string };

export type NewsletterAudience = {
  /** Only subscribers with documented marketing consent (always true for sends). */
  consentOnly: boolean;
  interests?: string[];
  /** Filter by order history when linked to a user account. */
  activity?: 'all' | 'purchased' | 'never_purchased';
};