'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, Building2, MessageCircle, Package, Tag, ChevronRight, ShieldCheck, Lock, LogIn, UserPlus, CalendarClock, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { ordersApi, addressesApi, cartApi } from '@/lib/api';
import { COMPANY } from '@/lib/company';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import CountryCodeSelector from '@/components/CountryCodeSelector';

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
  const [countryCode, setCountryCode] = useState('+27');

  useEffect(() => { setMounted(true); }, []);

  // Pre-fill form with logged-in user details + saved address
  useEffect(() => {
    if (!user) return;
    // Fill user profile fields immediately
    setShipping((prev) => ({
      ...prev,
      firstName: user.firstName || prev.firstName,
      lastName: user.lastName || prev.lastName,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
    }));
    // Then fetch saved address
    if (token) {
      addressesApi.list(token).then((addresses) => {
        if (addresses && addresses.length > 0) {
          const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0];
          setShipping((prev) => ({
            ...prev,
            street: defaultAddress.street || prev.street,
            city: defaultAddress.city || prev.city,
            province: defaultAddress.province || prev.province,
            postalCode: defaultAddress.postalCode || prev.postalCode,
          }));
        }
      }).catch(() => {});
    }
  }, [user, token]);

  const [shipping, setShipping] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    suburb: '',
    city: '',
    province: '',
    postalCode: '',
    formattedAddress: '',
    placeId: '',
    latitude: 0,
    longitude: 0,
    addressVerified: false,
  });
  const [addressWarning, setAddressWarning] = useState('');

  // Load business settings for bank details
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  useEffect(() => {
    const saved = localStorage.getItem('bretunetech-business-settings');
    if (saved) {
      try {
        setBusinessSettings(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const cartTotal = total();
  const shippingCost = cartTotal >= 1500 ? 0 : 99;
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
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Placed!</h1>
        <p className="text-gray-500 mb-2">Order Number: <span className="text-[#003d7a] font-mono font-bold">{orderNumber}</span></p>
        <p className="text-gray-500 mb-8">
          {paymentMethod === 'EFT' ? 'Please complete your EFT payment using the banking details provided in your confirmation email.' :
           'You will be redirected to the payment gateway shortly.'}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleAddressSelect = useCallback((addr: any) => {
    setShipping((prev) => ({
      ...prev,
      street: addr.street || prev.street,
      suburb: addr.suburb || '',
      city: addr.city || prev.city,
      province: addr.province || prev.province,
      postalCode: addr.postalCode || prev.postalCode,
      formattedAddress: addr.formattedAddress || '',
      placeId: addr.placeId || '',
      latitude: addr.latitude || 0,
      longitude: addr.longitude || 0,
      addressVerified: addr.addressVerified || false,
    }));
    setAddressWarning('');
  }, []);

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

      // Format phone with country code
      const fullPhone = shipping.phone.trim() ? `${countryCode}${shipping.phone.trim()}` : undefined;

      // Update user profile with phone if provided
      if (fullPhone && user) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ phone: fullPhone }),
          });
        } catch (e) {
          console.warn('Failed to update user phone:', e);
        }
      }

      // Clear backend cart first to avoid doubling quantities, then sync from frontend
      await cartApi.clear(token);
      for (const item of items) {
        if (item.productId) {
          await cartApi.addItem(token, { productId: item.productId, quantity: item.quantity, warehouseLocation: item.warehouseLocation });
        } else if (item.bundleId) {
          await cartApi.addItem(token, { bundleId: item.bundleId, quantity: item.quantity });
        }
      }

      // First save the shipping address with geo data
      const addressData: any = {
        street: shipping.street.trim(),
        suburb: shipping.suburb?.trim() || undefined,
        city: shipping.city.trim(),
        province: shipping.province.trim(),
        postalCode: shipping.postalCode.trim(),
        country: 'South Africa',
        label: 'Shipping Address',
        isDefault: true,
        formattedAddress: shipping.formattedAddress || undefined,
        placeId: shipping.placeId || undefined,
        latitude: shipping.latitude || undefined,
        longitude: shipping.longitude || undefined,
        addressVerified: shipping.addressVerified,
      };
      
      const address = await addressesApi.create(token, addressData);

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

  const addDay = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
  const fmtDate = (d: Date) => d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });

  // Days needed per item from its warehouse to customer province
  const getItemDays = (warehouseLocation?: string, province?: string): { min: number; max: number; label: string } => {
    const localMatch =
      (warehouseLocation === 'CPT' && province === 'Western Cape') ||
      (warehouseLocation === 'JHB' && province === 'Gauteng') ||
      (warehouseLocation === 'DBN' && province === 'KwaZulu-Natal');
    if (localMatch) return { min: 1, max: 2, label: '1–2 business days' };
    return { min: 3, max: 5, label: '3–5 business days' };
  };

  // Consolidated order delivery: use the worst-case (slowest) item
  const allItemDays = items.map((item) => getItemDays(item.warehouseLocation, shipping.province));
  const orderMinDays = Math.max(...allItemDays.map((d) => d.min), 3);
  const orderMaxDays = Math.max(...allItemDays.map((d) => d.max), 5);
  // Add 2 hours to convert UTC to SAST
  const today = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);
  const orderDeliveryRange = `${fmtDate(addDay(today, orderMinDays))} – ${fmtDate(addDay(today, orderMaxDays))}`;

  return (
    <div className="w-full px-3 sm:px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto overflow-x-hidden">
      <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 sm:mb-8">Checkout</h1>

      {error && (
        <div className="mb-3 sm:mb-4 sm:mb-6 p-2.5 sm:p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[10px] sm:text-xs sm:text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 sm:space-y-6">
          {/* Shipping */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 sm:p-6 shadow-sm overflow-hidden">
            <h2 className="text-sm sm:text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 sm:mb-4">Shipping Details</h2>
            <div className="grid sm:grid-cols-2 gap-2 sm:gap-3 sm:gap-4">
              <div>
                <label className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 block">First Name</label>
                <input type="text" value={shipping.firstName} onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })}
                  className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]" />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 block">Last Name</label>
                <input type="text" value={shipping.lastName} onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })}
                  className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]" />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 block">Email</label>
                <input type="email" value={shipping.email} disabled
                  className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 block">Phone</label>
                <div className="flex">
                  <CountryCodeSelector value={countryCode} onChange={setCountryCode} buttonClassName="px-2 sm:px-3 py-2 sm:py-2.5" />
                  <input type="tel" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    className="flex-1 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-r-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]" placeholder="82 123 4567" />
                </div>
              </div>
              {/* Google Address Autocomplete */}
              <div className="sm:col-span-2">
                <label className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 block">Delivery Address</label>
                <AddressAutocomplete
                  onAddressSelect={handleAddressSelect}
                  defaultValue={shipping.formattedAddress || shipping.street}
                  placeholder="Start typing your delivery address..."
                  className="text-xs sm:text-sm"
                />
                {addressWarning && (
                  <div className="mt-1.5 flex items-start gap-1.5 text-amber-600">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <p className="text-[11px]">{addressWarning}</p>
                  </div>
                )}
                {shipping.addressVerified && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-[10px] text-emerald-600 font-medium">Address verified</p>
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 block">Street Address</label>
                <input type="text" value={shipping.street} onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                  className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]" />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 block">Suburb</label>
                <input type="text" value={shipping.suburb} onChange={(e) => setShipping({ ...shipping, suburb: e.target.value })}
                  className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]" />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 block">City</label>
                <input type="text" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]" />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 block">Province</label>
                <select value={shipping.province} onChange={(e) => setShipping({ ...shipping, province: e.target.value })}
                  className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]">
                  <option value="">Select province</option>
                  <option>Gauteng</option><option>Western Cape</option><option>KwaZulu-Natal</option>
                  <option>Eastern Cape</option><option>Free State</option><option>Limpopo</option>
                  <option>Mpumalanga</option><option>North West</option><option>Northern Cape</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 block">Postal Code</label>
                <input type="text" value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                  className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#003d7a]" />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 sm:p-6 shadow-sm overflow-hidden">
            <h2 className="text-sm sm:text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 sm:mb-4">Payment Method</h2>
            <div className="space-y-2 sm:space-y-3">
              {[
                { id: 'EFT', label: 'EFT / Bank Transfer', desc: 'Pay via direct bank transfer', icon: Building2, available: true },
                { id: 'PAYFAST', label: 'PayFast', desc: 'Card, instant EFT, SnapScan', icon: CreditCard, available: false },
                { id: 'OZOW', label: 'Ozow', desc: 'Instant EFT payment', icon: CreditCard, available: false },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-2 sm:gap-3 sm:gap-4 p-2.5 sm:p-3 sm:p-4 border rounded-xl cursor-pointer transition-all ${
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
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === method.id ? 'border-[#003d7a]' : 'border-gray-300'
                  }`}>
                    {paymentMethod === method.id && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#003d7a]" />}
                  </div>
                  <method.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{method.label}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{method.desc}{!method.available ? ' (Coming soon)' : ''}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 sm:p-6 lg:sticky lg:top-24 shadow-sm overflow-hidden">
            <h2 className="text-sm sm:text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 sm:mb-4">Order Summary</h2>

            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              {items.map((item) => {
                return (
                  <div key={item.id} className="text-xs sm:text-sm">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 sm:w-12 sm:h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-contain p-0.5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : item.type === 'bundle' ? (
                          <Package className="w-3 h-3 sm:w-4 sm:h-4 sm:w-5 sm:h-5 text-orange-500" />
                        ) : (
                          <Tag className="w-3 h-3 sm:w-4 sm:h-4 sm:w-5 sm:h-5 text-[#003d7a]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs sm:text-sm text-gray-600 break-words">{item.name} <span className="text-gray-400">×{item.quantity}</span></p>
                      </div>
                      <span className="text-[10px] sm:text-xs sm:text-sm text-gray-900 font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Consolidated delivery estimate — worst-case across all items */}
            <div className="mb-3 sm:mb-4 rounded-xl border border-blue-100 bg-blue-50 p-2 sm:p-2.5 sm:p-3">
              <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-semibold text-blue-800 flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                    <CalendarClock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Expected Delivery
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-700 break-words">
                    {shipping.province ? 'Standard' : 'Est.'} · {items.map((i) => i.name.split(' ').slice(0, 2).join(' ')).join(', ')}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 sm:mt-1">Business days only · After payment confirmation</p>
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-blue-800 shrink-0 text-right">{orderDeliveryRange}</p>
              </div>
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
                  <Lock className="w-4 h-4" /> Place Order <span className="hidden sm:inline">— {formatPrice(grandTotal)}</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure checkout
            </p>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-2">
                Orders are processed by {COMPANY.legalName}.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <Link href="/terms" className="text-[#003d7a] hover:underline">Terms & Conditions</Link>
                <span className="text-gray-300">•</span>
                <Link href="/privacy" className="text-[#003d7a] hover:underline">Privacy Policy</Link>
                <span className="text-gray-300">•</span>
                <Link href="/delivery" className="text-[#003d7a] hover:underline">Delivery Policy</Link>
                <span className="text-gray-300">•</span>
                <Link href="/returns" className="text-[#003d7a] hover:underline">Refund Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
