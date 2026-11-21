export type EmailBlock =
  | { type: 'hero'; headline: string; subhead?: string; imageUrl?: string }
  | { type: 'richtext'; html: string }
  | { type: 'products'; productSlugs: string[] }
  | { type: 'category'; categorySlug: string; limit?: number }
  | { type: 'services'; slugs?: string[] }
  | { type: 'cta'; label: string; href: string };

export type NewsletterAudience = {
  /** Only subscribers with documented marketing consent (always true for sends). */
  consentOnly: boolean;
  interests?: string[];
  /** Filter by order history when linked to a user account. */
  activity?: 'all' | 'purchased' | 'never_purchased';
};