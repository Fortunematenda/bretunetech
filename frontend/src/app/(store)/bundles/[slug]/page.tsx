import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { getBundleBySlug, bundleCatalog } from '@/lib/bundle-catalog';
import BundleDetailClient from './BundleDetailClient';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return Object.keys(bundleCatalog).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bundle = getBundleBySlug(slug);
  if (!bundle) {
    return generatePageMetadata({
      title: 'Bundle Not Found',
      description: 'This BretuneTech bundle kit could not be found.',
      path: `/bundles/${slug}`,
      noIndex: true,
    });
  }
  return generatePageMetadata({
    title: `${bundle.name} Bundle`,
    description: bundle.description.slice(0, 160),
    path: `/bundles/${bundle.slug}`,
  });
}

export default async function BundleDetailPage({ params }: Props) {
  const { slug } = await params;
  return <BundleDetailClient slug={slug} />;
}
