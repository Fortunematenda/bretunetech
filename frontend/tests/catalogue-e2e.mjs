#!/usr/bin/env node
/**
 * End-to-end catalogue regression test: runs the production Next.js build
 * (`next start`) against a mock catalogue API and checks status codes,
 * redirects, canonicals, robots and that API failures never become 404s.
 *
 * Prerequisite: `npm run build`.
 * Run: node tests/catalogue-e2e.mjs
 */
import http from 'node:http';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API_PORT = Number(process.env.E2E_API_PORT || 4799);
const WEB_PORT = Number(process.env.E2E_WEB_PORT || 3999);
const WEB = `http://127.0.0.1:${WEB_PORT}`;
const SITE = 'https://bretunetech.com';

// ---------------------------------------------------------------- mock API
const now = '2026-01-01T00:00:00.000Z';
const CATEGORY = { id: 'c1', name: 'Network Switches', slug: 'network-switches', parent: null };
const BRAND = { id: 'b1', name: 'Ubiquiti', slug: 'ubiquiti' };

function product(i) {
  return {
    id: `p${i}`,
    slug: `mock-switch-${i}`,
    name: `Mock Switch ${i}`,
    displayName: `Mock Switch ${i}`,
    description: `Eight-port managed switch number ${i}.`,
    shortDescription: `Managed switch ${i}.`,
    fullDescription: `Eight-port managed switch number ${i} with PoE.`,
    condition: 'NEW',
    sellingPrice: 1000 + i,
    originalPrice: null,
    discountExpiresAt: null,
    stockQuantity: i === 2 ? 0 : 10,
    stockCpt: i === 2 ? 0 : 10,
    stockJhb: 0,
    stockDbn: 0,
    stockStatus: i === 2 ? 'out_of_stock' : 'in_stock',
    sku: `MOCK-SW-${i}`,
    isFeatured: false,
    isBestSeller: false,
    averageRating: 0,
    reviewCount: 0,
    shippingDays: 3,
    noIndex: false,
    createdAt: now,
    updatedAt: now,
    category: CATEGORY,
    brand: BRAND,
    images: [],
    tags: [],
    specifications: [{ key: 'Ports', value: '8', sortOrder: 0 }],
    documents: [],
    seoTitle: null,
    metaTitle: null,
    metaDescription: null,
    canonicalUrl: null,
    manualUrl: null,
    additionalInfo: null,
  };
}
const PRODUCTS = Array.from({ length: 20 }, (_, i) => product(i + 1));

const state = { failCategories: false };
const unhandled = new Set();

function listFor(q) {
  const category = q.get('category');
  const brand = q.get('brand');
  if (category === 'flaky-category') return null;
  let items = PRODUCTS;
  if (category && !['network-switches', 'networking'].includes(category)) items = [];
  if (brand && brand !== 'ubiquiti') items = [];
  const search = q.get('search');
  if (search) items = items.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  if (q.get('inStock') === 'true') items = items.filter((p) => p.stockStatus !== 'out_of_stock');
  const page = Math.max(1, Number(q.get('page') || 1));
  const limit = Math.max(1, Number(q.get('limit') || 15));
  return {
    products: items.slice((page - 1) * limit, page * limit),
    pagination: { total: items.length, page, limit, pages: Math.max(1, Math.ceil(items.length / limit)) },
  };
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...headers });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

const api = http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${API_PORT}`);
  const p = url.pathname.replace(/^\/api/, '');
  const q = url.searchParams;

  if (p === '/categories') {
    if (state.failCategories) return send(res, 500, { error: 'db down' });
    if (q.get('all') === 'true') {
      return send(res, 200, [
        CATEGORY,
        { id: 'c2', name: 'Empty Cat', slug: 'empty-cat', parent: null },
        { id: 'c3', name: 'Flaky Category', slug: 'flaky-category', parent: null },
      ]);
    }
    return send(res, 200, [{ ...CATEGORY, _count: { products: 20 }, children: [] }]);
  }
  if (p === '/brands') return send(res, 200, [{ ...BRAND, _count: { products: 20 }, publicProductCount: 20 }]);
  if (p === '/products') {
    const list = listFor(q);
    return list ? send(res, 200, list) : send(res, 500, { error: 'upstream failure' });
  }
  const related = p.match(/^\/products\/([^/]+)\/related$/);
  if (related) return send(res, 200, PRODUCTS.slice(0, 4));
  const detail = p.match(/^\/products\/([^/]+)$/);
  if (detail) {
    const slug = decodeURIComponent(detail[1]);
    if (slug === 'upstream-500') return send(res, 500, { error: 'db down' });
    if (slug === 'removed-switch') return send(res, 410, { error: 'Product has been removed' });
    if (slug === 'old-mock-switch') return send(res, 301, undefined, { location: '/api/products/mock-switch-1' });
    const found = PRODUCTS.find((x) => x.slug === slug);
    return found ? send(res, 200, found) : send(res, 404, { error: 'Product not found' });
  }
  unhandled.add(`${req.method} ${p}`);
  send(res, 404, { error: 'not mocked' });
});

// ---------------------------------------------------------------- harness
let failures = 0;
let passes = 0;
function check(name, ok, detail = '') {
  if (ok) passes++;
  else failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !detail ? '' : `\n      ${detail}`}`);
}

