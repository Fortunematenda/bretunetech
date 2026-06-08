import prisma from '../../lib/prisma';
import { ListAdsDto } from './ad.dto';

export class AdRepository {
  async findMany(filters: ListAdsDto) {
    const { page, limit, isActive } = filters;

    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    let orderBy: any = { sortOrder: 'asc', createdAt: 'desc' };

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 50;
    const skip = (safePage - 1) * safeLimit;
    const take = safeLimit;

    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.ad.count({ where }),
    ]);

    return { ads, total, page: safePage, limit: take };
  }

  async findById(id: string) {
    return prisma.ad.findUnique({
      where: { id },
    });
  }

  async create(data: Record<string, any>) {
    return prisma.ad.create({
      data: data as any,
    });
  }

  async update(id: string, data: Record<string, any>) {
    return prisma.ad.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.ad.delete({
      where: { id },
    });
  }

  async findActive() {
    return prisma.ad.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }
}

export const adRepository = new AdRepository();
