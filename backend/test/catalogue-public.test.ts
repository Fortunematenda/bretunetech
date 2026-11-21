import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import express from 'express';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'catalogue-test-secret';

import {
  toPublicProductSummary,
  toPublicProductDetail,
  publicTags,
  publicStockStatus,
  isStorefrontVisible,
} from '../src/modules/products/product.public';
import { productRepository } from '../src/modules/products/product.repository';
import productRoutes from '../src/modules/products/product.controller';
import { errorHandler } from '../src/middleware/error-handler';
import { signToken } from '../src/lib/jwt';
import prisma from '../src/lib/prisma';

const SUPPLIER = 'Scoop Technologies';

/** Keys that must never reach an anonymous response, at any depth. */
const FORBIDDEN_KEYS = [
  'costPrice',
  'supplierName',
  'supplierSku',
  'supplierTitle',
  'supplierDescription',
  'supplierSpecifications',
  'vendorId',
  'vendor',
  'lowStockThreshold',
  'seoScore',
  'seoStatus',
  'focusKeyword',
  'secondaryKeywords',
  'schemaJsonLd',
  'seoLocked',
  'replacementProductId',
  'isDeleted',
  'status',
];

function row(overrides: Record<string, any> = {}) {
  return {
    id: 'p1',
    name: 'Ubiquiti UniFi Switch Lite 8 PoE',
    displayName: null,
    slug: 'ubiquiti-unifi-switch-lite-8-poe',
    description: 'Managed 8-port gigabit switch with PoE.',
    shortDescription: 'Managed PoE switch.',
    fullDescription: 'Managed 8-port gigabit switch with four PoE ports.',
    categoryId: 'c1',
    condition: 'NEW',
    costPrice: 1234.56,
    sellingPrice: 1999,
    originalPrice: null,
    discountExpiresAt: null,
    stockQuantity: 3,
    lowStockThreshold: 5,
    supplierName: SUPPLIER,
    sku: 'USW-LITE-8-POE',
    isFeatured: false,
    isBestSeller: false,
    isActive: true,
    isDeleted: false,
    status: 'PUBLISHED',
    vendorId: 'v1',
    vendor: { id: 'v1', name: 'Internal vendor', email: 'vendor@example.com' },
    brandId: 'b1',
    manualUrl: null,
    additionalInfo: null,
    metaTitle: null,
    metaDescription: null,
    focusKeyword: 'poe switch',
    seoScore: 72,
    seoStatus: 'ok',
    averageRating: 0,
    reviewCount: 0,
    shippingDays: 3,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-02-01T00:00:00Z'),
    stockCpt: 3,
    stockDbn: 0,
    stockJhb: 0,
    schemaJsonLd: '{"internal":true}',
    seoTitle: null,
    secondaryKeywords: 'internal keywords',
    imageAltText: null,
    canonicalUrl: null,
    seoLocked: true,
    noIndex: false,
    supplierTitle: 'SCOOP USW-LITE-8',
    supplierDescription: 'Supplier copy',
    supplierSpecifications: 'raw specs',
    supplierSku: 'SCP-12345',
    discontinued: false,
    replacementProductId: null,
    category: { id: 'c1', name: 'Network Switches', slug: 'network-switches', parentId: null, isActive: true, parent: null },
    brand: { id: 'b1', name: 'Ubiquiti', slug: 'ubiquiti', isActive: true },
    images: [{ id: 'i1', url: 'https://img.example/1.jpg', altText: null, isPrimary: true, sortOrder: 0, productId: 'p1' }],
    tags: [{ id: 't1', tag: 'scoop', productId: 'p1' }, { id: 't2', tag: 'poe', productId: 'p1' }],
    specifications: [{ id: 's1', key: 'Ports', value: '8', sortOrder: 0, productId: 'p1' }],
    documents: [],
    ...overrides,
  };
}

function collectKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach((v) => collectKeys(v, keys));
  else if (value && typeof value === 'object' && !(value instanceof Date)) {
    for (const [k, v] of Object.entries(value)) {
      keys.add(k);
      collectKeys(v, keys);
    }
  }
  return keys;
}

function assertNoInternalData(payload: unknown) {
  const keys = collectKeys(payload);
  for (const key of FORBIDDEN_KEYS) assert.ok(!keys.has(key), `response exposes "${key}"`);
  const text = JSON.stringify(payload);
  assert.ok(!text.includes('1234.56'), 'response contains the cost price value');
  assert.ok(!/scoop/i.test(text), 'response contains supplier identity');
  assert.ok(!text.includes('SCP-12345'), 'response contains the supplier SKU');
}