async function get(pathname) {
  const res = await fetch(`${WEB}${pathname}`, { redirect: 'manual', headers: { 'user-agent': 'catalogue-e2e' } });
  const body = res.status >= 300 && res.status < 400 ? '' : await res.text();
  return { status: res.status, location: res.headers.get('location') || '', body };
}

const canonicalOf = (html) =>
  (html.match(/<link[^>]+rel="canonical"[^>]*>/i)?.[0].match(/href="([^"]+)"/) || [])[1]?.replace(/&amp;/g, '&') || '';
const robotsOf = (html) => (html.match(/<meta[^>]+name="robots"[^>]*content="([^"]+)"/i) || [])[1] || '';
const locPath = (loc) => (loc.startsWith('http') ? new URL(loc).pathname + new URL(loc).search : loc);

async function expectStatus(pathname, status, extra) {
  const r = await get(pathname);
  check(`${pathname} -> ${status}`, r.status === status, `got ${r.status} ${r.location}`);
  if (extra) await extra(r);
  return r;
}

async function expectRedirect(pathname, status, target) {
  const r = await get(pathname);
  check(`${pathname} -> ${status} ${target}`, r.status === status && locPath(r.location) === target, `got ${r.status} ${r.location}`);
}

function noInternalData(name, html) {
  check(`${name}: no internal fields in HTML/RSC`, !/costPrice|supplierName|supplierSku|lowStockThreshold/.test(html));
}

async function waitForServer() {
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(`${WEB}/robots.txt`);
      if (r.status < 500) return;
    } catch {}
    await sleep(500);
  }
  throw new Error('next start did not become ready');
}

