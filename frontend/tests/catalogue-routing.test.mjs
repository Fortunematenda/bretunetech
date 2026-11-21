// Unit tests for the catalogue URL/status/canonical rules.
// Run: node --experimental-strip-types --test tests/catalogue-routing.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (err) {
      if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) return next(`${specifier}.ts`, context);
      throw err;
    }
  },
});

const routing = await import('../src/lib/catalogue-routing.ts');
const seo = await import('../src/lib/category-seo.ts');
const {
  sanitiseListingParams,
  resolveCategory,
  listingSeo,
  isPageOutOfRange,
  categoryListingUrl,
  toApiQuery,
  parsePage,
} = routing;
const SITE = seo.SITE_URL;

test('valid database category resolves as-is', () => {
  assert.deepEqual(resolveCategory('network-switches', new Set(['network-switches'])), { kind: 'ok', slug: 'network-switches' });
});

test('configured landing resolves even without a database row', () => {
  assert.equal(resolveCategory('networking', new Set()).kind, 'ok');
});

test('mixed-case slug redirects to the lowercase URL', () => {
  assert.deepEqual(resolveCategory('Network-Switches', new Set(['network-switches'])), { kind: 'redirect', slug: 'network-switches' });
});

test('verified legacy slug redirects to its mapped category', () => {
  const [legacy, target] = Object.entries(seo.LEGACY_CATEGORY_REDIRECTS)[0];
  assert.deepEqual(resolveCategory(legacy, new Set()), { kind: 'redirect', slug: target });
});

test('intentionally removed category is gone, unknown is missing', () => {
  assert.equal(resolveCategory('mice', new Set()).kind, 'gone');
  assert.equal(resolveCategory('does-not-exist', new Set(['network-switches'])).kind, 'missing');
  assert.equal(resolveCategory('../etc', new Set()).kind, 'missing');
});

test('sanitise keeps meaningful filters and drops junk', () => {
  const p = sanitiseListingParams({
    category: 'Network-Switches',
    sort: 'price_asc',
    page: '3',
    inStock: 'true',
    minPrice: '100',
    bogus: 'x',
    condition: 'used',
    limit: '15',
  });
  assert.deepEqual(p, { category: 'network-switches', sort: 'price_asc', page: '3', inStock: 'true', minPrice: '100' });
  assert.equal(parsePage('0'), 1);
  assert.equal(parsePage('abc'), 1);
});

test('category consolidation URL preserves filters, sort and pagination', () => {
  const p = sanitiseListingParams({ category: 'network-switches', sort: 'price_asc', page: '2', brand: 'ubiquiti' });
  assert.equal(categoryListingUrl('network-switches', p), '/products/category/network-switches?brand=ubiquiti&sort=price_asc&page=2');
});

test('filter shortcuts expand for the API', () => {
  assert.equal(toApiQuery({ filter: 'under-500' }).maxPrice, '500');
  assert.equal(toApiQuery({ filter: 'in-stock' }).inStock, 'true');
});

test('unfiltered listing pages are self-canonical and indexable', () => {
  const base = '/products/category/network-switches';
  assert.deepEqual(listingSeo(base, {}, 40), { canonical: `${SITE}${base}`, robots: { index: true, follow: true } });
  assert.equal(listingSeo(base, { page: '2' }, 40).canonical, `${SITE}${base}?page=2`);
});

test('sort-only views canonicalise to the unsorted page', () => {
  const base = '/products/category/network-switches';
  const r = listingSeo(base, { sort: 'price_desc', page: '2' }, 40);
  assert.equal(r.canonical, `${SITE}${base}?page=2`);
  assert.equal(r.robots.index, true);
});

test('subset filters are noindex with a self-canonical', () => {
  const base = '/products/category/network-switches';
  const r = listingSeo(base, { brand: 'ubiquiti', inStock: 'true' }, 4);
  assert.equal(r.robots.index, false);
  assert.equal(r.canonical, `${SITE}${base}?brand=ubiquiti&inStock=true`);
});

test('empty listing is noindex (not a soft 404)', () => {
  assert.equal(listingSeo('/products/category/cctv-security', {}, 0).robots.index, false);
});

test('pages past the end are out of range', () => {
  assert.equal(isPageOutOfRange(1, 0, 15), false);
  assert.equal(isPageOutOfRange(2, 0, 15), true);
  assert.equal(isPageOutOfRange(3, 40, 15), false);
  assert.equal(isPageOutOfRange(4, 40, 15), true);
});
