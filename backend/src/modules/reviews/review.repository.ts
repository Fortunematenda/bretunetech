import prisma from '../../lib/prisma';

export const reviewRepository = {
  async create(data: {
    userId: string;
    productId: string;
    rating: number;
    title?: string;
    comment: string;
  }) {
    return prisma.review.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  async findByUserAndProduct(userId: string, productId: string) {
    return prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  },

  async findMany(filters: {
    productId?: string;
    isApproved?: boolean;
    page: number;
    limit: number;
  }) {
    const where: any = {};
    if (filters.productId) where.productId = filters.productId;
    if (filters.isApproved !== undefined) where.isApproved = filters.isApproved;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total };
  },

  async update(id: string, data: Partial<{
    rating: number;
    title: string;
    comment: string;
  }>) {
    return prisma.review.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  async delete(id: string) {
    return prisma.review.delete({ where: { id } });
  },

  async getProductStats(productId: string) {
    const stats = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const distribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId, isApproved: true },
      _count: { rating: true },
    });

    return {
      average: stats._avg.rating || 0,
      count: stats._count.rating || 0,
      distribution: distribution.reduce((acc, item) => {
        acc[item.rating] = item._count.rating;
        return acc;
      }, {} as Record<number, number>),
    };
  },
};
