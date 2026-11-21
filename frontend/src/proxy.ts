import { NextResponse, type NextRequest } from 'next/server';
import { isRemovedCategorySlug } from '@/lib/category-seo';
import { DEFAULT_API_URL } from '@/lib/config';

const apiUrl = () => process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

/**
 * 410 Gone for intentionally removed catalogue URLs (App Router pages can only
 * emit 404):
 * - removed categories, as clean URLs and legacy query forms;
 * - products the API reports as removed (deleted, archived, discontinued).
 * Any lookup failure falls through to the page, which renders normally.
 */
function goneHtml(heading: string, body: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${heading} | BretuneTech</title></head><body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem;color:#1f2937"><h1 style="color:#003d7a">${heading}</h1><p>${body}</p><p><a href="/products">Browse current products</a> · <a href="/">Home</a></p></body></html>`;
}

const CATEGORY_GONE = goneHtml('This category is no longer available', 'BretuneTech no longer sells products in this category.');
const PRODUCT_GONE = goneHtml('This product is no longer available', 'This product has been removed from the BretuneTech catalogue.');

function gone(request: NextRequest, html: string) {
  return new NextResponse(request.method === 'HEAD' ? null : html, {
    status: 410,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'x-robots-tag': 'noindex',
    },
  });
}

function decode(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function removedCategoryIn(request: NextRequest): boolean {
  const { pathname, searchParams } = request.nextUrl;
  const match = /^\/products\/category\/([^/]+)\/?$/.exec(pathname);
  if (match) return isRemovedCategorySlug(decode(match[1]));
  if (pathname === '/products' || pathname === '/products/') {
    const slug = searchParams.get('category') || searchParams.get('solution');
    return Boolean(slug && isRemovedCategorySlug(slug));
  }
  return false;
}

const PRODUCT_STATUS_TTL_MS = 10 * 60 * 1000;
const PRODUCT_STATUS_MAX = 5000;
const productGoneCache = new Map<string, { gone: boolean; expires: number }>();

async function isProductGone(slug: string): Promise<boolean> {
  const now = Date.now();
  const cached = productGoneCache.get(slug);
  if (cached && cached.expires > now) return cached.gone;
  try {
    const res = await fetch(`${apiUrl()}/products/${encodeURIComponent(slug)}`, {
      method: 'HEAD',
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });
    if (res.status >= 500) return false;
    const isGone = res.status === 410;
    if (productGoneCache.size >= PRODUCT_STATUS_MAX) productGoneCache.delete(productGoneCache.keys().next().value!);
    productGoneCache.set(slug, { gone: isGone, expires: now + PRODUCT_STATUS_TTL_MS });
    return isGone;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  if (removedCategoryIn(request)) return gone(request, CATEGORY_GONE);

  const product = /^\/products\/([^/]+)\/?$/.exec(request.nextUrl.pathname);
  if (product && product[1] !== 'category' && (await isProductGone(decode(product[1])))) {
    return gone(request, PRODUCT_GONE);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/products', '/products/category/:slug*', '/products/:slug'],
};
