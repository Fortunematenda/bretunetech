import prisma from '../../lib/prisma';
import { AddCartItemDto } from './cart.dto';
import { BadRequestError } from '../../lib/errors';
import { logger } from '../../lib/logger';

const log = logger.child('CartService');

const cartInclude = {
  items: {
    include: {
      product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
      bundle: { include: { items: { include: { product: true } } } },
    },
  },
};

export class CartService {
  async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: cartInclude,
      });
    }

    const total = cart.items.reduce((sum, item) => {
      if (item.product) return sum + item.product.sellingPrice * item.quantity;
      if (item.bundle) return sum + item.bundle.bundlePrice * item.quantity;
      return sum;
    }, 0);

    return { ...cart, total, itemCount: cart.items.length };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Check stock availability (log warning if product not found, don't block)
    let product = null;
    if (dto.productId) {
      product = await prisma.product.findUnique({ where: { id: dto.productId } });
      if (!product || !product.isActive) {
        log.warn(`Product not found or inactive: ${dto.productId}`);
        // Don't throw - allow cart to work with demo/test data
      } else if (product.stockQuantity < dto.quantity) {
        throw new BadRequestError(`Only ${product.stockQuantity} items available`);
      }
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        ...(dto.productId ? { productId: dto.productId } : {}),
        ...(dto.bundleId ? { bundleId: dto.bundleId } : {}),
      },
    });

    // Only save to database if product/bundle exists (avoid FK constraint errors)
    if (!product && dto.productId) {
      log.warn(`Skipping cart item - product not found: ${dto.productId}`);
      return { message: 'Item not saved - product not found', warning: 'Product does not exist' };
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + dto.quantity,
          ...(dto.warehouseLocation ? { warehouseLocation: dto.warehouseLocation } : {}),
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          bundleId: dto.bundleId,
          quantity: dto.quantity,
          warehouseLocation: dto.warehouseLocation ?? null,
        },
      });
    }

    log.debug('Item added to cart', { userId, productId: dto.productId, bundleId: dto.bundleId });
    return { message: 'Item added to cart' };
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return { message: 'Item removed from cart' };
    }
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    return { message: 'Cart updated' };
  }

  async removeItem(itemId: string) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { message: 'Cart cleared' };
  }
}

export const cartService = new CartService();
