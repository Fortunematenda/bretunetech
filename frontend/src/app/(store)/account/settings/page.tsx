'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Bell, User, Lock, MapPin, CreditCard, Shield,
  Sun, Globe, DollarSign, Heart, HelpCircle, Headphones, Info,
  LogOut, ChevronRight, Home, Grid2X2, ShoppingCart,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

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

interface Row {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  href?: string;
  value?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const accountRows: Row[] = [
    { icon: User, title: 'Account Information', subtitle: 'Update your personal details', href: '/account/profile' },
    { icon: Lock, title: 'Change Password', subtitle: 'Update your account password', href: '/account/change-password' },
    { icon: MapPin, title: 'Address Book', subtitle: 'Manage your delivery addresses', href: '/account/addresses' },
    { icon: CreditCard, title: 'Payment Methods', subtitle: 'Manage saved cards & wallets', href: '/account/payment-methods' },
    { icon: Shield, title: 'Security', subtitle: 'Two-factor auth, devices & more', href: '/account/security' },
  ];

  const preferenceRows: Row[] = [
    { icon: Bell, title: 'Notifications', subtitle: 'Manage email, SMS & push alerts', href: '/account/notifications' },
    { icon: Sun, title: 'Theme', subtitle: 'Light, Dark or System', value: 'Light' },
    { icon: Globe, title: 'Language', subtitle: 'Choose your language', value: 'English' },
    { icon: DollarSign, title: 'Currency', subtitle: 'Select your preferred currency', value: 'ZAR' },
  ];

  const shoppingRows: Row[] = [
    { icon: Heart, title: 'Wishlist Privacy', subtitle: 'Manage who can see your wishlist', href: '/wishlist' },
  ];

  const supportRows: Row[] = [
    { icon: HelpCircle, title: 'Help Center', subtitle: 'FAQs, guides & support', href: '/faq' },
    { icon: Headphones, title: 'Contact Us', subtitle: 'Chat, email or call us', href: '/contact' },
    { icon: Info, title: 'About BretuneTech', subtitle: 'App version, terms & info', value: 'v1.0.0' },
  ];

  const renderRow = (row: Row, isLast: boolean) => {
    const Icon = row.icon;
    const content = (
      <div className={`flex items-center gap-3 px-4 py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-tight">{row.title}</p>
          <p className="text-xs text-slate-500 mt-1 truncate">{row.subtitle}</p>
        </div>
        {row.value ? (
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
            {row.value}
          </span>
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </div>
    );
    if (row.href) {
      return <Link key={row.title} href={row.href}>{content}</Link>;
    }
    return <button key={row.title} className="w-full text-left">{content}</button>;
  };

  const Section = ({ title, rows }: { title: string; rows: Row[] }) => (
    <div className="mb-6">
      <h2 className="text-base font-bold text-slate-900 mb-3">{title}</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {rows.map((row, i) => renderRow(row, i === rows.length - 1))}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Layout */}
      <main className="min-h-screen bg-slate-50 pb-28 md:hidden">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
          <Link href="/account" className="w-9 h-9 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-900" />
          </Link>

          <h1 className="text-base font-bold text-slate-900">Settings</h1>

          <button className="relative w-9 h-9 flex items-center justify-center">
            <Bell className="w-5 h-5 text-slate-900" />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </header>

        <div className="px-4 pt-5 space-y-6">
          <Section title="Account Settings" rows={accountRows} />
          <Section title="Preferences" rows={preferenceRows} />
          <Section title="Shopping Preferences" rows={shoppingRows} />
          <Section title="Support" rows={supportRows} />

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-100 rounded-2xl py-4 text-red-600 font-bold shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
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
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-2">Manage your account settings and preferences</p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Sidebar Navigation */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-8">
                <nav className="space-y-1">
                  <button className="w-full text-left px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                    Settings
                  </button>
                  <Link href="/account/profile" className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    Profile
                  </Link>
                  <Link href="/account/orders" className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    Orders
                  </Link>
                  <Link href="/account/addresses" className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    Addresses
                  </Link>
                  <Link href="/wishlist" className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    Wishlist
                  </Link>
                </nav>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="lg:col-span-9 space-y-6">
              <Section title="Account Settings" rows={accountRows} />
              <Section title="Preferences" rows={preferenceRows} />
              <Section title="Shopping Preferences" rows={shoppingRows} />
              <Section title="Support" rows={supportRows} />

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <button
                  onClick={handleLogout}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-red-600 font-semibold transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
