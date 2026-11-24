/**
 * Creates the December 2026 draft campaign “Stay Connected. Stay Protected.”
 * Idempotent. Always leaves status DRAFT — never sends.
 *
 * npm run newsletter:seed-december
 */
import 'dotenv/config';
import prisma from '../lib/prisma';
import { newsletterConfig } from '../modules/newsletter/newsletter.config';
import type { EmailBlock } from '../modules/newsletter/newsletter.types';

const MONTH_KEY = '2026-12';
const TITLE = 'Stay Connected. Stay Protected.';

async function main() {
  const existing = await prisma.newsletterCampaign.findUnique({ where: { monthKey: MONTH_KEY } });
  if (existing) {
    if (existing.status !== 'DRAFT') {
      console.log(
        `December campaign exists as ${existing.status} (${existing.id}). Leaving untouched — SENT campaigns must be duplicated, not edited.`,
      );
      return;
    }
    console.log(`Updating existing December draft ${existing.id} (status remains DRAFT).`);
  }

  const products = await prisma.product.findMany({
    where: { isActive: true, isDeleted: false, status: 'PUBLISHED' },
    take: 4,
    orderBy: { updatedAt: 'desc' },
    select: { slug: true },
  });

  const blocks: EmailBlock[] = [
    { type: 'eyebrow', text: 'DECEMBER 2026 · BRETUNETECH' },
    {
      type: 'hero',
      headline: 'Stay Connected. Stay Protected.',
      subhead:
        'Practical CCTV care, Wi-Fi coverage and networking guidance for homes and businesses this festive season.',
      imageUrl: '/assets/hero/camera.png',
    },
    {
      type: 'richtext',
      html:
        '<p>December is when sites stay open longer, visitors increase, and networks take more load. BretuneTech helps you keep cameras recording, Wi-Fi usable, and cabling ready for the year ahead — without inventing promotions or stock claims.</p>',
    },
    { type: 'divider' },
    {
      type: 'features',
      items: [
        {
          imageUrl: '/assets/hero/camera.png',
          title: 'CCTV maintenance',
          text: 'Check lens cleanliness, recording retention, and night vision before holiday closures.',
        },
        {
          imageUrl: '/assets/hero/networking.png',
          title: 'Wi-Fi coverage',
          text: 'Reduce dead zones where guests and staff actually work — not just the reception desk.',
        },
      ],
    },
    {
      type: 'richtext',
      html:
        '<p><strong>Festive-season security tips:</strong> confirm NVR disk health, review who has live-view access, keep guest Wi-Fi separate from business traffic, and label patch panels so January change requests are quick.</p>',
    },
    { type: 'category', categorySlug: 'cctv-security', limit: 3 },
    { type: 'category', categorySlug: 'networking', limit: 4 },
    ...(products.length ? [{ type: 'products' as const, productSlugs: products.map((p) => p.slug) }] : []),
    {
      type: 'services',
      slugs: ['cctv-setup', 'wifi-installations', 'network-installation', 'structured-cabling'],
    },
    {
      type: 'offer',
      headline: 'Planning a site refresh?',
      detail:
        'Ask our team about CCTV servicing, Wi-Fi surveys and structured cabling for Cape Town and nationwide projects. Pricing is quoted per site — no blanket discounts are advertised here.',
    },
    {
      type: 'cta',
      label: 'Request a Quote',
      href: '/quote',
      sublabel: 'www.bretunetech.com/quote',
    },
    {
      type: 'contact',
      email: 'sales@bretunetech.com',
      address: 'Cape Town, South Africa',
      hours: 'Weekdays — reply via the website contact form if you prefer',
    },
  ];

  const data = {
    title: TITLE,
    subject: 'Stay Connected. Stay Protected. — BretuneTech December update',
    previewText: 'CCTV maintenance, Wi-Fi coverage and networking tips for the festive season.',
    fromName: newsletterConfig.fromName,
    fromEmail: newsletterConfig.fromEmail,
    monthKey: MONTH_KEY,
    status: 'DRAFT' as const,
    audience: { consentOnly: true, activity: 'all' as const },
    blocks,
  };

  if (existing) {
    await prisma.newsletterCampaign.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        subject: data.subject,
        previewText: data.previewText,
        fromName: data.fromName,
        fromEmail: data.fromEmail,
        audience: data.audience,
        blocks: data.blocks,
        status: 'DRAFT',
        scheduledAt: null,
        approvedAt: null,
        approvedById: null,
      },
    });
    console.log(`Updated draft ${existing.id} — status DRAFT (not sent).`);
    return;
  }

  const created = await prisma.newsletterCampaign.create({ data });
  console.log(`Created draft ${created.id} — status DRAFT (not sent).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
