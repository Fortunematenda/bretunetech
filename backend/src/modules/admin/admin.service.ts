import prisma from '../../lib/prisma';
import { NotFoundError } from '../../lib/errors';
import { logger } from '../../lib/logger';

const log = logger.child('AdminService');

export class AdminService {
  async getDashboardStats() {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      revenueResult,
      recentOrders,
      lowStockProducts,
      ordersByStatus,
      monthlyRevenue,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'] } },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.product.findMany({
        where: {
          isActive: true,
          stockQuantity: { lte: 5 },
        },
        select: { id: true, name: true, stockQuantity: true, lowStockThreshold: true, sku: true },
        orderBy: { stockQuantity: 'asc' },
        take: 20,
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.getMonthlyRevenue(),
    ]);

    return {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue: revenueResult._sum.totalPrice || 0,
      recentOrders,
      lowStockProducts,
      ordersByStatus,
      monthlyRevenue,
    };
  }

  private async getMonthlyRevenue() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'] },
      },
      select: { totalPrice: true, createdAt: true },
    });

    const monthlyData: Record<string, number> = {};
    orders.forEach((order) => {
      const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = (monthlyData[key] || 0) + order.totalPrice;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 }));
  }

  async getAllOrders(filters: { status?: string; page: string; limit: string; dateFrom?: string; dateTo?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const skip = (parseInt(filters.page) - 1) * parseInt(filters.limit);
    const take = parseInt(filters.limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: true,
          address: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: { page: parseInt(filters.page), limit: take, total, pages: Math.ceil(total / take) },
    };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError('Order');

    // If cancelling, restore stock
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      const orderItems = await prisma.orderItem.findMany({ where: { orderId } });

      await prisma.$transaction(async (tx) => {
        for (const item of orderItems) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { increment: item.quantity } },
            });
          }
        }
        await tx.order.update({ where: { id: orderId }, data: { status: status as any } });
      });

      log.info('Order cancelled, stock restored', { orderId });
    } else {
      await prisma.order.update({ where: { id: orderId }, data: { status: status as any } });
      log.info('Order status updated', { orderId, status });
    }

    return prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { firstName: true, lastName: true, email: true } } },
    });
  }

  async getInventory(filters: { lowStock?: string; supplier?: string }) {
    const where: any = { isActive: true };
    if (filters.lowStock === 'true') {
      where.stockQuantity = { lte: 5 };
    }
    if (filters.supplier) {
      where.supplierName = { contains: filters.supplier, mode: 'insensitive' };
    }

    return prisma.product.findMany({
      where,
      select: {
        id: true, name: true, sku: true, stockQuantity: true,
        lowStockThreshold: true, supplierName: true, costPrice: true,
        sellingPrice: true, condition: true,
      },
      orderBy: { stockQuantity: 'asc' },
    });
  }

  async getBestSellers() {
    const bestSellers = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: true,
      where: { productId: { not: null } },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const productIds = bestSellers
      .filter((b: any) => b.productId)
      .map((b: any) => b.productId as string);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sellingPrice: true, images: { where: { isPrimary: true }, take: 1 } },
    });

    return bestSellers.map((b: any) => ({
      ...b,
      product: products.find((p: any) => p.id === b.productId),
    }));
  }

  async bulkUpdateProducts(productIds: string[], data: { isActive?: boolean; isFeatured?: boolean }) {
    const result = await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data,
    });
    log.info('Bulk product update', { count: result.count, data });
    return { updated: result.count };
  }

  async getRevenueByDateRange(from: string, to: string) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: new Date(from), lte: new Date(to) },
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'] },
      },
      select: { totalPrice: true, createdAt: true },
    });

    const total = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    return { total: Math.round(total * 100) / 100, orderCount: orders.length };
  }

  async getCustomers() {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: { id: true, totalPrice: true, status: true, createdAt: true },
        },
        _count: { select: { orders: true } },
      },
    });

    return customers.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      role: c.role,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      orders: c.orders,
      _count: c._count,
    }));
  }

  // Shipping settings - stored in memory for now (could be moved to database)
  private shippingSettings = {
    standardFee: 150,
    freeShippingThreshold: 1000,
    enableFreeShipping: true,
  };

  async getShippingSettings() {
    return this.shippingSettings;
  }

  async updateShippingSettings(data: { standardFee: number; freeShippingThreshold: number; enableFreeShipping: boolean }) {
    this.shippingSettings = { ...this.shippingSettings, ...data };
    log.info('Shipping settings updated', this.shippingSettings);
    return this.shippingSettings;
  }
}

export const adminService = new AdminService();
