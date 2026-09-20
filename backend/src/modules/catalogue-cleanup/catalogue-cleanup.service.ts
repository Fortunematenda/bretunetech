import { randomUUID } from 'crypto';
import prisma from '../../lib/prisma';
import { BadRequestError, NotFoundError } from '../../lib/errors';
import {
  ClassificationBucket,
  classifyProduct,
  classifiedRowsToCsv,
} from './catalogue-classify';

const SITE_URL = process.env.SITE_URL || 'https://bretunetech.com';
const LOG_GROUP = 'catalogue_cleanup';
export const ARCHIVE_TAG = 'catalogue-archived';

export type CleanupFilters = {
  classification?: ClassificationBucket | 'ALL';
  brand?: string;
  category?: string;
  status?: string;
  stock?: string;
  search?: string;
  includeArchived?: boolean;
};

type Snapshot = {
  isActive: boolean;
  status: string;
  noIndex: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
};

function categoryLabel(p: {
  category?: { name: string; slug: string; parent?: { name: string; slug: string } | null } | null;
}): string {
  if (!p.category) return '';
  if (p.category.parent) return `${p.category.parent.name} / ${p.category.name}`;
  return p.category.name;
}

function hasArchiveTag(tags: { tag: string }[]): boolean {
  return tags.some((t) => t.tag === ARCHIVE_TAG);
}

