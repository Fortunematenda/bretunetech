'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Camera, Package, Heart, MapPin, CreditCard,
  User, Mail, Phone, Calendar, HelpCircle, Home, ChevronRight,
  Edit3, Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { addressesApi } from '@/lib/api';
import { getOrders } from '@/lib/orders-api';
import { useWishlistStore } from '@/store/wishlist-store';

function ProfileInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 last:border-b-0">
      <Icon className="w-5 h-5 text-slate-500 shrink-0" />

      <p className="flex-1 text-sm font-semibold text-slate-900">{label}</p>

      <p className="text-sm text-slate-500 text-right truncate max-w-[170px]">{value}</p>
    </div>
  );
}

function QuickActionRow({
  icon: Icon,
  label,
  href,
}: {
  icon: any;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 last:border-b-0"
    >
      <Icon className="w-5 h-5 text-slate-500 shrink-0" />
      <p className="flex-1 text-sm font-semibold text-slate-900">{label}</p>
      <ChevronRight className="w-4 h-4 text-slate-400" />
    </Link>
  );
}

export default function ProfilePage() {
  const { user, token } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.itemCount());
  const [ordersCount, setOrdersCount] = useState(0);
  const [addressesCount, setAddressesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        // Fetch orders count
        const orders = await getOrders(token);
        setOrdersCount(orders.length || 0);

        // Fetch addresses count
        const addresses = await addressesApi.list(token);
        setAddressesCount(Array.isArray(addresses) ? addresses.length : 0);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  return (
    <>
      {/* Mobile Layout */}
      <main className="md:hidden min-h-screen bg-slate-50 pb-28">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between">
          <Link href="/account/settings" className="w-9 h-9 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-900" />
          </Link>

          <h1 className="text-lg font-bold text-slate-900">My Profile</h1>

          <Link href="/account/profile/edit" className="w-9 h-9 flex items-center justify-center">
            <Edit3 className="w-5 h-5 text-slate-900" />
          </Link>
        </header>

        <section className="relative bg-gradient-to-br from-[#003d7a] via-[#003d7a] to-[#002a55] rounded-b-[28px] pt-8 pb-20 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_20%),radial-gradient(circle_at_80%_30%,white_0,transparent_20%),radial-gradient(circle_at_50%_80%,white_0,transparent_20%)]" />

          <div className="relative flex flex-col items-center text-center">
            <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-5xl font-bold text-[#003d7a]">{getInitials()}</span>

              <button className="absolute -right-1 bottom-3 w-9 h-9 bg-[#003d7a] border-4 border-white rounded-full flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            <h2 className="text-2xl font-bold mt-4">{getFullName()}</h2>
            <p className="text-sm text-blue-100 mt-1">{user?.email || ''}</p>

            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-xs font-semibold">
              <Shield className="w-4 h-4" />
              Verified
            </div>
          </div>
        </section>

        <div className="px-4 -mt-12 relative z-10 space-y-6">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-3">Personal Information</h2>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <ProfileInfoRow icon={User} label="Full Name" value={getFullName()} />
              <ProfileInfoRow icon={Mail} label="Email Address" value={user?.email || ''} />
              <ProfileInfoRow icon={Phone} label="Phone Number" value={user?.phone || 'Not set'} />
            </div>
          </section>
        </div>
      </main>

      {/* Desktop Layout */}
      <main className="hidden md:block min-h-screen bg-slate-50">
        <section className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
              <p className="text-slate-500 mt-2">Manage your personal information and preferences</p>
            </div>

            {/* Profile Banner */}
            <div className="bg-gradient-to-br from-[#003d7a] via-[#003d7a] to-[#002a55] rounded-2xl p-8 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_20%),radial-gradient(circle_at_80%_30%,white_0,transparent_20%),radial-gradient(circle_at_50%_80%,white_0,transparent_20%)]" />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-4xl font-bold text-[#003d7a]">{getInitials()}</span>
                    <button className="absolute -right-1 bottom-1 w-8 h-8 bg-[#003d7a] border-4 border-white rounded-full flex items-center justify-center hover:bg-[#002a55] transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  
                  <div className="text-white">
                    <h2 className="text-2xl font-bold">{getFullName()}</h2>
                    <p className="text-blue-100 mt-1">{user?.email || ''}</p>
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-xs font-semibold">
                      <Shield className="w-4 h-4" />
                      Verified Account
                    </div>
                  </div>
                </div>

                <Link
                  href="/account/profile/edit"
                  className="px-6 py-3 bg-white text-[#003d7a] rounded-xl font-semibold hover:bg-[#e6f0ff] transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
              </div>
              <div className="divide-y divide-slate-200">
                <ProfileInfoRow icon={User} label="Full Name" value={getFullName()} />
                <ProfileInfoRow icon={Mail} label="Email Address" value={user?.email || ''} />
                <ProfileInfoRow icon={Phone} label="Phone Number" value={user?.phone || 'Not set'} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
