/**
 * Creates (or refreshes) a DRAFT-only delivery test campaign.
 * Does NOT send email and does NOT approve/schedule.
 *
 * Run: npx ts-node --transpile-only src/scripts/seed-newsletter-delivery-test-draft.ts
 */
import 'dotenv/config';
import prisma from '../lib/prisma';
import type { EmailBlock } from '../modules/newsletter/newsletter.types';

const TITLE = 'BretuneTech | Newsletter Delivery Test';
const SUBJECT = 'BretuneTech | Newsletter Delivery Test';

const blocks: EmailBlock[] = [
  { type: 'eyebrow', text: 'DELIVERY TEST — NOT A CUSTOMER CAMPAIGN' },
  {
    type: 'hero',
    headline: 'Welcome from BretuneTech',
    subhead:
      'This is a controlled production delivery test for newsletter rendering, links and unsubscribe handling.',
  },
  {
    type: 'richtext',
    html:
      '<p>Bretune Technologies (Pty) Ltd helps homes and businesses across South Africa stay connected and protected.</p>',
  },
  {
    type: 'features',
    items: [
      {
        title: 'CCTV installation',
        text: 'Professional CCTV design and installation for homes and commercial sites.',
        imageUrl: '/assets/hero/camera.png',
      },
      {
        title: 'Home & business Wi-Fi',
        text: 'Reliable Wi-Fi planning and installation for stronger coverage.',
        imageUrl: '/assets/hero/networking.png',
      },
      {
        title: 'Networking & cabling',
        text: 'Structured cabling, switches and network installs done properly.',
      },
      {
        title: 'IT support',
        text: 'Ongoing support for the systems that keep your operations online.',
      },
    ],
  },
  { type: 'category', categorySlug: 'networking', limit: 3 },
  { type: 'category', categorySlug: 'cctv-security', limit: 2 },
  { type: 'services', slugs: ['wifi-installations', 'cctv-setup', 'network-installation'] },
  { type: 'cta', label: 'Visit our website', href: '/', sublabel: 'www.bretunetech.com' },
  { type: 'cta', label: 'Contact us', href: '/contact', sublabel: 'Speak to the BretuneTech team' },
  {
    type: 'contact',
    email: 'sales@bretunetech.com',
    phone: undefined,
  },
];

async function main() {
  const existing = await prisma.newsletterCampaign.findFirst({
    where: { title: TITLE, status: 'DRAFT' },
    orderBy: { updatedAt: 'desc' },
  });

  if (existing) {
    const updated = await prisma.newsletterCampaign.update({
      where: { id: existing.id },
      data: {
        subject: SUBJECT,
        previewText: 'Controlled BretuneTech newsletter delivery test — single recipient only.',
        fromName: 'BretuneTech',
        fromEmail: 'newsletter@bretunetech.com',
        audience: { consentOnly: true, activity: 'all' },
        blocks: blocks as object,
        scheduledAt: null,
        approvedAt: null,
        approvedById: null,
        monthKey: null,
      },
    });
    console.log('Updated DRAFT test campaign', updated.id);
    return;
  }

  const created = await prisma.newsletterCampaign.create({
    data: {
      title: TITLE,
      subject: SUBJECT,
      previewText: 'Controlled BretuneTech newsletter delivery test — single recipient only.',
      fromName: 'BretuneTech',
      fromEmail: 'newsletter@bretunetech.com',
      audience: { consentOnly: true, activity: 'all' },
      status: 'DRAFT',
      blocks: blocks as object,
    },
  });
  console.log('Created DRAFT test campaign', created.id);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
