import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import express from 'express';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'catalogue-test-secret';

import heroRoutes from '../src/modules/hero/routes';
import marketingAdRoutes from '../src/modules/marketing-ads/routes';
import cartRoutes from '../src/modules/cart/cart.controller';
import productRoutes from '../src/modules/products/product.controller';
import { marketingAdService } from '../src/modules/marketing-ads/marketing-ad.service';
import { heroService } from '../src/modules/hero/hero.service';
import { orderService } from '../src/modules/orders/order.service';
import { productRepository } from '../src/modules/products/product.repository';
import { shopSolutionsService } from '../src/modules/shop-solutions/shop-solutions.service';
import { errorHandler } from '../src/middleware/error-handler';
import { signToken } from '../src/lib/jwt';
import prisma from '../src/lib/prisma';

const db = prisma as any;
const stubs: Array<[object, string, PropertyDescriptor | undefined]> = [];
function stub(target: any, key: string, value: unknown) {
  stubs.push([target, key, Object.getOwnPropertyDescriptor(target, key)]);
  Object.defineProperty(target, key, { configurable: true, writable: true, value });
}

const token = (role: string, userId = `u-${role}`) => signToken({ userId, email: `${userId}@example.com`, role });
const auth = (role: string, userId?: string) => ({ Authorization: `Bearer ${token(role, userId)}` });

let server: Server;
let base: string;

before(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/hero', heroRoutes);
  app.use('/api/marketing-ads', marketingAdRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/products', productRoutes);
  app.use(errorHandler);
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
});

after(async () => {
  for (const [target, key, desc] of stubs.reverse()) {
    if (desc) Object.defineProperty(target, key, desc);
    else delete (target as any)[key];
  }
  await new Promise((resolve) => server.close(resolve));
});

describe('marketing ads are admin-only', () => {
  test('anonymous and customer requests are rejected', async () => {
    assert.equal((await fetch(`${base}/marketing-ads`)).status, 401);
    assert.equal((await fetch(`${base}/marketing-ads/statistics`)).status, 401);
    assert.equal((await fetch(`${base}/marketing-ads`, { method: 'POST' })).status, 401);
    assert.equal((await fetch(`${base}/marketing-ads/x`, { method: 'DELETE' })).status, 401);
    assert.equal((await fetch(`${base}/marketing-ads`, { headers: auth('CUSTOMER') })).status, 403);
  });

  test('admins and super admins can list', async () => {
    stub(marketingAdService, 'listMarketingAds', async () => ({ ads: [], total: 0 }));
    assert.equal((await fetch(`${base}/marketing-ads`, { headers: auth('ADMIN') })).status, 200);
    assert.equal((await fetch(`${base}/marketing-ads`, { headers: auth('SUPER_ADMIN') })).status, 200);
  });
});

describe('hero settings writes are admin-only', () => {
  test('customers cannot update or reset', async () => {
    let writes = 0;
    stub(heroService, 'updateSettings', async () => { writes++; return {}; });
    stub(heroService, 'resetToDefaults', async () => { writes++; return {}; });
    const put = await fetch(`${base}/hero/settings`, {
      method: 'PUT',
      headers: { ...auth('CUSTOMER'), 'content-type': 'application/json' },
      body: '{}',
    });
    assert.equal(put.status, 403);
    assert.equal((await fetch(`${base}/hero/settings/reset`, { method: 'POST', headers: auth('CUSTOMER') })).status, 403);
    assert.equal(writes, 0);
    assert.equal((await fetch(`${base}/hero/settings/reset`, { method: 'POST', headers: auth('ADMIN') })).status, 200);
    assert.equal(writes, 1);
  });
});

describe('cart items can only be changed by their owner', () => {
  test("another user's item is a 404 and is not modified", async () => {
    const calls: string[] = [];
    stub(db, 'cartItem', {
      findFirst: async ({ where }: any) => (where.cart.userId === 'owner' ? { id: where.id } : null),
      update: async () => { calls.push('update'); return {}; },
      delete: async () => { calls.push('delete'); return {}; },
    });

    const put = (userId: string) =>
      fetch(`${base}/cart/items/item-1`, {
        method: 'PUT',
        headers: { ...auth('CUSTOMER', userId), 'content-type': 'application/json' },
        body: JSON.stringify({ quantity: 2 }),
      });
    const del = (userId: string) => fetch(`${base}/cart/items/item-1`, { method: 'DELETE', headers: auth('CUSTOMER', userId) });

    assert.equal((await put('intruder')).status, 404);
    assert.equal((await del('intruder')).status, 404);
    assert.deepEqual(calls, []);

    assert.equal((await put('owner')).status, 200);
    assert.equal((await del('owner')).status, 200);
    assert.deepEqual(calls, ['update', 'delete']);
  });
});

describe('order access', () => {
  test('super admins can open any order; other customers cannot', async () => {
    stub(db, 'order', { findUnique: async () => ({ id: 'o1', userId: 'owner', items: [] }) });
    assert.equal((await orderService.getOrderById('o1', 'admin-1', 'SUPER_ADMIN')).id, 'o1');
    assert.equal((await orderService.getOrderById('o1', 'admin-2', 'ADMIN')).id, 'o1');
    assert.equal((await orderService.getOrderById('o1', 'owner', 'CUSTOMER')).id, 'o1');
    await assert.rejects(orderService.getOrderById('o1', 'someone-else', 'CUSTOMER'), /not found/i);
  });
});

describe('public shop-by-solution cards', () => {
  test('only enabled solutions with storefront products are returned', async () => {
    stub(shopSolutionsService, 'getSettings', async () => ({
      sectionTitle: 'Shop by Solution',
      sectionSubtitle: '',
      items: [
        { id: 'a', slug: 'networking', enabled: true },
        { id: 'b', slug: 'cctv-security', enabled: true },
        { id: 'c', slug: 'wifi', enabled: false },
      ],
    }));
    stub(productRepository, 'countStorefrontVisible', async (slug: string) => (slug === 'networking' ? 12 : 0));
    const data = await shopSolutionsService.getPublic();
    assert.deepEqual(data.items.map((i: any) => i.slug), ['networking']);
  });
});

describe('removed products answer 410', () => {
  const removed = (overrides: Record<string, unknown>) => ({
    id: 'p9',
    slug: 'old-product',
    name: 'Old product',
    isActive: true,
    isDeleted: false,
    status: 'PUBLISHED',
    discontinued: false,
    replacementProductId: null,
    tags: [],
    ...overrides,
  });

  test('archived, deleted and discontinued products are 410; drafts stay 404', async () => {
    stub(db, 'productRedirect', { findUnique: async () => null });
    const cases: Array<[Record<string, unknown>, number]> = [
      [{ tags: [{ tag: 'catalogue-archived' }] }, 410],
      [{ isDeleted: true }, 410],
      [{ discontinued: true, isActive: false }, 410],
      [{ status: 'DRAFT' }, 404],
      [{ isActive: false }, 404],
    ];
    for (const [overrides, expected] of cases) {
      stub(productRepository, 'findBySlug', async () => removed(overrides));
      const res = await fetch(`${base}/products/old-product`);
      assert.equal(res.status, expected, JSON.stringify(overrides));
    }
  });
});
