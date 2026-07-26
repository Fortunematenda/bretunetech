#!/usr/bin/env node
/**
 * Phase 6 SEO regression smoke checks.
 * Usage:
 *   node frontend/scripts/seo-regression-smoke.mjs
 *   BASE_URL=https://bretunetech.com node frontend/scripts/seo-regression-smoke.mjs
 */

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const PATHS_200 = ['/', '/products', '/services', '/quote', '/contact', '/robots.txt', '/sitemap.xml'];
const NOINDEX_PATHS = ['/cart', '/checkout', '/account'];

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}`, {
    redirect: 'follow',
    headers: { 'user-agent': 'bretunetech-seo-smoke/1.0' },
    signal: AbortSignal.timeout(20000),
  });
  const text = await res.text();
  return { status: res.status, text, url: res.url };
}

function hasNoIndex(html) {
  return /noindex/i.test(html) || /robots["']\s+content=["'][^"']*noindex/i.test(html);
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

for (const path of PATHS_200) {
  try {
    const { status, text } = await fetchText(path);
    if (status !== 200) bad(`${path} → HTTP ${status}`);
    else ok(`${path} → 200`);

    if (path === '/robots.txt') {
      if (!/Allow:\s*\//i.test(text)) bad('robots.txt missing Allow: /');
      else ok('robots.txt allows /');
      if (!/sitemap\.xml/i.test(text)) bad('robots.txt missing sitemap');
      else ok('robots.txt lists sitemap');
      if (/Disallow:\s*\/\s*$/m.test(text) && !/Disallow:\s*\/(admin|account|cart|checkout)/i.test(text)) {
        // only flag accidental full-site disallow
      }
      if (/Disallow:\s*\/\s*$/m.test(text)) bad('robots.txt appears to disallow entire site');
    }

    if (path === '/sitemap.xml') {
      if (/localhost/i.test(text)) bad('sitemap.xml contains localhost');
      else ok('sitemap.xml has no localhost');
      if (!/https:\/\/bretunetech\.com/i.test(text) && BASE.includes('bretunetech.com')) {
        bad('sitemap.xml missing https://bretunetech.com locs');
      } else if (/https:\/\/bretunetech\.com/i.test(text)) {
        ok('sitemap.xml uses production host');
      } else {
        ok('sitemap.xml parsed (local/staging host OK)');
      }
    }
  } catch (err) {
    bad(`${path} → ${err.message}`);
  }
}

console.log('\nNoindex private funnels');
for (const path of NOINDEX_PATHS) {
  try {
    const { status, text } = await fetchText(path);
    if (status >= 500) bad(`${path} → HTTP ${status}`);
    else if (!hasNoIndex(text)) bad(`${path} → missing noindex in HTML`);
    else ok(`${path} → noindex present (${status})`);
  } catch (err) {
    bad(`${path} → ${err.message}`);
  }
}

console.log(failed ? `\nFAILED (${failed})` : '\nALL CHECKS PASSED');
process.exit(failed ? 1 : 0);
