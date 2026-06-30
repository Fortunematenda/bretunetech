'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Pencil, Camera, CheckCircle, Package, Heart, MapPin, CreditCard,
  User, Mail, Phone, Calendar, HelpCircle, Home, ChevronRight, ShoppingBag,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { addressesApi } from '@/lib/api';
import { getOrders } from '@/lib/orders-api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.itemCount());
  const [ordersCount, setOrdersCount] = useState(0);
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    getOrders(token).then((o) => setOrdersCount(Array.isArray(o) ? o.length : 0)).catch(() => {});
    addressesApi.list(token).then((a) => setAddresses(Array.isArray(a) ? a : [])).catch(() => {});
  }, [token]);

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Guest' : 'Guest';
  const initials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() || 'U'
    : 'U';
  const defaultAddress = addresses[0];

  const stats = [
    { icon: Package, value: ordersCount, label: 'Orders' },
    { icon: Heart, value: wishlistCount, label: 'Wishlist' },
    { icon: MapPin, value: addresses.length, label: 'Addresses' },
    { icon: CreditCard, value: 0, label: 'Cards' },
  ];

  const personalInfo = [
    { icon: User, label: 'Full Name', value: fullName },
    { icon: Mail, label: 'Email Address', value: user?.email || '—' },
    { icon: Phone, label: 'Phone Number', value: user?.phone || 'Not set' },
    { icon: Calendar, label: 'Date of Birth', value: 'Not set' },
    { icon: HelpCircle, label: 'Gender', value: 'Prefer not to say' },
  ];

  const quickActions = [
    { icon: Package, label: 'My Orders', href: '/account' },
    { icon: Heart, label: 'My Wishlist', href: '/wishlist' },
    { icon: MapPin, label: 'Saved Addresses', href: '/account/addresses' },
    { icon: CreditCard, label: 'Payment Methods', href: '/account' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 md:bg-white pb-28">
      {/* Mobile header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3.5">
        <button onClick={() => router.back()} aria-label="Go back" className="text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
        <Link href="/account/settings" aria-label="Edit profile" className="text-gray-700">
          <Pencil className="w-[18px] h-[18px]" />
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Blue cover + avatar */}
        <div className="relative bg-gradient-to-br from-[#0055a4] to-[#003d7a] px-4 pt-8 pb-6 text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto shadow-lg">
              <span className="text-3xl font-extrabold text-[#003d7a]">{initials}</span>
            </div>
            <button
              aria-label="Change photo"
              className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#003d7a] border-2 border-white flex items-center justify-center"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <h2 className="mt-3 text-xl font-bold text-white">{fullName}</h2>
          <p className="text-blue-100 text-sm">{user?.email || ''}</p>
          <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-white/15 rounded-full text-white text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" /> Verified
          </span>
        </div>

        <div className="px-4">
          {/* Stats card */}
          <div className="-mt-6 relative bg-white rounded-2xl border border-gray-100 shadow-sm grid grid-cols-4 divide-x divide-gray-100">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center py-4">
                  <Icon className="w-5 h-5 text-[#003d7a] mb-1.5" />
                  <span className="text-lg font-bold text-gray-900 leading-none">{s.value}</span>
                  <span className="text-[11px] text-gray-400 mt-1">{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* Personal Information */}
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2.5 px-1">Personal Information</h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {personalInfo.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={`flex items-center gap-3 px-4 py-3.5 ${i !== personalInfo.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <Icon className="w-[18px] h-[18px] text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900 text-right truncate max-w-[55%]">{item.value}</span>
                </div>
              );
            })}
          </div>

          {/* Default Address */}
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2.5 px-1">Default Address</h3>
          <Link href="/account/addresses" className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#003d7a] flex items-center justify-center shrink-0">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-gray-900">Home</span>
                  <span className="text-[10px] font-semibold text-[#003d7a] bg-blue-50 px-2 py-0.5 rounded-full">Default</span>
                </div>
                {defaultAddress ? (
                  <p className="text-xs text-gray-500 leading-snug">
                    {defaultAddress.street}, {defaultAddress.city}, {defaultAddress.postalCode}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">No saved address yet</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>
          </Link>

          {/* Quick Actions */}
          <h3 className="text-base font-bold text-gray-900 mt-6 mb-2.5 px-1">Quick Actions</h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {quickActions.map((a, i) => {
              const Icon = a.icon;
              return (
                <Link key={a.label} href={a.href} className={`flex items-center gap-3 px-4 py-3.5 ${i !== quickActions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <Icon className="w-[18px] h-[18px] text-gray-400 shrink-0" />
                  <span className="text-sm font-medium text-gray-900 flex-1">{a.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
