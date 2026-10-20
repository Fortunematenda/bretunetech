import prisma from '../../lib/prisma';
import { BadRequestError, NotFoundError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { mailer } from '../../lib/mailer';

const log = logger.child('NotificationService');

const orderStatusText: Record<string, { title: string; message: (orderNumber: string) => string }> = {
  PENDING: { title: 'Order Received', message: (n) => `Your order #${n} has been received and is awaiting payment.` },
  PAID: { title: 'Order Paid', message: (n) => `Your order #${n} has been paid and is being processed.` },
  PROCESSING: { title: 'Order Processing', message: (n) => `Your order #${n} is being prepared for shipment.` },
  SHIPPED: { title: 'Order Shipped', message: (n) => `Your order #${n} has been shipped.` },
  COMPLETED: { title: 'Order Delivered', message: (n) => `Your order #${n} has been delivered. Thank you for your purchase!` },
  CANCELLED: { title: 'Order Cancelled', message: (n) => `Your order #${n} has been cancelled.` },
};

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
    const statusInfo = orderStatusText[status];
    if (!statusInfo || status === 'PENDING') return null;

    return this.createNotification({
      userId,
      type: 'ORDER_STATUS',
      title: statusInfo.title,
      message: statusInfo.message(orderNumber),
      link: `/account/orders`,
      metadata: { orderNumber, status },
    });
  }

  async sendOrderStatusEmail(userId: string, orderNumber: string, status: string) {
    const statusInfo = orderStatusText[status];
    if (!statusInfo) return;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });
    if (!user?.email) return;

    const sender = process.env.SMTP_USER || 'sales@bretunetech.com';
    const message = statusInfo.message(orderNumber);
    const ordersUrl = 'https://bretunetech.com/account/orders';

    await mailer.sendMail({
      from: `"BretuneTech" <${sender}>`,
      to: user.email,
      replyTo: sender,
      subject: `${statusInfo.title} — Order #${orderNumber}`,
      text: `Hi ${user.firstName || 'there'},\n\n${message}\n\nView your orders: ${ordersUrl}\n\nBretuneTech\n${sender}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <div style="background:#003d7a;padding:20px 24px;border-radius:8px 8px 0 0;">
            <h2 style="color:#fff;margin:0;font-size:18px;">${statusInfo.title}</h2>
          </div>
          <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
            <p style="color:#374151;margin:0 0 16px;">Hi ${user.firstName || 'there'},</p>
            <p style="color:#374151;margin:0 0 24px;">${message}</p>
            <a href="${ordersUrl}" style="display:inline-block;background:#003d7a;color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:8px;">View my orders</a>
            <p style="color:#6b7280;font-size:13px;margin:24px 0 0;">Questions? Reply to this email or contact ${sender}.</p>
          </div>
        </div>
      `,
    });

    log.info('Order status email sent', { orderNumber, status, toDomain: user.email.split('@')[1] });
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