export class CatalogueCleanupService {
  async loadClassified(filters: CleanupFilters = {}) {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        sellingPrice: true,
        stockQuantity: true,
        stockCpt: true,
        stockJhb: true,
        stockDbn: true,
        isActive: true,
        status: true,
        isDeleted: true,
        noIndex: true,
        isFeatured: true,
        isBestSeller: true,
        description: true,
        shortDescription: true,
        displayName: true,
        brand: { select: { name: true, slug: true } },
        category: {
          select: {
            name: true,
            slug: true,
            parent: { select: { name: true, slug: true } },
          },
        },
        tags: { select: { tag: true } },
      },
      orderBy: { name: 'asc' },
    });

    const alreadyArchived = products.filter((p) => hasArchiveTag(p.tags)).length;
    const source = filters.includeArchived
      ? products
      : products.filter((p) => !hasArchiveTag(p.tags));

    let rows = source.map((p) => {
      const classification = classifyProduct({
        name: p.name,
        sku: p.sku,
        description: p.description,
        shortDescription: p.shortDescription,
        displayName: p.displayName,
        brandName: p.brand?.name,
        categorySlug: p.category?.slug,
        parentSlug: p.category?.parent?.slug,
        categoryName: p.category?.name,
        tags: p.tags.map((t) => t.tag),
      });

      const stockTotal =
        (p.stockQuantity || 0) + (p.stockCpt || 0) + (p.stockJhb || 0) + (p.stockDbn || 0);

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand?.name || '',
        brandSlug: p.brand?.slug || '',
        category: categoryLabel(p),
        categorySlug: p.category?.slug || '',
        price: p.sellingPrice,
        stock: stockTotal,
        inStock: stockTotal > 0,
        status: p.status,
        isActive: p.isActive,
        discontinued: hasArchiveTag(p.tags),
        classification: classification.bucket,
        reason: classification.reason,
        url: `${SITE_URL}/products/${p.slug}`,
        slug: p.slug,
      };
    });

    const totals = {
      total: rows.length,
      KEEP: rows.filter((r) => r.classification === 'KEEP').length,
      REVIEW: rows.filter((r) => r.classification === 'REVIEW').length,
      REMOVE: rows.filter((r) => r.classification === 'REMOVE').length,
      alreadyArchived,
    };

    if (filters.classification && filters.classification !== 'ALL') {
      rows = rows.filter((r) => r.classification === filters.classification);
    }
    if (filters.brand) {
      const b = filters.brand.toLowerCase();
      rows = rows.filter(
        (r) => r.brandSlug === b || r.brand.toLowerCase() === b || r.brand.toLowerCase().includes(b),
      );
    }
    if (filters.category) {
      const c = filters.category.toLowerCase();
      rows = rows.filter(
        (r) => r.categorySlug === c || r.category.toLowerCase().includes(c),
      );
    }
    if (filters.status && filters.status !== 'ALL') {
      rows = rows.filter((r) => r.status === filters.status);
    }
    if (filters.stock === 'in') rows = rows.filter((r) => r.inStock);
    if (filters.stock === 'out') rows = rows.filter((r) => !r.inStock);
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.sku || '').toLowerCase().includes(q) ||
          r.brand.toLowerCase().includes(q) ||
          r.id.toLowerCase() === q,
      );
    }

    const brands = Array.from(new Set(source.map((p) => p.brand?.name).filter(Boolean) as string[])).sort();
    const categories = Array.from(
      new Set(source.map((p) => p.category?.slug).filter(Boolean) as string[]),
    ).sort();

    return { totals, filters, products: rows, brands, categories };
  }

  async exportCsv(filters: CleanupFilters = {}) {
    const { products, totals } = await this.loadClassified(filters);
    const csv = classifiedRowsToCsv(products);
    return { csv, totals, count: products.length };
  }

  private async writeBatchLog(payload: Record<string, unknown>) {
    const batchId = (payload.batchId as string) || randomUUID();
    const key = `catalogue_cleanup_${batchId}`;
    await prisma.setting.upsert({
      where: { key },
      create: {
        key,
        value: JSON.stringify(payload),
        group: LOG_GROUP,
        description: `Catalogue cleanup batch ${batchId}`,
        isPublic: false,
      },
      update: {
        value: JSON.stringify(payload),
        group: LOG_GROUP,
        description: `Catalogue cleanup batch ${batchId}`,
      },
    });
    return batchId;
  }

  async listBatches() {
    const rows = await prisma.setting.findMany({
      where: { group: LOG_GROUP },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
    return rows.map((r) => {
      try {
        return JSON.parse(r.value);
      } catch {
        return { key: r.key, error: 'invalid log' };
      }
    });
  }

  /**
   * Archive selected products (reversible). Does NOT hard-delete.
   * Sets DRAFT + inactive + noIndex + tag catalogue-archived.
   */
  async archiveSelected(opts: {
    productIds: string[];
    adminUserId: string;
    adminEmail?: string;
    confirmText: string;
  }) {
    if (opts.confirmText !== 'ARCHIVE') {
      throw new BadRequestError('Confirmation required: send confirmText = "ARCHIVE"');
    }
    if (!opts.productIds.length) {
      throw new BadRequestError('No products selected');
    }

    const products = await prisma.product.findMany({
      where: { id: { in: opts.productIds } },
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
        isActive: true,
        status: true,
        noIndex: true,
        isFeatured: true,
        isBestSeller: true,
        tags: { select: { id: true, tag: true } },
      },
    });

    const batchId = randomUUID();
    const affected = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      slug: p.slug,
      previous: {
        isActive: p.isActive,
        status: p.status,
        noIndex: p.noIndex,
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
      } satisfies Snapshot,
    }));

    await prisma.$transaction(async (tx) => {
      await tx.product.updateMany({
        where: { id: { in: products.map((p) => p.id) } },
        data: {
          isActive: false,
          status: 'DRAFT',
          noIndex: true,
          isFeatured: false,
          isBestSeller: false,
        },
      });

      for (const p of products) {
        if (!hasArchiveTag(p.tags)) {
          await tx.productTag.create({
            data: { productId: p.id, tag: ARCHIVE_TAG },
          });
        }
      }
    });

    await this.writeBatchLog({
      batchId,
      action: 'ARCHIVE',
      createdAt: new Date().toISOString(),
      adminUserId: opts.adminUserId,
      adminEmail: opts.adminEmail || null,
      count: affected.length,
      products: affected,
    });

    return { batchId, archived: affected.length, products: affected };
  }

  async restoreBatch(opts: {
    batchId: string;
    adminUserId: string;
    adminEmail?: string;
    confirmText: string;
  }) {
    if (opts.confirmText !== 'RESTORE') {
      throw new BadRequestError('Confirmation required: send confirmText = "RESTORE"');
    }

    const key = `catalogue_cleanup_${opts.batchId}`;
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) {
      throw new NotFoundError('Batch log');
    }

    const log = JSON.parse(setting.value) as {
      action: string;
      products: Array<{ id: string; previous: Snapshot; name: string; sku: string | null; slug: string }>;
    };

    if (log.action !== 'ARCHIVE' || !Array.isArray(log.products)) {
      throw new BadRequestError('Batch is not a restorable ARCHIVE log');
    }
    if ((log as any).permanentDeletedAt) {
      throw new BadRequestError('Batch was permanently deleted and cannot be restored');
    }

    await prisma.$transaction(async (tx) => {
      for (const item of log.products) {
        const exists = await tx.product.findUnique({ where: { id: item.id }, select: { id: true } });
        if (!exists) continue;
        await tx.product.update({
          where: { id: item.id },
          data: {
            isActive: item.previous.isActive,
            status: item.previous.status as any,
            noIndex: item.previous.noIndex,
            isFeatured: item.previous.isFeatured,
            isBestSeller: item.previous.isBestSeller,
          },
        });
        await tx.productTag.deleteMany({
          where: { productId: item.id, tag: ARCHIVE_TAG },
        });
      }
    });

    const restoreBatchId = randomUUID();
    await this.writeBatchLog({
      batchId: restoreBatchId,
      action: 'RESTORE',
      restoredFrom: opts.batchId,
      createdAt: new Date().toISOString(),
      adminUserId: opts.adminUserId,
      adminEmail: opts.adminEmail || null,
      count: log.products.length,
      products: log.products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        slug: p.slug,
      })),
    });

    return { batchId: restoreBatchId, restored: log.products.length };
  }

  /**
   * Permanently delete products from an ARCHIVE batch.
   * Detaches order line items (keeps name/price snapshots) then hard-deletes products.
   * Irreversible. Requires confirmText = "DELETE PERMANENT".
   */
  async permanentDeleteBatch(opts: {
    batchId: string;
    adminUserId: string;
    adminEmail?: string;
    confirmText: string;
  }) {
    if (opts.confirmText !== 'DELETE PERMANENT') {
      throw new BadRequestError('Confirmation required: send confirmText = "DELETE PERMANENT"');
    }

    const key = `catalogue_cleanup_${opts.batchId}`;
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) {
      throw new NotFoundError('Batch log');
    }

    const log = JSON.parse(setting.value) as {
      action: string;
      permanentDeletedAt?: string;
      products: Array<{ id: string; name: string; sku: string | null; slug: string; previous?: Snapshot }>;
    };

    if (log.action !== 'ARCHIVE' || !Array.isArray(log.products)) {
      throw new BadRequestError('Only ARCHIVE batches can be permanently deleted');
    }
    if (log.permanentDeletedAt) {
      throw new BadRequestError('Batch was already permanently deleted');
    }

    const ids = log.products.map((p) => p.id);
    const existing = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, sku: true, slug: true },
    });
    const existingIds = existing.map((p) => p.id);

    if (existingIds.length > 0) {
      await prisma.$transaction(async (tx) => {
        // Preserve historical orders: keep name/price, drop FK
        await tx.orderItem.updateMany({
          where: { productId: { in: existingIds } },
          data: { productId: null },
        });

        await tx.cartItem.deleteMany({ where: { productId: { in: existingIds } } });
        await tx.wishlist.deleteMany({ where: { productId: { in: existingIds } } });
        await tx.review.deleteMany({ where: { productId: { in: existingIds } } });
        await tx.stockHistory.deleteMany({ where: { productId: { in: existingIds } } });
        await tx.relatedProduct.deleteMany({
          where: {
            OR: [
              { productId: { in: existingIds } },
              { relatedProductId: { in: existingIds } },
            ],
          },
        });
        await tx.productRedirect.deleteMany({ where: { productId: { in: existingIds } } });
        await tx.productDocument.deleteMany({ where: { productId: { in: existingIds } } });
        await tx.productVariant.deleteMany({ where: { productId: { in: existingIds } } });
        await tx.productImage.deleteMany({ where: { productId: { in: existingIds } } });
        await tx.productTag.deleteMany({ where: { productId: { in: existingIds } } });
        await tx.productSpecification.deleteMany({ where: { productId: { in: existingIds } } });
        await tx.bundleItem.deleteMany({ where: { productId: { in: existingIds } } });
        await tx.returnItem.updateMany({
          where: { productId: { in: existingIds } },
          data: { productId: null },
        });

        await tx.product.deleteMany({ where: { id: { in: existingIds } } });
      });
    }

    const updatedLog = {
      ...log,
      permanentDeletedAt: new Date().toISOString(),
      permanentDeletedBy: opts.adminUserId,
      permanentDeletedCount: existingIds.length,
    };
    await prisma.setting.update({
      where: { key },
      data: { value: JSON.stringify(updatedLog) },
    });

    const deleteBatchId = randomUUID();
    await this.writeBatchLog({
      batchId: deleteBatchId,
      action: 'DELETE_PERMANENT',
      deletedFrom: opts.batchId,
      createdAt: new Date().toISOString(),
      adminUserId: opts.adminUserId,
      adminEmail: opts.adminEmail || null,
      count: existingIds.length,
      products: existing,
    });

    return {
      batchId: deleteBatchId,
      deleted: existingIds.length,
      alreadyGone: ids.length - existingIds.length,
    };
  }
}

export const catalogueCleanupService = new CatalogueCleanupService();
