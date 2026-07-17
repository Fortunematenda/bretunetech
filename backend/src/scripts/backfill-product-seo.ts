import 'dotenv/config';
import prisma from '../lib/prisma';
import { seoService } from '../modules/seo/seo.service';

async function main() {
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
      specifications: { select: { key: true, value: true } },
    },
  });

  const report = { scanned: products.length, updated: 0, skippedLocked: 0, conflicts: [] as { id: string; slug: string; reason: string }[] };

  for (const product of products) {
    if (product.seoLocked) {
      report.skippedLocked += 1;
      continue;
    }

    const generated = seoService.generateBretuneTechContent(product);
    const supplierDescription = product.supplierDescription || product.description;
    const descriptionIsSupplierCopy = (value: string | null) => Boolean(value && supplierDescription && value.trim() === supplierDescription.trim());
    const data: Record<string, unknown> = {
      supplierTitle: product.supplierTitle || product.name,
      supplierDescription,
      supplierSku: product.supplierSku || product.sku,
      displayName: product.displayName || generated.displayName,
      shortDescription: !product.shortDescription || descriptionIsSupplierCopy(product.shortDescription) ? generated.shortDescription : product.shortDescription,
      fullDescription: !product.fullDescription || descriptionIsSupplierCopy(product.fullDescription) ? generated.fullDescription : product.fullDescription,
      seoTitle: product.seoTitle || product.metaTitle || generated.seoTitle,
      metaTitle: product.metaTitle || generated.metaTitle,
      metaDescription: product.metaDescription || generated.metaDescription,
      focusKeyword: product.focusKeyword || generated.focusKeyword,
      secondaryKeywords: product.secondaryKeywords || generated.secondaryKeywords,
      imageAltText: product.imageAltText || generated.imageAltText,
      canonicalUrl: product.canonicalUrl || generated.canonicalUrl,
    };

    const missingValues = Object.entries(data).some(([key, value]) => product[key as keyof typeof product] !== value);
    if (!missingValues) continue;

    await prisma.product.update({
      where: { id: product.id },
      data: { ...data, seoGeneratedAt: new Date(), seoContentVersion: { increment: 1 } },
    });
    report.updated += 1;
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

main()
  .catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
