import prisma from '../../lib/prisma';
import { STOREFRONT_VISIBLE_WHERE } from '../products/product.public';
import type { EmailBlock } from './newsletter.types';
import { newsletterConfig } from './newsletter.config';

const PRIMARY = '#003d7a';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Strip script/event-handler injection from richtext blocks before email HTML assembly. */
function sanitizeRichHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>/gi, '')
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
}

function absoluteUrl(href: string): string {
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  return `${newsletterConfig.siteUrl}${href.startsWith('/') ? href : `/${href}`}`;
}

function formatPrice(n: number): string {
  return `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function productSlugFromInput(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/\/products\/(?!category\/)([^/?#]+)/i);
  if (!match) return trimmed;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

async function resolveProducts(slugs: string[]) {
  const normalized = [...new Set(slugs.map(productSlugFromInput).filter(Boolean))];
  if (!normalized.length) return [];
  return prisma.product.findMany({
    where: { ...STOREFRONT_VISIBLE_WHERE, slug: { in: normalized } },
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

function productGridHtml(
  products: Awaited<ReturnType<typeof resolveProducts>>,
  linkFor?: (href: string) => string,
) {
  if (!products.length) return '';
  const rows = products
    .map((p) => {
      const name = escapeHtml(p.displayName || p.name);
      const url = `${newsletterConfig.siteUrl}/products/${encodeURIComponent(p.slug)}`;
      const href = linkFor ? linkFor(url) : url;
      const img = p.images[0]?.url
        ? `<img src="${escapeHtml(p.images[0].url)}" alt="" width="120" height="120" style="object-fit:contain;border-radius:8px;" />`
        : '';
      return `<tr><td style="padding:12px;vertical-align:top;width:130px;">${img}</td>
<td style="padding:12px;vertical-align:top;"><a href="${escapeHtml(href)}" style="color:${PRIMARY};font-weight:600;text-decoration:none;">${name}</a>
<p style="margin:4px 0 0;font-size:14px;color:#475569;">${formatPrice(p.sellingPrice)}</p></td></tr>`;
    })
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}

export async function renderBlocksToHtml(
  blocks: EmailBlock[],
  opts?: {
    unsubscribeUrl?: string;
    preferencesUrl?: string;
    openPixelUrl?: string;
    recipientId?: string;
    signClick?: (href: string) => string;
  },
): Promise<{ html: string; text: string }> {
  const linkFor = (href: string) => (opts?.signClick ? opts.signClick(href) : href);

  const parts: string[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case 'eyebrow':
        parts.push(
          `<p style="margin:0;padding:28px 24px 0;text-align:center;font-size:12px;letter-spacing:0.14em;color:#64748b;font-weight:600;">${escapeHtml(block.text)}</p>`,
        );
        break;
      case 'hero': {
        const heroImg = block.imageUrl
          ? `<img src="${escapeHtml(absoluteUrl(block.imageUrl))}" alt="" width="640" style="width:100%;max-height:280px;object-fit:cover;display:block;border:0;" />`
          : '';
        parts.push(
          `${heroImg}<div style="padding:12px 28px 8px;text-align:center;color:#0f172a;">
<h1 style="margin:0 0 10px;font-size:28px;line-height:1.25;font-weight:700;">${escapeHtml(block.headline)}</h1>
${block.subhead ? `<p style="margin:0;color:#475569;font-size:16px;line-height:1.5;">${escapeHtml(block.subhead)}</p>` : ''}
</div>`,
        );
        break;
      }
      case 'features': {
        const cells = block.items
          .map((item) => {
            const img = absoluteUrl(item.imageUrl);
            return `<td width="50%" valign="top" style="padding:8px;">
<img src="${escapeHtml(img)}" alt="" width="260" style="width:100%;height:160px;object-fit:cover;border-radius:12px;display:block;" />
<p style="margin:12px 0 4px;font-size:16px;font-weight:700;color:#0f172a;">${escapeHtml(item.title)}</p>
<p style="margin:0;font-size:14px;line-height:1.45;color:#64748b;">${escapeHtml(item.text)}</p>
</td>`;
          })
          .join('');
        parts.push(`<div style="padding:16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table></div>`);
        break;
      }
      case 'richtext':
        parts.push(
          `<div style="padding:20px 24px;font-size:16px;line-height:1.6;color:#1e293b;">${sanitizeRichHtml(block.html)}</div>`,
        );
        break;
      case 'divider':
        parts.push(
          `<div style="padding:8px 28px;"><hr style="border:0;border-top:1px solid #cbd5e1;margin:0;" /></div>`,
        );
        break;
      case 'spacer':
        parts.push(`<div style="height:${Math.min(120, Math.max(8, block.height ?? 24))}px;line-height:0;font-size:0;">&nbsp;</div>`);
        break;
      case 'contact': {
        const lines = [
          block.phone ? `<p style="margin:0 0 4px;">Phone: ${escapeHtml(block.phone)}</p>` : '',
          block.email ? `<p style="margin:0 0 4px;">Email: ${escapeHtml(block.email)}</p>` : '',
          block.address ? `<p style="margin:0 0 4px;">${escapeHtml(block.address)}</p>` : '',
          block.hours ? `<p style="margin:0;">Hours: ${escapeHtml(block.hours)}</p>` : '',
        ]
          .filter(Boolean)
          .join('');
        parts.push(
          `<div style="padding:16px 24px;font-size:14px;color:#334155;background:#f1f5f9;">
<p style="margin:0 0 8px;font-weight:700;color:#0f172a;">Contact BretuneTech</p>${lines || '<p style="margin:0;">Cape Town, South Africa</p>'}
</div>`,
        );
        break;
      }
      case 'offer':
        parts.push(
          `<div style="margin:12px 24px;padding:16px;border:1px dashed ${PRIMARY};border-radius:12px;background:#eff6ff;">
<p style="margin:0 0 6px;font-size:18px;font-weight:700;color:${PRIMARY};">${escapeHtml(block.headline)}</p>
<p style="margin:0;font-size:14px;color:#334155;">${escapeHtml(block.detail)}</p>
${block.code ? `<p style="margin:10px 0 0;font-size:13px;font-weight:600;">Code: <span style="letter-spacing:0.06em;">${escapeHtml(block.code)}</span></p>` : ''}
${block.expiresAt ? `<p style="margin:4px 0 0;font-size:12px;color:#64748b;">Expires ${escapeHtml(block.expiresAt)}</p>` : ''}
</div>`,
        );
        break;
      case 'project': {
        const img = block.imageUrl
          ? `<img src="${escapeHtml(absoluteUrl(block.imageUrl))}" alt="" width="560" style="width:100%;border-radius:10px;display:block;margin-bottom:10px;" />`
          : '';
        const title = block.href
          ? `<a href="${escapeHtml(linkFor(absoluteUrl(block.href)))}" style="color:${PRIMARY};text-decoration:none;">${escapeHtml(block.title)}</a>`
          : escapeHtml(block.title);
        parts.push(
          `<div style="padding:16px 24px;">${img}<p style="margin:0 0 6px;font-size:17px;font-weight:700;color:#0f172a;">${title}</p>
<p style="margin:0;font-size:14px;line-height:1.5;color:#475569;">${escapeHtml(block.summary)}</p></div>`,
        );
        break;
      }
      case 'products': {
        const products = await resolveProducts(block.productSlugs);
        parts.push(
          `<div style="padding:8px 16px 16px;">${productGridHtml(products, linkFor)}</div>`,
        );
        break;
      }
      case 'category': {
        const products = await resolveCategoryProducts(block.categorySlug, block.limit ?? 4);
        const categoryHref = linkFor(
          `${newsletterConfig.siteUrl}/products/category/${encodeURIComponent(block.categorySlug)}`,
        );
        parts.push(
          `<p style="padding:0 16px;font-size:14px;color:#64748b;"><a href="${escapeHtml(categoryHref)}" style="color:${PRIMARY};">View category →</a></p>
<div style="padding:8px 16px 16px;">${productGridHtml(products, linkFor)}</div>`,
        );
        break;
      }
      case 'services': {
        const slugs = block.slugs ?? ['wifi-installations', 'cctv-setup', 'network-installation'];
        const links = slugs
          .map((slug) => {
            const href = linkFor(`${newsletterConfig.siteUrl}/services/${slug}`);
            return `<li style="margin-bottom:8px;"><a href="${escapeHtml(href)}" style="color:${PRIMARY};">${escapeHtml(slug.replace(/-/g, ' '))}</a></li>`;
          })
          .join('');
        parts.push(`<div style="padding:16px 24px;"><ul style="margin:0;padding-left:20px;">${links}</ul></div>`);
        break;
      }
      case 'cta': {
        const absolute = block.href.startsWith('http')
          ? block.href
          : `${newsletterConfig.siteUrl}${block.href.startsWith('/') ? block.href : `/${block.href}`}`;
        const target = linkFor(absolute);
        parts.push(
          `<div style="padding:8px 24px 24px;"><a href="${escapeHtml(target)}" style="display:block;background:${PRIMARY};color:#fff;padding:16px 20px;border-radius:10px;font-weight:700;text-decoration:none;text-align:center;font-size:18px;">${escapeHtml(block.label)}${block.sublabel ? `<br><span style="font-size:13px;font-weight:500;opacity:0.9;">${escapeHtml(block.sublabel)}</span>` : ''}</a></div>`,
        );
        break;
      }
    }
  }

  const footer = `
<div style="padding:8px 24px 28px;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
<p style="margin:0 0 6px;">BretuneTech • Cape Town, South Africa</p>
<p style="margin:0;">You are receiving this because you subscribed to BretuneTech updates.${
  opts?.unsubscribeUrl
    ? ` <a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:#64748b;">Unsubscribe</a> at any time.`
    : ' Unsubscribe at any time.'
}</p>
</div>`;

  const body = parts.join('\n');
  const pixel = opts?.openPixelUrl
    ? `<img src="${escapeHtml(opts.openPixelUrl)}" width="1" height="1" alt="" style="display:block;border:0;" />`
    : '';

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BretuneTech</title></head>
<body style="margin:0;background:#eef2f6;font-family:system-ui,-apple-system,Segoe UI,sans-serif;">
<div style="max-width:640px;margin:24px auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
<div style="background:${PRIMARY};color:#fff;text-align:center;padding:18px 16px;">
<div style="font-weight:700;letter-spacing:0.16em;font-size:18px;">BRETUNETECH</div>
<div style="margin-top:4px;font-size:11px;letter-spacing:0.08em;opacity:0.9;">ENTERPRISE TECHNOLOGY. RELIABLE CONNECTIVITY.</div>
</div>
${body}
${footer}
</div>${pixel}</body></html>`;

  const text = `${blocks
    .filter((b) => b.type === 'richtext' || b.type === 'hero')
    .map((b) => ('headline' in b ? b.headline : ''))
    .join('\n')}\n\n${opts?.unsubscribeUrl ? `Unsubscribe: ${opts.unsubscribeUrl}` : ''}`;

  return { html, text };
}