async function run() {
  // Valid category with products.
  await expectStatus('/products/category/network-switches', 200, ({ body }) => {
    check('category HTML lists products', body.includes('Mock Switch 1') && body.includes('Mock Switch 15'));
    check('category self-canonical', canonicalOf(body) === `${SITE}/products/category/network-switches`, canonicalOf(body));
    check('category indexable', !/noindex/.test(robotsOf(body)), robotsOf(body));
    check('pagination is crawlable', body.includes('href="/products/category/network-switches?page=2"'));
    noInternalData('category', body);
  });
  await expectStatus('/products/category/network-switches?page=2', 200, ({ body }) => {
    check('page 2 shows the next products', body.includes('Mock Switch 16'));
    check('page 2 canonical keeps page', canonicalOf(body) === `${SITE}/products/category/network-switches?page=2`, canonicalOf(body));
  });
  await expectStatus('/products/category/network-switches?page=9', 404);
  await expectStatus('/products/category/network-switches?sort=price_asc', 200, ({ body }) => {
    check('sort-only canonical drops sort', canonicalOf(body) === `${SITE}/products/category/network-switches`, canonicalOf(body));
  });
  await expectStatus('/products/category/network-switches?inStock=true', 200, ({ body }) => {
    check('filtered view is noindex', /noindex/.test(robotsOf(body)), robotsOf(body));
    check('filtered view self-canonical', canonicalOf(body) === `${SITE}/products/category/network-switches?inStock=true`, canonicalOf(body));
  });

  // Consolidation of the query-string format.
  await expectRedirect('/products?category=network-switches', 308, '/products/category/network-switches');
  await expectRedirect('/products?category=network-switches&sort=price_asc&page=2', 308, '/products/category/network-switches?sort=price_asc&page=2');
  await expectRedirect('/products/category/Network-Switches', 308, '/products/category/network-switches');
  await expectRedirect('/products?brand=ubiquiti', 308, '/brands/ubiquiti');

  // Missing vs removed.
  await expectStatus('/products/category/does-not-exist', 404);
  await expectStatus('/products?category=does-not-exist', 404);
  await expectStatus('/products/category/mice', 410);
  await expectStatus('/products?category=mice', 410);
  await expectStatus('/products?brand=no-such-brand', 404);

  // Intentionally empty category: 200 with an explicit empty state, noindex.
  await expectStatus('/products/category/empty-cat', 200, ({ body }) => {
    check('empty category is noindex', /noindex/.test(robotsOf(body)), robotsOf(body));
  });

  // Product detail.
  await expectStatus('/products/mock-switch-1', 200, ({ body }) => {
    check('product HTML has name', body.includes('Mock Switch 1'));
    check('product canonical', canonicalOf(body) === `${SITE}/products/mock-switch-1`, canonicalOf(body));
    check('product JSON-LD price matches visible price', /"price":"?1001(\.00)?"?/.test(body));
    noInternalData('product', body);
  });
  await expectStatus('/products/mock-switch-2', 200, ({ body }) => {
    check('out-of-stock product stays a useful 200 page', body.includes('Mock Switch 2') && /OutOfStock/.test(body));
  });
  await expectRedirect('/products/old-mock-switch', 308, '/products/mock-switch-1');
  await expectStatus('/products/does-not-exist', 404);
  await expectStatus('/products/removed-switch', 410, ({ body }) => {
    check('removed product page links back to the catalogue', body.includes('href="/products"'));
  });

  // Upstream failures must not look like "not found" or "empty".
  const p500 = await get('/products/upstream-500');
  check('product API 500 -> 5xx (not 404)', p500.status >= 500, `got ${p500.status}`);
  const c500 = await get('/products/category/flaky-category');
  check('listing API 500 -> 5xx (not empty 200 / 404)', c500.status >= 500, `got ${c500.status}`);
  state.failCategories = true;
  const cat500 = await get('/products/category/network-switches');
  check('categories API 500 -> 5xx (not 404)', cat500.status >= 500, `got ${cat500.status}`);
  const sm500 = await get('/sitemap.xml');
  check('sitemap with API down -> 5xx (not a partial sitemap)', sm500.status >= 500, `got ${sm500.status}`);
  state.failCategories = false;

  // Other listings.
  await expectStatus('/products', 200, ({ body }) => {
    check('/products lists products', body.includes('Mock Switch 1'));
    check('footer links to a category with products', body.includes('href="/products/category/networking"'));
    check('footer hides links to empty categories', !body.includes('href="/products/category/cctv-security"') && !body.includes('href="/products/category/wifi"'));
  });
  await expectStatus('/products?search=switch%201', 200, ({ body }) => {
    check('search results are noindex', /noindex/.test(robotsOf(body)), robotsOf(body));
  });
  await expectStatus('/brands/ubiquiti', 200, ({ body }) => check('brand page lists products', body.includes('Mock Switch 1')));
  await expectStatus('/brands/no-such-brand', 404);

  // Sitemap: only canonical, indexable 200 URLs.
  await expectStatus('/sitemap.xml', 200, ({ body }) => {
    check('sitemap has category', body.includes(`${SITE}/products/category/network-switches<`));
    check('sitemap has product', body.includes(`${SITE}/products/mock-switch-1<`));
    check('sitemap has brand', body.includes(`${SITE}/brands/ubiquiti<`));
    check('sitemap omits empty category', !body.includes('/products/category/empty-cat'));
    check('sitemap omits removed category', !body.includes('/products/category/mice'));
    check('sitemap omits query-string listings', !body.includes('/products?'));
  });
}

api.listen(API_PORT, '127.0.0.1');
const nextBin = path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next');
const web = spawn(process.execPath, [nextBin, 'start', '-p', String(WEB_PORT), '-H', '127.0.0.1'], {
  cwd: ROOT,
  env: { ...process.env, API_URL: `http://127.0.0.1:${API_PORT}/api`, NODE_ENV: 'production', PORT: String(WEB_PORT) },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let webLog = '';
web.stdout.on('data', (d) => (webLog += d));
web.stderr.on('data', (d) => (webLog += d));

try {
  await waitForServer();
  await run();
} catch (err) {
  failures++;
  console.error('E2E harness error:', err);
} finally {
  web.kill();
  api.close();
}

if (unhandled.size) console.log(`\nUnmocked API calls (answered 404): ${[...unhandled].join(', ')}`);
console.log(`\n${passes} passed, ${failures} failed`);
if (failures && process.env.E2E_VERBOSE) console.log(webLog);
process.exit(failures ? 1 : 0);
