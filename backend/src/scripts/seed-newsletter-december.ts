/**
 * Creates a sample December newsletter as an unsent DRAFT (idempotent).
 * npm run newsletter:seed-december
 */
import 'dotenv/config';
import prisma from '../lib/prisma';
import { newsletterConfig } from '../modules/newsletter/newsletter.config';

const MONTH_KEY = '2025-12';

async function main() {
  const existing = await prisma.newsletterCampaign.findUnique({ where: { monthKey: MONTH_KEY } });
  if (existing) {
    console.log(`December draft already exists: ${existing.id} (${existing.status})`);
    return;
  }

  const products = await prisma.product.findMany({
    where: { isActive: true, isDeleted: false, status: 'PUBLISHED' },
    take: 3,
    orderBy: { updatedAt: 'desc' },
    select: { slug: true },
  });

  await prisma.newsletterCampaign.create({
    data: {
      title: 'December 2025 — BretuneTech Monthly',
      subject: 'Year-end networking & security picks from BretuneTech',
      previewText: 'Hand-picked routers, switches and CCTV gear for South African sites.',
      fromName: newsletterConfig.fromName,
      fromEmail: newsletterConfig.fromEmail,
      monthKey: MONTH_KEY,
      status: 'DRAFT',
      audience: { consentOnly: true, activity: 'all' },
      blocks: [
        {
          type: 'hero',
          headline: 'December at BretuneTech',
          subhead: 'Reliable connectivity and security for the holidays',
        },
        {
          type: 'richtext',
          html:
            '<p>Welcome to the BretuneTech monthly update. Below are current catalogue highlights and services we are booking for Cape Town and nationwide support.</p>',
        },
        { type: 'category', categorySlug: 'networking', limit: 4 },
        { type: 'category', categorySlug: 'cctv-security', limit: 3 },
        ...(products.length
          ? [{ type: 'products' as const, productSlugs: products.map((p) => p.slug) }]
          : []),
        { type: 'services', slugs: ['wifi-installations', 'cctv-setup', 'network-installation'] },
        { type: 'cta', label: 'Browse the full catalogue', href: '/products' },
      ],
    },
  });
  console.log('Created December 2025 newsletter draft (status: DRAFT, not sent).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());