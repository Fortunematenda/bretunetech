#!/usr/bin/env node
/**
 * SEO validation suite for BretuneTech storefront.
 *
 * Usage:
 *   node frontend/scripts/seo-regression-smoke.mjs
 *   BASE_URL=https://bretunetech.com node frontend/scripts/seo-regression-smoke.mjs
 *   PRODUCT_SLUG=some-slug CATEGORY_SLUG=networking node frontend/scripts/seo-regression-smoke.mjs
 */

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const CATEGORY_SLUG = process.env.CATEGORY_SLUG || 'networking';

async function fetchText(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    redirect: opts.redirect || 'follow',
    headers: { 'user-agent': 'bretunetech-seo-smoke/2.0' },
    signal: AbortSignal.timeout(25000),
  });
  const text = await res.text();
  return { status: res.status, text, url: res.url, headers: res.headers };
}

function extractJsonLd(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      blocks.push(JSON.parse(m[1]));
    } catch {
      blocks.push({ __invalid: true, raw: m[1].slice(0, 200) });
    }
  }
  return blocks;
}

let failed = 0;
function ok(msg) {
  console.log(`  ✓ ${msg}`);
}
function bad(msg) {
  failed += 1;
  console.error(`  ✗ ${msg}`);
}

console.log(`SEO regression smoke → ${BASE}\n`);

