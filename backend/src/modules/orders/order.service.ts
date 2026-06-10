import prisma from '../../lib/prisma';
import { CreateOrderDto } from './order.dto';
import { BadRequestError, NotFoundError, ConflictError } from '../../lib/errors';
import { generateOrderNumber } from '../../utils/slug';
import { logger } from '../../lib/logger';
import nodemailer from 'nodemailer';
import { notificationService } from '../notifications/notification.service';

const log = logger.child('OrderService');

const COMPANY = {
  brandName: "BretuneTech",
  legalName: "Bretune Technologies (Pty) Ltd",
  registrationNumber: "2025/545182/07",
  taxNumber: "9276141273",
  website: "https://bretunetech.com",
  email: "info@bretunetech.com",
  supportEmail: "support@bretunetech.com",
  country: "South Africa",
  businessType: "Technology Ecommerce & Solutions Provider"
};

// Email transporter (same config as contact)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'cp69.domains.co.za',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'sales@bretunetech.com',
    pass: process.env.SMTP_PASS,
  },
});

// Simple in-memory idempotency store (replace with Redis in production)
const processedOrders = new Map<string, string>();

export class OrderService {
  async createOrder(userId: string, dto: CreateOrderDto) {
    // Idempotency check - prevent duplicate orders
    if (dto.idempotencyKey) {
      const existing = processedOrders.get(dto.idempotencyKey);
      if (existing) {
        const order = await prisma.order.findUnique({
          where: { id: existing },
          include: { items: true },
        });
        if (order) return order;
      }
    }

    // Fetch cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true, bundle: { include: { items: { include: { product: true } } } } },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Stock validation - check all items before processing
    for (const item of cart.items) {
      if (item.product) {
        if (item.product.stockQuantity < item.quantity) {
          throw new ConflictError(
            `Insufficient stock for "${item.product.name}". Available: ${item.product.stockQuantity}, Requested: ${item.quantity}`
          );
        }
      }
      if (item.bundle) {
        for (const bundleItem of item.bundle.items) {
          const requiredQty = bundleItem.quantity * item.quantity;
          if (bundleItem.product.stockQuantity < requiredQty) {
            throw new ConflictError(
              `Insufficient stock for "${bundleItem.product.name}" in bundle "${item.bundle.name}". Available: ${bundleItem.product.stockQuantity}, Requested: ${requiredQty}`
            );
          }
        }
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      if (item.product) return sum + item.product.sellingPrice * item.quantity;
      if (item.bundle) return sum + item.bundle.bundlePrice * item.quantity;
      return sum;
    }, 0);

    const shippingCost = subtotal >= 1500 ? 0 : 99;
    const totalPrice = subtotal + shippingCost;

    // Create order + decrement stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          addressId: dto.addressId,
          paymentMethod: dto.paymentMethod || 'EFT',
          subtotal,
          shippingCost,
          totalPrice,
          notes: dto.notes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              bundleId: item.bundleId,
              name: item.product?.name || item.bundle?.name || 'Unknown',
              price: item.product?.sellingPrice || item.bundle?.bundlePrice || 0,
              quantity: item.quantity,
              warehouseLocation: item.warehouseLocation ?? null,
            })),
          },
        },
        include: { items: true },
      });

      // Decrement product stock
      for (const item of cart.items) {
        if (item.product) {
          await tx.product.update({
            where: { id: item.product.id },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        }
        // Decrement stock for bundle component products
        if (item.bundle) {
          for (const bundleItem of item.bundle.items) {
            await tx.product.update({
              where: { id: bundleItem.product.id },
              data: { stockQuantity: { decrement: bundleItem.quantity * item.quantity } },
            });
          }
        }
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    // Store idempotency key
    if (dto.idempotencyKey) {
      processedOrders.set(dto.idempotencyKey, order.id);
      // Clean up after 1 hour
      setTimeout(() => processedOrders.delete(dto.idempotencyKey!), 60 * 60 * 1000);
    }

    log.info('Order created', { orderId: order.id, orderNumber: order.orderNumber, total: totalPrice });

    // Prepare email data
    const [user, address] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      order.addressId ? prisma.address.findUnique({ where: { id: order.addressId } }) : null,
    ]);

    const fmt = (v: any) => Number(v).toFixed(2);
    const itemList = order.items.map((item: any) =>
      `• ${item.name} x${item.quantity} — R ${fmt(item.price)} each`
    ).join('\n');

    const addressLine = address
      ? `${address.street}, ${address.city}, ${address.province} ${address.postalCode}`
      : 'Not provided';

    // Send order notification email
    try {
      await transporter.sendMail({
        from: `"${COMPANY.brandName} Orders" <${process.env.SMTP_USER || COMPANY.email}>`,
        to: COMPANY.email,
        replyTo: user?.email,
        subject: `New Order #${order.orderNumber} — R ${fmt(order.totalPrice)}`,
        text: `
NEW ORDER PLACED — ${COMPANY.brandName}

Order #: ${order.orderNumber}
Customer: ${user?.firstName} ${user?.lastName} <${user?.email}>
Payment: ${order.paymentMethod}

Items:
${itemList}

Subtotal: R ${fmt(order.subtotal)}
Shipping: R ${fmt(order.shippingCost)}
Total: R ${fmt(order.totalPrice)}

Shipping to: ${addressLine}

---
Legal Entity: ${COMPANY.legalName}
Registration Number: ${COMPANY.registrationNumber}
        `.trim(),
        html: `
          <h2 style="color: #003d7a;">🛒 New Order — ${COMPANY.brandName}</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Order #</td><td style="padding: 10px; border: 1px solid #ddd;">${order.orderNumber}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Customer</td><td style="padding: 10px; border: 1px solid #ddd;">${user?.firstName} ${user?.lastName}<br/>${user?.email}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Payment</td><td style="padding: 10px; border: 1px solid #ddd;">${order.paymentMethod}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Subtotal</td><td style="padding: 10px; border: 1px solid #ddd;">R ${fmt(order.subtotal)}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Shipping</td><td style="padding: 10px; border: 1px solid #ddd;">R ${fmt(order.shippingCost)}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Total</td><td style="padding: 10px; border: 1px solid #ddd; font-size: 18px; font-weight: bold; color: #003d7a;">R ${fmt(order.totalPrice)}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Ship To</td><td style="padding: 10px; border: 1px solid #ddd;">${addressLine}</td></tr>
          </table>
          <h3>Items Ordered:</h3>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <thead><tr><th style="padding:8px;border:1px solid #ddd;background:#003d7a;color:white;text-align:left;">Product</th><th style="padding:8px;border:1px solid #ddd;background:#003d7a;color:white;">Qty</th><th style="padding:8px;border:1px solid #ddd;background:#003d7a;color:white;">Unit Price</th><th style="padding:8px;border:1px solid #ddd;background:#003d7a;color:white;">Line Total</th></tr></thead>
            <tbody>${order.items.map((item: any) => `<tr><td style="padding:8px;border:1px solid #ddd;">${item.name}</td><td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity}</td><td style="padding:8px;border:1px solid #ddd;">R ${fmt(item.price)}</td><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">R ${fmt(Number(item.price) * item.quantity)}</td></tr>`).join('')}</tbody>
          </table>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />
          <p style="font-size: 12px; color: #666; margin-top: 10px;">
            <strong>Legal Entity:</strong> ${COMPANY.legalName}<br />
            <strong>Registration Number:</strong> ${COMPANY.registrationNumber}
          </p>
        `,
      });
      log.info('Order email sent to admin', { orderNumber: order.orderNumber });
    } catch (emailErr: any) {
      log.error('Failed to send admin order email:', emailErr.message);
    }

    // Send customer confirmation email
    try {
      // Get business settings for bank details
      const { adminService } = await import('../admin/admin.service');
      const businessSettings = await adminService.getBusinessSettings();

      let bankDetailsText = '';
      let bankDetailsHtml = '';

      if (order.paymentMethod === 'EFT' && businessSettings) {
        bankDetailsText = `
BANK DETAILS FOR EFT PAYMENT:
${businessSettings.bankName ? `Bank: ${businessSettings.bankName}` : ''}
${businessSettings.accountHolder ? `Account Holder: ${businessSettings.accountHolder}` : ''}
${businessSettings.accountNumber ? `Account Number: ${businessSettings.accountNumber}` : ''}
${businessSettings.accountType ? `Account Type: ${businessSettings.accountType}` : ''}
${businessSettings.branchCode ? `Branch Code: ${businessSettings.branchCode}` : ''}

Please use your order number (${order.orderNumber}) as reference when making payment.
`;

        bankDetailsHtml = `
          <div style="background: #f0f8ff; border: 1px solid #003d7a; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #003d7a; margin-top: 0;">Bank Details for EFT Payment</h3>
            <table style="border-collapse: collapse; width: 100%;">
              ${businessSettings.bankName ? `<tr><td style="padding: 5px; font-weight: bold;">Bank:</td><td style="padding: 5px;">${businessSettings.bankName}</td></tr>` : ''}
              ${businessSettings.accountHolder ? `<tr><td style="padding: 5px; font-weight: bold;">Account Holder:</td><td style="padding: 5px;">${businessSettings.accountHolder}</td></tr>` : ''}
              ${businessSettings.accountNumber ? `<tr><td style="padding: 5px; font-weight: bold;">Account Number:</td><td style="padding: 5px;">${businessSettings.accountNumber}</td></tr>` : ''}
              ${businessSettings.accountType ? `<tr><td style="padding: 5px; font-weight: bold;">Account Type:</td><td style="padding: 5px;">${businessSettings.accountType}</td></tr>` : ''}
              ${businessSettings.branchCode ? `<tr><td style="padding: 5px; font-weight: bold;">Branch Code:</td><td style="padding: 5px;">${businessSettings.branchCode}</td></tr>` : ''}
            </table>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">
              Please use your order number <strong>${order.orderNumber}</strong> as reference when making payment.
            </p>
          </div>
        `;
      }

      await transporter.sendMail({
        from: `"${COMPANY.brandName}" <${process.env.SMTP_USER || COMPANY.email}>`,
        to: user?.email,
        subject: `Order Confirmation #${order.orderNumber} — ${COMPANY.brandName}`,
        text: `
Thank you for your order!

Order #: ${order.orderNumber}
Date: ${new Date().toLocaleDateString('en-ZA')}

Items:
${itemList}

Subtotal: R ${fmt(order.subtotal)}
Shipping: R ${fmt(order.shippingCost)}
Total: R ${fmt(order.totalPrice)}

Payment Method: ${order.paymentMethod}
${bankDetailsText}
We'll send you another email when your order ships.

---
${COMPANY.brandName}

A trading name of ${COMPANY.legalName}

Registration Number: ${COMPANY.registrationNumber}

Website: ${COMPANY.website}

Support: ${COMPANY.supportEmail}
        `.trim(),
        html: `
          <h2 style="color: #003d7a;">Order Confirmation</h2>
          <p>Thank you for your order! Your order has been received and is being processed.</p>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px; margin: 20px 0;">
            <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Order #</td><td style="padding: 10px; border: 1px solid #ddd;">${order.orderNumber}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Date</td><td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleDateString('en-ZA')}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Payment</td><td style="padding: 10px; border: 1px solid #ddd;">${order.paymentMethod}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Subtotal</td><td style="padding: 10px; border: 1px solid #ddd;">R ${fmt(order.subtotal)}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Shipping</td><td style="padding: 10px; border: 1px solid #ddd;">R ${fmt(order.shippingCost)}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Total</td><td style="padding: 10px; border: 1px solid #ddd; font-size: 18px; font-weight: bold; color: #003d7a;">R ${fmt(order.totalPrice)}</td></tr>
          </table>
          <h3>Items Ordered:</h3>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <thead><tr><th style="padding:8px;border:1px solid #ddd;background:#003d7a;color:white;text-align:left;">Product</th><th style="padding:8px;border:1px solid #ddd;background:#003d7a;color:white;">Qty</th><th style="padding:8px;border:1px solid #ddd;background:#003d7a;color:white;">Unit Price</th><th style="padding:8px;border:1px solid #ddd;background:#003d7a;color:white;">Line Total</th></tr></thead>
            <tbody>${order.items.map((item: any) => `<tr><td style="padding:8px;border:1px solid #ddd;">${item.name}</td><td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity}</td><td style="padding:8px;border:1px solid #ddd;">R ${fmt(item.price)}</td><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">R ${fmt(Number(item.price) * item.quantity)}</td></tr>`).join('')}</tbody>
          </table>
          ${bankDetailsHtml}
          <p style="margin-top: 20px;">We'll send you another email when your order ships.</p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />
          <p style="font-size: 14px; color: #333; margin-top: 10px;">
            <strong>${COMPANY.brandName}</strong><br />
            A trading name of ${COMPANY.legalName}<br /><br />
            <strong>Registration Number:</strong> ${COMPANY.registrationNumber}<br />
            <strong>Website:</strong> <a href="${COMPANY.website}" style="color: #003d7a;">${COMPANY.website}</a><br />
            <strong>Support:</strong> <a href="mailto:${COMPANY.supportEmail}" style="color: #003d7a;">${COMPANY.supportEmail}</a>
          </p>
        `,
      });
      log.info('Customer confirmation email sent', { orderNumber: order.orderNumber, email: user?.email });
    } catch (emailErr: any) {
      log.error('Failed to send customer confirmation email:', emailErr.message);
    }

    return order;
  }

  async getCustomerOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { 
        items: { 
          include: { 
            product: { include: { images: true } },
            bundle: { include: { items: { include: { product: { include: { images: true } } } } } }
          } 
        }, 
        address: true 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string, userId: string, role: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { 
          include: { 
            product: { include: { images: true } },
            bundle: { include: { items: { include: { product: { include: { images: true } } } } } }
          } 
        },
        address: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!order) throw new NotFoundError('Order');
    if (order.userId !== userId && role !== 'ADMIN') {
      throw new NotFoundError('Order'); // Don't reveal existence to unauthorized users
    }

    return order;
  }

  async generateWhatsAppMessage(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { firstName: true, lastName: true } } },
    });
    if (!order) throw new NotFoundError('Order');

    const itemLines = order.items
      .map((item) => `• ${item.name} x${item.quantity} — R ${Number(item.price).toFixed(2)}`)
      .join('\n');

    const fmt = (v: any) => Number(v).toFixed(2);
    const message =
      `🛒 *Bretunetech — New Order*\n\n` +
      `Order: *${order.orderNumber}*\n` +
      `Customer: ${order.user.firstName} ${order.user.lastName}\n\n` +
      `*Items:*\n${itemLines}\n\n` +
      `Subtotal: R ${fmt(order.subtotal)}\n` +
      `Shipping: R ${fmt(order.shippingCost)}\n` +
      `*Total: R ${fmt(order.totalPrice)}*\n\n` +
      `Payment: ${order.paymentMethod}`;

    const encoded = encodeURIComponent(message);
    return { message, whatsappUrl: `https://wa.me/?text=${encoded}` };
  }

  // Admin methods
  async getAllOrders(filters: { status?: string; page: string; limit: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;

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
          items: { 
            include: { 
              product: { include: { images: true } },
              bundle: { include: { items: { include: { product: { include: { images: true } } } } } }
            } 
          },
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
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId },
      });

      await prisma.$transaction(async (tx) => {
        for (const item of orderItems) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { increment: item.quantity } },
            });
          }
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: status as any },
        });
      });

      log.info('Order cancelled, stock restored', { orderId });
      
      // Create notification for cancelled order
      try {
        await notificationService.createOrderStatusNotification(order.userId, order.orderNumber, status);
        log.info('Notification created for cancelled order', { orderId, userId: order.userId });
      } catch (notifErr: any) {
        log.error('Failed to create notification for cancelled order:', notifErr.message);
      }
      
      return prisma.order.findUnique({
        where: { id: orderId },
        include: { 
          items: { 
            include: { 
              product: { include: { images: true } },
              bundle: { include: { items: { include: { product: { include: { images: true } } } } } }
            } 
          },
          user: { select: { firstName: true, lastName: true, email: true } } 
        },
      });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: { 
        items: { 
          include: { 
            product: { include: { images: true } },
            bundle: { include: { items: { include: { product: { include: { images: true } } } } } }
          } 
        },
        user: { select: { firstName: true, lastName: true, email: true } } 
      },
    });

    log.info('Order status updated', { orderId, status });
    
    // Create notification for status change (only if status actually changed)
    if (order.status !== status) {
      try {
        await notificationService.createOrderStatusNotification(order.userId, order.orderNumber, status);
        log.info('Notification created for order status change', { orderId, userId: order.userId, status });
      } catch (notifErr: any) {
        log.error('Failed to create notification for order status change:', notifErr.message);
      }
    }
    
    return updated;
  }
}

export const orderService = new OrderService();
