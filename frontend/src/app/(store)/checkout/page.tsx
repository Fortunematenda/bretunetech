'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CreditCard, Building2, MessageCircle, Package, Tag, ChevronRight, ShieldCheck, Lock, LogIn, UserPlus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { ordersApi, addressesApi, cartApi } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('EFT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { setMounted(true); }, []);

  // Fetch user's saved address and pre-fill form
  useEffect(() => {
    if (token && user) {
      addressesApi.list(token).then((addresses) => {
        if (addresses && addresses.length > 0) {
          const defaultAddress = addresses[0];
          setShipping((prev) => ({
            ...prev,
            phone: user.phone || prev.phone,
            street: defaultAddress.street || prev.street,
            city: defaultAddress.city || prev.city,
            province: defaultAddress.province || prev.province,
            postalCode: defaultAddress.postalCode || prev.postalCode,
          }));
        } else {
          // Just fill phone from user profile
          setShipping((prev) => ({
            ...prev,
            phone: user.phone || prev.phone,
          }));
        }
      }).catch(() => {
        // Silently fail - user can still enter address manually
      });
    }
  }, [token, user]);

  const [shipping, setShipping] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
  });

  const cartTotal = total();
  const shippingCost = cartTotal > 1000 ? 0 : 150;
  const grandTotal = cartTotal + shippingCost;

  if (!mounted) {
    return (
      <div className="w-full px-4 py-16 text-center">
        <div className="animate-pulse text-gray-400">Loading checkout...</div>
      </div>
    );
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="w-full px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <Link href="/products" className="text-[#003d7a] hover:underline">Continue shopping</Link>
      </div>
    );
  }

  if (!user && !orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[#003d7a]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Sign in to complete your order</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            You need an account to place an order. Sign in or create a free account to continue with checkout.
          </p>

          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm bg-gray-50 rounded-lg px-4 py-2">
                <span className="text-gray-600 truncate mr-2">{item.name} x{item.quantity}</span>
                <span className="text-gray-900 font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-[#003d7a]">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login?redirect=checkout"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#003d7a] hover:bg-blue-800 text-white font-medium rounded-xl transition-colors"
            >
              <LogIn className="w-5 h-5" /> Sign In
            </Link>
            <Link
              href="/login?redirect=checkout&mode=register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors"
            >
              <UserPlus className="w-5 h-5" /> Create Account
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-6">Your cart items will be saved while you sign in.</p>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    const whatsappItems = items.map((i) => `• ${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`).join('\n');
    const whatsappMsg = encodeURIComponent(
      `🛒 *VoltNet Solutions — New Order*\n\nOrder: *${orderNumber}*\nCustomer: ${shipping.firstName} ${shipping.lastName}\n\n*Items:*\n${whatsappItems}\n\nSubtotal: ${formatPrice(cartTotal)}\nShipping: ${shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}\n*Total: ${formatPrice(grandTotal)}*\n\nPayment: ${paymentMethod}\n\nShipping to: ${shipping.street}, ${shipping.city}, ${shipping.province} ${shipping.postalCode}`
    );

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Placed!</h1>
        <p className="text-gray-500 mb-2">Order Number: <span className="text-[#003d7a] font-mono font-bold">{orderNumber}</span></p>
        <p className="text-gray-500 mb-8">
          {paymentMethod === 'EFT' ? 'Please complete your EFT payment using the banking details provided in your confirmation email.' :
           paymentMethod === 'WHATSAPP' ? 'Send us a WhatsApp message with your order details to complete the purchase.' :
           'You will be redirected to the payment gateway shortly.'}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {paymentMethod === 'WHATSAPP' && (
            <a
              href={`https://wa.me/27612685933?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" /> Send via WhatsApp
            </a>
          )}
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleOrder = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      if (!token) {
        throw new Error('Please login to place an order');
      }

      // Validate required fields
      if (!shipping.street?.trim() || !shipping.city?.trim() || !shipping.province?.trim() || !shipping.postalCode?.trim()) {
        throw new Error('Please fill in all shipping details: street, city, province, and postal code');
      }

      // Sync cart items to backend first
      console.log('Syncing cart items to backend:', items);
      for (const item of items) {
        if (item.productId) {
          await cartApi.addItem(token, { productId: item.productId, quantity: item.quantity });
        } else if (item.bundleId) {
          await cartApi.addItem(token, { bundleId: item.bundleId, quantity: item.quantity });
        }
      }

      // First save the shipping address
      const addressData = {
        street: shipping.street.trim(),
        city: shipping.city.trim(),
        province: shipping.province.trim(),
        postalCode: shipping.postalCode.trim(),
        country: 'South Africa',
        label: 'Shipping Address',
        isDefault: true,
      };
      
      console.log('Creating address with:', addressData);
      const address = await addressesApi.create(token, addressData);
      console.log('Address created:', address);

      // Create the order with the new address
      const order = await ordersApi.create(token, {
        addressId: address.id,
        paymentMethod: paymentMethod,
        notes: '',
      });

      setOrderNumber(order.orderNumber);
      setOrderComplete(true);
      clearCart();
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">First Name</label>
                <input type="text" value={shipping.firstName} onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Last Name</label>
                <input type="text" value={shipping.lastName} onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input type="email" value={shipping.email} onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                <input type="tel" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Street Address</label>
                <input type="text" value={shipping.street} onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">City</label>
                <input type="text" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Province</label>
                <select value={shipping.province} onChange={(e) => setShipping({ ...shipping, province: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]">
                  <option value="">Select province</option>
                  <option>Gauteng</option><option>Western Cape</option><option>KwaZulu-Natal</option>
                  <option>Eastern Cape</option><option>Free State</option><option>Limpopo</option>
                  <option>Mpumalanga</option><option>North West</option><option>Northern Cape</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Postal Code</label>
                <input type="text" value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]" />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {[
                { id: 'EFT', label: 'EFT / Bank Transfer', desc: 'Pay via direct bank transfer', icon: Building2, available: true },
                { id: 'PAYFAST', label: 'PayFast', desc: 'Card, instant EFT, SnapScan', icon: CreditCard, available: false },
                { id: 'OZOW', label: 'Ozow', desc: 'Instant EFT payment', icon: CreditCard, available: false },
                { id: 'WHATSAPP', label: 'WhatsApp Order', desc: 'Send order via WhatsApp', icon: MessageCircle, available: true },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === method.id ? 'border-[#003d7a] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => method.available && setPaymentMethod(method.id)}
                    disabled={!method.available}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === method.id ? 'border-[#003d7a]' : 'border-gray-300'
                  }`}>
                    {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-[#003d7a]" />}
                  </div>
                  <method.icon className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{method.label}</p>
                    <p className="text-xs text-gray-500">{method.desc}{!method.available ? ' (Coming soon)' : ''}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={48} height={48} className="w-full h-full object-contain p-0.5" />
                    ) : item.type === 'bundle' ? (
                      <Package className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Tag className="w-5 h-5 text-[#003d7a]" />
                    )}
                  </div>
                  <span className="text-gray-600 flex-1 min-w-0 truncate">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                  <span className="text-gray-900 font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900">{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-[#003d7a]">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleOrder}
              disabled={isProcessing || !shipping.firstName || !shipping.email || !shipping.street || !shipping.city || !shipping.province || !shipping.postalCode}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#003d7a] hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              {isProcessing ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Place Order — {formatPrice(grandTotal)}
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
