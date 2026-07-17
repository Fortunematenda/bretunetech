import prisma from '../../lib/prisma';
import { BadRequestError, NotFoundError } from '../../lib/errors';
import { logger } from '../../lib/logger';

const log = logger.child('NotificationService');

export class NotificationService {
  async getNotifications(userId: string, options: { unreadOnly?: boolean; limit?: number } = {}) {
    const { unreadOnly = false, limit = 50 } = options;

    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return notifications;
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return count;
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { success: true, updated: result.count }; 
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  }

  async clearAll(userId: string) {
    const result = await prisma.notification.deleteMany({
      where: { userId },
    });

    return { success: true, deleted: result.count };
  }

  async getAdminReadState(userId: string) {
    const states = await prisma.adminNotificationState.findMany({
      where: { userId },
      select: { sourceKey: true },
    });
    return states.map((state) => state.sourceKey);
  }

  async markAdminNotificationsRead(userId: string, sourceKeys: string[]) {
    const uniqueKeys = [...new Set(sourceKeys.filter(Boolean))];
    if (!uniqueKeys.length) return { success: true, updated: 0 };

    await prisma.adminNotificationState.createMany({
      data: uniqueKeys.map((sourceKey) => ({ userId, sourceKey })),
      skipDuplicates: true,
    });
    return { success: true, updated: uniqueKeys.length };
  }

  async createNotification(data: {
    userId: string;
    type: 'ORDER_STATUS' | 'PROMOTION' | 'ACCOUNT' | 'GENERAL';
    title: string;
    message: string;
    link?: string;
    metadata?: any;
  }) {
    const notification = await prisma.notification.create({
      data,
    });

    log.info('Notification created', { notificationId: notification.id, userId: data.userId, type: data.type });

    return notification;
  }

  async createOrderStatusNotification(userId: string, orderNumber: string, status: string) {
    const statusMessages: Record<string, { title: string; message: string }> = {
      PAID: { title: 'Order Paid', message: `Your order #${orderNumber} has been paid and is being processed.` },
      PROCESSING: { title: 'Order Processing', message: `Your order #${orderNumber} is being prepared for shipment.` },
      SHIPPED: { title: 'Order Shipped', message: `Your order #${orderNumber} has been shipped! Track your package.` },
      COMPLETED: { title: 'Order Delivered', message: `Your order #${orderNumber} has been delivered. Thank you for your purchase!` },
      CANCELLED: { title: 'Order Cancelled', message: `Your order #${orderNumber} has been cancelled.` },
    };

    const statusInfo = statusMessages[status];
    if (!statusInfo) return null;

    return this.createNotification({
      userId,
      type: 'ORDER_STATUS',
      title: statusInfo.title,
      message: statusInfo.message,
      link: `/account/orders`,
      metadata: { orderNumber, status },
    });
  }

  async createPromotionalNotification(userId: string, title: string, message: string, link?: string) {
    return this.createNotification({
      userId,
      type: 'PROMOTION',
      title,
      message,
      link,
    });
  }

  async createAccountNotification(userId: string, title: string, message: string, link?: string) {
    return this.createNotification({
      userId,
      type: 'ACCOUNT',
      title,
      message,
      link,
    });
  }
}

export const notificationService = new NotificationService();