// ── Static / robots / sitemap ──
for (const path of ['/', '/products', '/services', '/quote', '/contact', '/robots.txt', '/sitemap.xml']) {
  try {
    const { status, text } = await fetchText(path);
    if (status !== 200) bad(`${path} → HTTP ${status}`);
    else ok(`${path} → 200`);

    if (path === '/robots.txt') {
      if (!/Allow:\s*\//i.test(text)) bad('robots.txt missing Allow: /');
      else ok('robots.txt allows /');
      if (!/Sitemap:\s*https:\/\/bretunetech\.com\/sitemap\.xml/i.test(text)) {
        bad('robots.txt missing production sitemap declaration');
      } else ok('robots.txt lists sitemap');
      if (/Disallow:\s*\/\s*$/m.test(text)) bad('robots.txt appears to disallow entire site');
      if (!/Disallow:\s*\/admin/i.test(text)) bad('robots.txt should disallow /admin');
      else ok('robots.txt disallows admin');
      if (!/Disallow:\s*\/cart/i.test(text)) bad('robots.txt should disallow /cart');
      else ok('robots.txt disallows cart');
    }

    if (path === '/sitemap.xml') {
      if (/localhost/i.test(text)) bad('sitemap.xml contains localhost');
      else ok('sitemap.xml has no localhost');
      if (/\/products\?category=/i.test(text)) bad('sitemap still lists query-string category URLs');
      else ok('sitemap has no ?category= URLs');
      if (!/\/products\/category\//i.test(text) && BASE.includes('bretunetech.com')) {
        bad('sitemap missing clean /products/category/ URLs');
      } else if (/\/products\/category\//i.test(text)) {
        ok('sitemap includes clean category URLs');
      }
      if (/catalogue-archived/i.test(text)) bad('sitemap mentions catalogue-archived');
    }
  } catch (err) {
    bad(`${path} → ${err.message}`);
  }
}

// ── Discover a real product slug from sitemap or API ──
let productSlug = process.env.PRODUCT_SLUG || '';
if (!productSlug) {
  try {
    const { text } = await fetchText('/sitemap.xml');
    const m = text.match(/\/products\/([a-z0-9-]+)</i);
    if (m) productSlug = m[1];
  } catch {}
}

console.log('\nProduct SSR');
if (!productSlug) {
  bad('Could not resolve a product slug for PDP checks');
} else {
  console.log(`  using slug: ${productSlug}`);
  try {
    const { status, text } = await fetchText(`/products/${productSlug}`);
    if (status !== 200) bad(`PDP → HTTP ${status}`);
    else ok(`PDP → 200`);

    if (/Loading product\.\.\./i.test(text) && !/<h1[\s\S]{0,200}Loading product/i.test(text) === false) {
      // Fail if the page is primarily a loading shell
    }
    if (/Loading product\.\.\./i.test(text) && !/<h1/i.test(text)) {
      bad('PDP HTML is loading shell only');
    } else if (/Loading product\.\.\./i.test(text)) {
      bad('PDP HTML still contains "Loading product..."');
    } else {
      ok('PDP HTML does not contain Loading product...');
    }

    if (!/<h1[\s\S]*?<\/h1>/i.test(text)) bad('PDP missing <h1>');
    else ok('PDP has <h1>');

    const h1 = (text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim() || '';
    if (h1.length < 3) bad('PDP h1 empty');
    else ok(`PDP h1 present (${h1.slice(0, 60)})`);

    if (!/(R\s*\d|ZAR|sellingPrice|Price)/i.test(text)) bad('PDP HTML missing price signal');
    else ok('PDP HTML contains price signal');

    if (!/rel=["']canonical["']/i.test(text)) bad('PDP missing canonical');
    else {
      const canon = (text.match(/rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
        text.match(/href=["']([^"']+)["'][^>]*rel=["']canonical["']/i) || [])[1];
      if (canon && canon.includes(`/products/${productSlug}`)) ok(`PDP canonical OK (${canon})`);
      else if (canon) ok(`PDP canonical present (${canon})`);
      else bad('PDP canonical href missing');
    }

    const ld = extractJsonLd(text);
    const productLd = ld.find((b) => b?.['@type'] === 'Product' || (Array.isArray(b?.['@type']) && b['@type'].includes('Product')));
    if (!productLd) bad('PDP missing Product JSON-LD');
    else if (productLd.__invalid) bad('Product JSON-LD invalid JSON');
    else {
      ok('Product JSON-LD parses');
      if (!productLd.offers) bad('Product JSON-LD missing offers');
      else ok('Product JSON-LD has offers');
      if (productLd.aggregateRating && !(productLd.aggregateRating.reviewCount > 0)) {
        bad('Product JSON-LD has empty AggregateRating');
      }
    }

    const crumb = ld.find((b) => b?.['@type'] === 'BreadcrumbList');
    if (!crumb) bad('PDP missing BreadcrumbList JSON-LD');
    else ok('PDP has BreadcrumbList JSON-LD');
  } catch (err) {
    bad(`PDP → ${err.message}`);
  }
}

console.log('\nCategory SSR');
try {
  const { status, text } = await fetchText(`/products/category/${CATEGORY_SLUG}`);
  if (status !== 200) bad(`category → HTTP ${status}`);
  else ok(`category /products/category/${CATEGORY_SLUG} → 200`);

  if (/0 products found/i.test(text) && !/href=["']\/products\//i.test(text)) {
    bad('Category HTML shows 0 products and no product links');
  } else if (/0 products found/i.test(text)) {
    bad('Category HTML still shows "0 products found"');
  } else {
    ok('Category HTML does not show 0 products found');
  }

  const productLinks = (text.match(/href=["']\/products\/(?!category\/)[a-z0-9-]+/gi) || []).length;
  if (productLinks < 1) bad('Category HTML missing product detail links');
  else ok(`Category HTML has ${productLinks} product link(s)`);

  if (!/rel=["']canonical["']/i.test(text)) bad('Category missing canonical');
  else ok('Category has canonical');
} catch (err) {
  bad(`category → ${err.message}`);
}

console.log('\nLegacy category redirect / canonical');
try {
  const { status, url, text } = await fetchText(`/products?category=${CATEGORY_SLUG}`, {
    redirect: 'follow',
  });
  if (status !== 200) bad(`legacy category → HTTP ${status}`);
  else ok(`legacy category resolves → 200`);
  if (url.includes(`/products/category/${CATEGORY_SLUG}`)) {
    ok('legacy ?category= redirected to clean category URL');
  } else if (/rel=["']canonical["'][^>]*products\/category\//i.test(text) || /href=["'][^"']*products\/category\//i.test(text)) {
    ok('legacy category page canonicalises to clean URL');
  } else {
    bad('legacy ?category= did not redirect/canonicalise to clean category URL');
  }
} catch (err) {
  bad(`legacy category → ${err.message}`);
}

console.log('\nSearch / filter noindex');
try {
  const { status, text } = await fetchText('/products?search=router');
  if (status >= 500) bad(`search → HTTP ${status}`);
  else if (!/noindex/i.test(text)) bad('search results missing noindex');
  else ok('search results are noindex');
} catch (err) {
  bad(`search → ${err.message}`);
}

console.log('\nUnknown product 404');
try {
  const { status } = await fetchText('/products/this-product-does-not-exist-seo-test-xyz', {
    redirect: 'manual',
  });
  if (status === 404) ok('unknown product → 404');
  else bad(`unknown product → HTTP ${status} (expected 404)`);
} catch (err) {
  bad(`unknown product → ${err.message}`);
}

console.log('\nArchived products excluded from sitemap');
try {
  const { text } = await fetchText('/sitemap.xml');
  // Soft check: sitemap should not include obvious admin/cart paths
  if (/\/(cart|checkout|admin|account|wishlist)\b/i.test(text)) {
    bad('sitemap includes private funnel URLs');
  } else {
    ok('sitemap excludes private funnel URLs');
  }
} catch (err) {
  bad(`sitemap archive check → ${err.message}`);
}

console.log(failed ? `\nFAILED (${failed})` : '\nALL CHECKS PASSED');
process.exit(failed ? 1 : 0);
