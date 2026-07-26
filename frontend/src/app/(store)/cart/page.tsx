'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, Package, Tag, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { iconSize } from '@/lib/icons';
import { useCartStore } from '@/store/cart-store';
import { publicApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { appToast } from '@/lib/toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCartStore();
  const cartTotal = total();

  const [shippingSettings, setShippingSettings] = useState({
    standardFee: 99,
    freeShippingThreshold: 1500,
    enableFreeShipping: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await publicApi.getShippingSettings();
        if (settings) setShippingSettings(settings);
      } catch {
        // Keep defaults
      }
    };
    loadSettings();
  }, []);

  const shippingCost =
    shippingSettings.enableFreeShipping && cartTotal >= shippingSettings.freeShippingThreshold
      ? 0
      : shippingSettings.standardFee;
  const grandTotal = cartTotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="w-full px-4 py-16 text-center sm:px-6">
        <ShoppingCart className={`${iconSize.xl} mx-auto mb-4 size-16 text-muted-foreground`} aria-hidden="true" />
        <h1 className="mb-3 text-2xl font-bold text-foreground">Your Cart is Empty</h1>
        <p className="mb-6 text-muted-foreground">Add some products or bundles to get started.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="h-11 rounded-xl px-6">
            <Link href="/products">Browse Products</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 rounded-xl px-6">
            <Link href="/bundles">View Bundles</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-3 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-foreground sm:text-3xl">Shopping Cart</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {itemCount()} item{itemCount() !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            clearCart();
            appToast.info('Cart cleared');
          }}
          className="shrink-0 text-destructive hover:text-destructive"
        >
          <Trash2 className={iconSize.sm} aria-hidden="true" />
          Clear Cart
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.id} className="py-0 shadow-sm">
              <CardContent className="flex gap-3 p-3 sm:gap-4 sm:p-5">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white sm:size-20">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      unoptimized
                      className="h-full w-full object-contain p-1"
                    />
                  ) : item.type === 'bundle' ? (
                    <Package className={`${iconSize.lg} text-orange-500`} aria-hidden="true" />
                  ) : (
                    <Tag className={`${iconSize.lg} text-primary`} aria-hidden="true" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {item.type === 'bundle' && (
                        <Badge variant="secondary" className="mb-1 text-[10px] text-orange-600">
                          BretuneTech Kit
                        </Badge>
                      )}
                      <h3 className="break-words text-xs font-medium text-foreground sm:text-sm">{item.name}</h3>
                      {item.warehouseLocation && (
                        <Badge variant="outline" className="mt-1 gap-1 text-[10px]">
                          <Truck className={iconSize.sm} aria-hidden="true" />
                          {item.warehouseLocation === 'CPT'
                            ? 'Cape Town'
                            : item.warehouseLocation === 'JHB'
                              ? 'Johannesburg'
                              : 'Durban'}
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className={iconSize.sm} aria-hidden="true" />
                    </Button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center overflow-hidden rounded-lg border border-border bg-muted/40">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="rounded-none"
                      >
                        <Minus className={iconSize.sm} aria-hidden="true" />
                      </Button>
                      <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="rounded-none"
                      >
                        <Plus className={iconSize.sm} aria-hidden="true" />
                      </Button>
                    </div>
                    <span className="text-base font-bold text-primary sm:text-lg">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="shadow-sm lg:sticky lg:top-24">
            <CardHeader className="pb-2">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Truck className={iconSize.sm} aria-hidden="true" /> Shipping
                </span>
                <span className="text-foreground">
                  {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                </span>
              </div>
              {shippingSettings.enableFreeShipping && shippingCost > 0 && (
                <p className="text-xs text-muted-foreground">
                  Free shipping on orders over {formatPrice(shippingSettings.freeShippingThreshold)}
                </p>
              )}

              <Separator />

              <div className="flex justify-between">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-lg font-bold text-primary">{formatPrice(grandTotal)}</span>
              </div>

              <Button asChild className="h-11 w-full rounded-xl text-sm font-semibold">
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className={iconSize.md} aria-hidden="true" />
                </Link>
              </Button>

              <Button asChild variant="link" className="w-full text-muted-foreground">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