describe('public product DTO', () => {
  test('summary keeps storefront fields and drops internal ones', () => {
    const dto = toPublicProductSummary(row());
    assertNoInternalData(dto);
    assert.equal(dto.sellingPrice, 1999);
    assert.equal(dto.sku, 'USW-LITE-8-POE');
    assert.equal(dto.slug, 'ubiquiti-unifi-switch-lite-8-poe');
    assert.equal(dto.brand?.slug, 'ubiquiti');
    assert.equal(dto.category?.slug, 'network-switches');
    assert.equal(dto.images.length, 1);
    assert.equal(dto.stockStatus, 'low_stock');
  });

  test('detail adds specifications and still drops internal fields', () => {
    const dto = toPublicProductDetail(row());
    assertNoInternalData(dto);
    assert.equal(dto.specifications[0].key, 'Ports');
    assert.ok(dto.fullDescription);
  });

  test('tags hide internal and supplier-identifying tags', () => {
    const tags = publicTags(
      [{ tag: 'scoop' }, { tag: 'catalogue-archived' }, { tag: 'Scoop-Tech' }, { tag: 'poe' }],
      SUPPLIER,
    );
    assert.deepEqual(tags.map((t: any) => t.tag), ['poe']);
  });

  test('stock status is derived without exposing the threshold', () => {
    assert.equal(publicStockStatus({ stockQuantity: 0, stockCpt: 0, stockJhb: 0, stockDbn: 0 }), 'out_of_stock');
    assert.equal(publicStockStatus({ stockQuantity: 2, lowStockThreshold: 5 }), 'low_stock');
    assert.equal(publicStockStatus({ stockQuantity: 50, lowStockThreshold: 5 }), 'in_stock');
  });

  test('drafts, archived and deleted products are not storefront-visible', () => {
    assert.equal(isStorefrontVisible(row()), true);
    assert.equal(isStorefrontVisible(row({ status: 'DRAFT' })), false);
    assert.equal(isStorefrontVisible(row({ isActive: false })), false);
    assert.equal(isStorefrontVisible(row({ isDeleted: true })), false);
    assert.equal(isStorefrontVisible(row({ tags: [{ tag: 'catalogue-archived' }] })), false);
  });
});

describe('product routes', () => {
  let server: Server;
  let base: string;
  const repo = productRepository as any;
  const db = prisma as any;
  const originals = { findMany: repo.findMany, findBySlug: repo.findBySlug };
  let originalRedirect: any;
  let scopes: string[] = [];

  before(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/products', productRoutes);
    app.use(errorHandler);
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/products`;

    originalRedirect = db.productRedirect;
    Object.defineProperty(db, 'productRedirect', {
      configurable: true,
      value: { findUnique: async () => null },
    });
  });

  after(async () => {
    repo.findMany = originals.findMany;
    repo.findBySlug = originals.findBySlug;
    Object.defineProperty(db, 'productRedirect', { configurable: true, value: originalRedirect });
    await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(() => {
    scopes = [];
    repo.findMany = async (_filters: unknown, scope: string) => {
      scopes.push(scope);
      return { products: [row(), row({ id: 'p2', slug: 'second' })], total: 2, page: 1, limit: 15 };
    };
  });

  const token = (role: string) => signToken({ userId: `u-${role}`, email: `${role}@example.com`, role });

  test('anonymous list never exposes internal fields, even with ?status=all', async () => {
    const res = await fetch(`${base}?status=all`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.products.length, 2);
    assertNoInternalData(body);
    assert.deepEqual(scopes, ['public']);
  });

  test('admin list requires authentication', async () => {
    assert.equal((await fetch(`${base}/admin`)).status, 401);
  });

  test('admin list rejects customers', async () => {
    const res = await fetch(`${base}/admin`, { headers: { Authorization: `Bearer ${token('CUSTOMER')}` } });
    assert.equal(res.status, 403);
  });

  test('admin list returns internal fields to admins', async () => {
    const res = await fetch(`${base}/admin?status=DRAFT`, { headers: { Authorization: `Bearer ${token('ADMIN')}` } });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.products[0].costPrice, 1234.56);
    assert.equal(body.products[0].supplierName, SUPPLIER);
    assert.deepEqual(scopes, ['admin']);
  });

  test('product detail is public-safe', async () => {
    repo.findBySlug = async () => row();
    const res = await fetch(`${base}/ubiquiti-unifi-switch-lite-8-poe`);
    assert.equal(res.status, 200);
    assertNoInternalData(await res.json());
  });

  test('draft product detail is a real 404', async () => {
    repo.findBySlug = async () => row({ status: 'DRAFT' });
    assert.equal((await fetch(`${base}/draft-product`)).status, 404);
  });

  test('unknown product detail is a real 404', async () => {
    repo.findBySlug = async () => null;
    assert.equal((await fetch(`${base}/does-not-exist`)).status, 404);
  });
});
