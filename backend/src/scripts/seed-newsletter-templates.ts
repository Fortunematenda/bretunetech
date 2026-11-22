/**
 * Upserts editable newsletter templates (starter layouts for campaigns).
 * npm run newsletter:seed-templates
 */
import 'dotenv/config';
import prisma from '../lib/prisma';
import { NEWSLETTER_TEMPLATE_DEFAULTS } from '../modules/newsletter/newsletter.templates.defaults';

async function main() {
  let upserted = 0;
  for (const t of NEWSLETTER_TEMPLATE_DEFAULTS) {
    await prisma.newsletterTemplate.upsert({
      where: { slug: t.slug },
      create: {
        slug: t.slug,
        name: t.name,
        description: t.description,
        title: t.title,
        subject: t.subject,
        previewText: t.previewText,
        audience: t.audience,
        blocks: t.blocks,
      },
      update: {
        name: t.name,
        description: t.description,
        // Do not overwrite title/subject/blocks on existing rows — admins may have edited them.
      },
    });
    upserted++;
  }
  console.log(`Newsletter templates: ${upserted} slug(s) ensured (new rows get full defaults; existing slugs keep your edits).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());