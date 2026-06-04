import prisma from '../../lib/prisma';
import { CreateBundleDto, UpdateBundleDto } from './bundle.dto';
import { NotFoundError } from '../../lib/errors';
import { generateSlug } from '../../utils/slug';
import { logger } from '../../lib/logger';

const log = logger.child('BundleService');

export class BundleService {
  async listBundles(featured?: string) {
    const where: any = { isActive: true };
    if (featured === 'true') where.isFeatured = true;

    const bundles = await prisma.bundle.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bundles.map((bundle) => {
      const originalPrice = bundle.items.reduce(
        (sum, item) => sum + item.product.sellingPrice * item.quantity, 0
      );
      const savings = originalPrice - bundle.bundlePrice;
      const discountPercentage = originalPrice > 0
        ? Math.round((savings / originalPrice) * 100)
        : 0;
      return { ...bundle, originalPrice, discountPercentage, savings };
    });
  }

  async getBundleBySlug(slug: string) {
    const bundle = await prisma.bundle.findUnique({
      where: { slug },
      include: {
        items: {
          include: {
            product: {
              include: { images: true, tags: true, category: true },
            },
          },
        },
      },
    });
    if (!bundle) throw new NotFoundError('Bundle');

    const originalPrice = bundle.items.reduce(
      (sum, item) => sum + item.product.sellingPrice * item.quantity, 0
    );
    const savings = originalPrice - bundle.bundlePrice;
    const discountPercentage = originalPrice > 0
      ? Math.round((savings / originalPrice) * 100)
      : 0;

    return { ...bundle, originalPrice, discountPercentage, savings };
  }

  async createBundle(dto: CreateBundleDto) {
    const slug = generateSlug(dto.name);
    const bundle = await prisma.bundle.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        bundlePrice: dto.bundlePrice,
        imageUrl: dto.imageUrl,
        isFeatured: dto.isFeatured,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    log.info('Bundle created', { id: bundle.id, name: bundle.name });
    return bundle;
  }

  async updateBundle(id: string, dto: UpdateBundleDto) {
    const existing = await prisma.bundle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Bundle');

    const data: any = { ...dto };
    if (dto.name) data.slug = generateSlug(dto.name);

    const bundle = await prisma.bundle.update({
      where: { id },
      data,
      include: { items: { include: { product: true } } },
    });

    log.info('Bundle updated', { id: bundle.id });
    return bundle;
  }

  async deleteBundle(id: string) {
    const existing = await prisma.bundle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Bundle');

    await prisma.bundle.update({
      where: { id },
      data: { isActive: false },
    });

    log.info('Bundle soft-deleted', { id });
    return { message: 'Bundle deactivated' };
  }
}

export const bundleService = new BundleService();
