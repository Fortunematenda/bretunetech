import 'dotenv/config';
import prisma from '../lib/prisma';

type Issue = {
  productId: string;
  sku: string | null;
  slug: string;
  issueType: string;
  severity: 'error' | 'warning';
  currentValue: string;
  recommendedAction: string;
};

async function main() {
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    include: { images: { select: { url: true, altText: true } } },
  });
  const issues: Issue[] = [];
  const titles = new Map<string, string[]>();
  const descriptions = new Map<string, string[]>();

  for (const product of products) {
    const reference = { productId: product.id, sku: product.sku, slug: product.slug };
    const title = product.seoTitle || product.metaTitle || '';
    const description = product.metaDescription || '';
    if (!title) issues.push({ ...reference, issueType: 'missing_seo_title', severity: 'error', currentValue: '', recommendedAction: 'Generate or write a unique SEO title.' });
    if (!description) issues.push({ ...reference, issueType: 'missing_meta_description', severity: 'error', currentValue: '', recommendedAction: 'Generate or write a factual meta description.' });
    if (!product.canonicalUrl) issues.push({ ...reference, issueType: 'missing_canonical', severity: 'warning', currentValue: '', recommendedAction: 'Backfill the permanent BretuneTech canonical URL.' });
    if (!product.images.length) issues.push({ ...reference, issueType: 'missing_images', severity: 'warning', currentValue: '', recommendedAction: 'Add an accessible product image.' });
    if (product.images.some((image) => !image.altText && !product.imageAltText)) issues.push({ ...reference, issueType: 'missing_alt_text', severity: 'warning', currentValue: '', recommendedAction: 'Set concise descriptive image alt text.' });
    if (product.supplierDescription && product.fullDescription && product.supplierDescription.trim() === product.fullDescription.trim()) issues.push({ ...reference, issueType: 'supplier_content_unchanged', severity: 'warning', currentValue: product.fullDescription.slice(0, 250), recommendedAction: 'Regenerate or write original BretuneTech product content.' });
    if (title) titles.set(title, [...(titles.get(title) || []), product.id]);
    if (description) descriptions.set(description, [...(descriptions.get(description) || []), product.id]);
  }

  for (const [value, ids] of titles) for (const id of ids) if (ids.length > 1) {
    const product = products.find((entry) => entry.id === id)!;
    issues.push({ productId: id, sku: product.sku, slug: product.slug, issueType: 'duplicate_seo_title', severity: 'warning', currentValue: value, recommendedAction: 'Differentiate the title using verified model or specification data.' });
  }
  for (const [value, ids] of descriptions) for (const id of ids) if (ids.length > 1) {
    const product = products.find((entry) => entry.id === id)!;
    issues.push({ productId: id, sku: product.sku, slug: product.slug, issueType: 'duplicate_meta_description', severity: 'warning', currentValue: value, recommendedAction: 'Write a unique factual meta description.' });
  }

  process.stdout.write(`${JSON.stringify({ scannedAt: new Date().toISOString(), products: products.length, issues }, null, 2)}\n`);
}

main()
  .catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
