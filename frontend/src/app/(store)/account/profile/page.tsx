'use client';

import Link from 'next/link';
import {
  ArrowLeft, Camera, CheckCircle, Package, Heart, MapPin, CreditCard,
  User, Mail, Phone, Calendar, HelpCircle, Home, ChevronRight,
  Edit3, Grid2X2, ShoppingCart, Shield,
} from 'lucide-react';

function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 pt-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_20px_rgba(0,0,0,0.04)]">
      <div className="grid grid-cols-5 h-16">
        {[
          { label: 'Home', icon: Home, href: '/' },
          { label: 'Categories', icon: Grid2X2, href: '/categories' },
          { label: 'Cart', icon: ShoppingCart, href: '/cart', badge: 3 },
          { label: 'Wishlist', icon: Heart, href: '/wishlist', badge: 2 },
          { label: 'Account', icon: User, href: '/account', active: true },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 text-xs font-medium ${
                item.active ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge ? (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

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
  return (
    <>
      {/* Mobile Layout */}
      <main className="min-h-screen bg-slate-50 pb-28 md:hidden">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <Link href="/account/settings" className="w-9 h-9 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-900" />
        </Link>

        <h1 className="text-base font-bold text-slate-900">My Profile</h1>

        <Link href="/account/profile/edit" className="w-9 h-9 flex items-center justify-center">
          <Edit3 className="w-5 h-5 text-slate-900" />
        </Link>
      </header>

      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 rounded-b-[28px] pt-8 pb-20 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_20%),radial-gradient(circle_at_80%_30%,white_0,transparent_20%),radial-gradient(circle_at_50%_80%,white_0,transparent_20%)]" />

        <div className="relative flex flex-col items-center text-center">
          <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-5xl font-bold text-blue-600">BT</span>

            <button className="absolute -right-1 bottom-3 w-9 h-9 bg-blue-600 border-4 border-white rounded-full flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>

          <h2 className="text-2xl font-bold mt-4">Bretune Tech</h2>
          <p className="text-sm text-blue-100 mt-1">bretunetech@gmail.com</p>

          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-xs font-semibold">
            <Shield className="w-4 h-4" />
            Verified
          </div>
        </div>
      </section>

      <div className="px-4 -mt-12 relative z-10 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md px-4 py-5 grid grid-cols-4 divide-x divide-gray-100">
          {[
            { label: 'Orders', value: 12, icon: Package },
            { label: 'Wishlist', value: 2, icon: Heart },
            { label: 'Addresses', value: 3, icon: MapPin },
            { label: 'Cards', value: 1, icon: CreditCard },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-base font-bold text-slate-900">{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            );
          })}
        </div>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">Personal Information</h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <ProfileInfoRow icon={User} label="Full Name" value="Bretune Tech" />
            <ProfileInfoRow icon={Mail} label="Email Address" value="bretunetech@gmail.com" />
            <ProfileInfoRow icon={Phone} label="Phone Number" value="+27 61 268 5933" />
            <ProfileInfoRow icon={Calendar} label="Date of Birth" value="12 May 1995" />
            <ProfileInfoRow icon={HelpCircle} label="Gender" value="Prefer not to say" />
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">Default Address</h2>

          <Link
            href="/account/addresses"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <Home className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900">Home</p>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  Default
                </span>
              </div>
              <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                13 Rocklands Main Road
                <br />
                Fish Hoek, Cape Town, 7975
                <br />
                South Africa
              </p>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">Quick Actions</h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <QuickActionRow icon={Package} label="My Orders" href="/account/orders" />
            <QuickActionRow icon={Heart} label="My Wishlist" href="/wishlist" />
            <QuickActionRow icon={MapPin} label="Saved Addresses" href="/account/addresses" />
            <QuickActionRow icon={CreditCard} label="Payment Methods" href="/account/payment-methods" />
          </div>
        </section>
      </div>

        <BottomNav />
      </main>

      {/* Desktop Layout */}
      <main className="hidden md:block min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <Link href="/account" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Account
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-500 mt-2">Manage your personal information and preferences</p>
          </div>

          {/* Profile Banner */}
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_20%),radial-gradient(circle_at_80%_30%,white_0,transparent_20%),radial-gradient(circle_at_50%_80%,white_0,transparent_20%)]" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-blue-600">BT</span>
                  <button className="absolute -right-1 bottom-1 w-8 h-8 bg-blue-600 border-4 border-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                <div className="text-white">
                  <h2 className="text-2xl font-bold">Bretune Tech</h2>
                  <p className="text-blue-100 mt-1">bretunetech@gmail.com</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <Shield className="w-4 h-4" />
                    Verified Account
                  </div>
                </div>
              </div>

              <Link
                href="/account/profile/edit"
                className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stats Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Orders', value: 12, icon: Package },
                    { label: 'Wishlist', value: 2, icon: Heart },
                    { label: 'Addresses', value: 3, icon: MapPin },
                    { label: 'Cards', value: 1, icon: CreditCard },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Default Address Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Default Address</h3>
                  <Link href="/account/addresses" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Change
                  </Link>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold text-gray-900">Home</p>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        Default
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      13 Rocklands Main Road<br />
                      Fish Hoek, Cape Town, 7975<br />
                      South Africa
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <ProfileInfoRow icon={User} label="Full Name" value="Bretune Tech" />
                  <ProfileInfoRow icon={Mail} label="Email Address" value="bretunetech@gmail.com" />
                  <ProfileInfoRow icon={Phone} label="Phone Number" value="+27 61 268 5933" />
                  <ProfileInfoRow icon={Calendar} label="Date of Birth" value="12 May 1995" />
                  <ProfileInfoRow icon={HelpCircle} label="Gender" value="Prefer not to say" />
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <QuickActionRow icon={Package} label="My Orders" href="/account/orders" />
                  <QuickActionRow icon={Heart} label="My Wishlist" href="/wishlist" />
                  <QuickActionRow icon={MapPin} label="Saved Addresses" href="/account/addresses" />
                  <QuickActionRow icon={CreditCard} label="Payment Methods" href="/account/payment-methods" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
