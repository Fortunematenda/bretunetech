import 'dotenv/config';
import prisma from '../lib/prisma';
import { seoService } from '../modules/seo/seo.service';

/**
 * Restores product full/short descriptions that were overwritten by SEO boilerplate.
 * Prefer supplierDescription → original description → regenerated content from real copy.
 */
async function main() {
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      supplierDescription: true,
      shortDescription: true,
      fullDescription: true,
      seoLocked: true,
      brand: { select: { name: true } },
      category: { select: { name: true } },
      specifications: { select: { key: true, value: true } },
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    if (product.seoLocked) {
      skipped += 1;
      continue;
    }

    const fullIsBad = seoService.isBoilerplateDescription(product.fullDescription);
    const shortIsBad = seoService.isBoilerplateDescription(product.shortDescription);
    if (!fullIsBad && !shortIsBad) {
      skipped += 1;
      continue;
    }

    const generated = seoService.generateBretuneTechContent({
      name: product.name,
      slug: product.slug,
      description: product.description,
      supplierDescription: product.supplierDescription,
      brand: product.brand,
      category: product.category,
      specifications: product.specifications,
    });

    await prisma.product.update({
      where: { id: product.id },
      data: {
        ...(fullIsBad ? { fullDescription: generated.fullDescription } : {}),
        ...(shortIsBad ? { shortDescription: generated.shortDescription } : {}),
        seoGeneratedAt: new Date(),
      },
    });
    updated += 1;
  }

  process.stdout.write(`${JSON.stringify({ scanned: products.length, updated, skipped }, null, 2)}\n`);
}

main()
  .catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
