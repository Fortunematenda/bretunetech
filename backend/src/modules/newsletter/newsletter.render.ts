import prisma from '../../lib/prisma';
import { STOREFRONT_VISIBLE_WHERE } from '../products/product.public';
import type { EmailBlock } from './newsletter.types';
import { newsletterConfig } from './newsletter.config';

const PRIMARY = '#003d7a';
const ACCENT = '#0ea5e9';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPrice(n: number): string {
  return `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

async function resolveProducts(slugs: string[]) {
  if (!slugs.length) return [];
  return prisma.product.findMany({
    where: { ...STOREFRONT_VISIBLE_WHERE, slug: { in: slugs } },
    select: {
      slug: true,
      name: true,
      displayName: true,
      sellingPrice: true,
      shortDescription: true,
      images: { take: 1, orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], select: { url: true, altText: true } },
    },
  });
}

async function resolveCategoryProducts(categorySlug: string, limit = 4) {
  return prisma.product.findMany({
    where: {
      AND: [
        STOREFRONT_VISIBLE_WHERE,
        {
          OR: [
            { category: { slug: categorySlug } },
            { category: { parent: { slug: categorySlug } } },
          ],
        },
      ],
    },
    take: limit,
    orderBy: { updatedAt: 'desc' },
    select: {
      slug: true,
      name: true,
      displayName: true,
      sellingPrice: true,
      shortDescription: true,
      images: { take: 1, orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], select: { url: true, altText: true } },
    },
  });
}

function productGridHtml(products: Awaited<ReturnType<typeof resolveProducts>>, trackBase?: string) {
  if (!products.length) return '';
  const rows = products
    .map((p) => {
      const name = escapeHtml(p.displayName || p.name);
      const url = `${newsletterConfig.siteUrl}/products/${encodeURIComponent(p.slug)}`;
      const href = trackBase ? `${trackBase}&url=${encodeURIComponent(url)}` : url;
      const img = p.images[0]?.url
        ? `<img src="${escapeHtml(p.images[0].url)}" alt="" width="120" height="120" style="object-fit:contain;border-radius:8px;" />`
        : '';
      return `<tr><td style="padding:12px;vertical-align:top;width:130px;">${img}</td>
<td style="padding:12px;vertical-align:top;"><a href="${href}" style="color:${PRIMARY};font-weight:600;text-decoration:none;">${name}</a>
<p style="margin:4px 0 0;font-size:14px;color:#475569;">${formatPrice(p.sellingPrice)}</p></td></tr>`;
    })
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}

export async function renderBlocksToHtml(
  blocks: EmailBlock[],
  opts?: { unsubscribeUrl?: string; preferencesUrl?: string; openPixelUrl?: string; recipientId?: string },
): Promise<{ html: string; text: string }> {
  const trackClick = opts?.recipientId
    ? `${newsletterConfig.apiPublicUrl}/newsletter/track/click/${opts.recipientId}?`
    : undefined;

  const parts: string[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case 'hero':
        parts.push(
          `<div style="background:linear-gradient(135deg,${PRIMARY},#0059b3);color:#fff;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
<h1 style="margin:0 0 8px;font-size:26px;">${escapeHtml(block.headline)}</h1>
${block.subhead ? `<p style="margin:0;opacity:0.9;font-size:16px;">${escapeHtml(block.subhead)}</p>` : ''}
</div>`,
        );
        break;
      case 'richtext':
        parts.push(`<div style="padding:20px 24px;font-size:16px;line-height:1.6;color:#1e293b;">${block.html}</div>`);
        break;
      case 'products': {
        const products = await resolveProducts(block.productSlugs);
        parts.push(
          `<div style="padding:8px 16px 16px;">${productGridHtml(products, trackClick)}</div>`,
        );
        break;
      }
      case 'category': {
        const products = await resolveCategoryProducts(block.categorySlug, block.limit ?? 4);
        parts.push(
          `<p style="padding:0 16px;font-size:14px;color:#64748b;"><a href="${newsletterConfig.siteUrl}/products/category/${encodeURIComponent(block.categorySlug)}" style="color:${PRIMARY};">View category →</a></p>
<div style="padding:8px 16px 16px;">${productGridHtml(products, trackClick)}</div>`,
        );
        break;
      }
      case 'services': {
        const slugs = block.slugs ?? ['wifi-installations', 'cctv-setup', 'network-installation'];
        const links = slugs
          .map(
            (slug) =>
              `<li style="margin-bottom:8px;"><a href="${newsletterConfig.siteUrl}/services/${slug}" style="color:${PRIMARY};">${escapeHtml(slug.replace(/-/g, ' '))}</a></li>`,
          )
          .join('');
        parts.push(`<div style="padding:16px 24px;"><ul style="margin:0;padding-left:20px;">${links}</ul></div>`);
        break;
      }
      case 'cta': {
        const target = trackClick
          ? `${trackClick}url=${encodeURIComponent(block.href.startsWith('http') ? block.href : `${newsletterConfig.siteUrl}${block.href}`)}`
          : block.href.startsWith('http')
            ? block.href
            : `${newsletterConfig.siteUrl}${block.href}`;
        parts.push(
          `<div style="text-align:center;padding:24px;"><a href="${escapeHtml(target)}" style="display:inline-block;background:${ACCENT};color:#fff;padding:14px 28px;border-radius:8px;font-weight:600;text-decoration:none;">${escapeHtml(block.label)}</a></div>`,
        );
        break;
      }
    }
  }

  const footer = `
<div style="padding:24px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;text-align:center;">
<img src="${newsletterConfig.siteUrl}/assets/logo/logo.png" alt="BretuneTech" width="120" style="margin-bottom:12px;" />
<p>Bretune Technologies (Pty) Ltd · Cape Town, South Africa</p>
<p><a href="${newsletterConfig.siteUrl}" style="color:${PRIMARY};">bretunetech.com</a></p>
${
  opts?.unsubscribeUrl
    ? `<p><a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:#64748b;">Unsubscribe</a>${opts.preferencesUrl ? ` · <a href="${escapeHtml(opts.preferencesUrl)}" style="color:#64748b;">Email preferences</a>` : ''}</p>`
    : ''
}
<p style="margin-top:12px;">You received this email because you opted in to marketing from BretuneTech. Processed in line with POPIA.</p>
</div>`;

  const body = parts.join('\n');
  const pixel = opts?.openPixelUrl
    ? `<img src="${escapeHtml(opts.openPixelUrl)}" width="1" height="1" alt="" style="display:block;border:0;" />`
    : '';

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BretuneTech</title></head>
<body style="margin:0;background:#e2e8f0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;">
<div style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
${body}
${footer}
</div>${pixel}</body></html>`;

  const text = `${blocks
    .filter((b) => b.type === 'richtext' || b.type === 'hero')
    .map((b) => ('headline' in b ? b.headline : ''))
    .join('\n')}\n\n${opts?.unsubscribeUrl ? `Unsubscribe: ${opts.unsubscribeUrl}` : ''}`;

  return { html, text };
}