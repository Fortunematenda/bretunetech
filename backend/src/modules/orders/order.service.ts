import prisma from '../../lib/prisma';
import { CreateOrderDto } from './order.dto';
import { BadRequestError, NotFoundError, ConflictError } from '../../lib/errors';
import { generateOrderNumber } from '../../utils/slug';
import { logger } from '../../lib/logger';
import nodemailer from 'nodemailer';

const log = logger.child('OrderService');

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

    const shippingCost = subtotal > 1000 ? 0 : 150;
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

    // Send order notification email
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const itemList = order.items.map((item: any) => 
        `• ${item.name} x${item.quantity} — R${item.price.toFixed(2)}`
      ).join('\n');

      await transporter.sendMail({
        from: `"Bretunetech Orders" <${process.env.SMTP_USER || 'sales@bretunetech.com'}>`,
        to: 'sales@bretunetech.com',
        subject: `New Order #${order.orderNumber} — R${order.totalPrice.toFixed(2)}`,
        text: `
NEW ORDER PLACED

Order #: ${order.orderNumber}
Customer: ${user?.firstName} ${user?.lastName} <${user?.email}>
Payment Method: ${order.paymentMethod}

Items:
${itemList}

Subtotal: R${order.subtotal.toFixed(2)}
Shipping: R${order.shippingCost.toFixed(2)}
Total: R${order.totalPrice.toFixed(2)}

Address: ${order.addressId}
        `.trim(),
        html: `
          <h2 style="color: #003d7a;">🛒 New Order Placed</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Order #</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${order.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Customer</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${user?.firstName} ${user?.lastName}<br>${user?.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Payment</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${order.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Total</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-size: 18px; font-weight: bold; color: #003d7a;">R${order.totalPrice.toFixed(2)}</td>
            </tr>
          </table>
          <h3>Items:</h3>
          <ul style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            ${order.items.map((item: any) => `<li>${item.name} <strong>x${item.quantity}</strong> — R${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
          </ul>
        `,
      });
      log.info('Order email sent to sales@bretunetech.com', { orderNumber: order.orderNumber });
    } catch (emailErr: any) {
      log.error('Failed to send order email:', emailErr.message);
    }

    return order;
  }

  async getCustomerOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true, address: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string, userId: string, role: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
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
      .map((item) => `• ${item.name} x${item.quantity} — R${item.price.toFixed(2)}`)
      .join('\n');

    const message =
      `🛒 *VoltNet Solutions — New Order*\n\n` +
      `Order: *${order.orderNumber}*\n` +
      `Customer: ${order.user.firstName} ${order.user.lastName}\n\n` +
      `*Items:*\n${itemLines}\n\n` +
      `Subtotal: R${order.subtotal.toFixed(2)}\n` +
      `Shipping: R${order.shippingCost.toFixed(2)}\n` +
      `*Total: R${order.totalPrice.toFixed(2)}*\n\n` +
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
      return prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, user: { select: { firstName: true, lastName: true, email: true } } },
      });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: { items: true, user: { select: { firstName: true, lastName: true, email: true } } },
    });

    log.info('Order status updated', { orderId, status });
    return updated;
  }
}

export const orderService = new OrderService();
