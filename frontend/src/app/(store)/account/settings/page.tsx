'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Bell, User, Lock, MapPin, CreditCard, Shield,
  Sun, Globe, DollarSign, Heart, HelpCircle, Headphones, Info,
  LogOut, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

interface Row {
  icon: React.ElementType;
  label: string;
  desc: string;
  href?: string;
  badge?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const accountRows: Row[] = [
    { icon: User, label: 'Account Information', desc: 'Update your personal details', href: '/account/profile' },
    { icon: Lock, label: 'Change Password', desc: 'Update your account password', href: '/account/profile' },
    { icon: MapPin, label: 'Address Book', desc: 'Manage your delivery addresses', href: '/account/addresses' },
    { icon: CreditCard, label: 'Payment Methods', desc: 'Manage saved cards & wallets', href: '/account' },
    { icon: Shield, label: 'Security', desc: 'Two-factor auth, devices & more', href: '/account' },
  ];

  const preferenceRows: Row[] = [
    { icon: Bell, label: 'Notifications', desc: 'Manage email, SMS & push alerts', href: '/account' },
    { icon: Sun, label: 'Theme', desc: 'Light, Dark or System', badge: 'Light' },
    { icon: Globe, label: 'Language', desc: 'Choose your language', badge: 'English' },
    { icon: DollarSign, label: 'Currency', desc: 'Select your preferred currency', badge: 'ZAR' },
  ];

  const shoppingRows: Row[] = [
    { icon: Heart, label: 'Wishlist Privacy', desc: 'Manage who can see your wishlist', href: '/wishlist' },
  ];

  const supportRows: Row[] = [
    { icon: HelpCircle, label: 'Help Center', desc: 'FAQs, guides & support', href: '/faq' },
    { icon: Headphones, label: 'Contact Us', desc: 'Chat, email or call us', href: '/contact' },
    { icon: Info, label: 'About BretuneTech', desc: 'App version, terms & info', badge: 'v1.0.0' },
  ];

  const renderRow = (row: Row, isLast: boolean) => {
    const Icon = row.icon;
    const content = (
      <div className={`flex items-center gap-3 px-4 py-3.5 ${!isLast ? 'border-b border-gray-100' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Icon className="w-[18px] h-[18px] text-[#003d7a]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{row.label}</p>
          <p className="text-xs text-gray-400 leading-tight mt-0.5">{row.desc}</p>
        </div>
        {row.badge ? (
          <span className="text-xs font-semibold text-[#003d7a] bg-blue-50 px-2.5 py-1 rounded-lg shrink-0">{row.badge}</span>
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
        )}
      </div>
    );
    if (row.href) {
      return <Link key={row.label} href={row.href}>{content}</Link>;
    }
    return <button key={row.label} className="w-full text-left">{content}</button>;
  };

  const Section = ({ title, rows }: { title: string; rows: Row[] }) => (
    <div className="mb-6">
      <h2 className="text-base font-bold text-gray-900 mb-2.5 px-1">{title}</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {rows.map((row, i) => renderRow(row, i === rows.length - 1))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 md:bg-white">
      {/* Mobile header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} aria-label="Go back" className="text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Settings</h1>
        </div>
        <Link href="/account" className="relative text-gray-700">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">3</span>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-28">
        <Section title="Account Settings" rows={accountRows} />
        <Section title="Preferences" rows={preferenceRows} />
        <Section title="Shopping Preferences" rows={shoppingRows} />
        <Section title="Support" rows={supportRows} />

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-gray-100 shadow-sm rounded-2xl text-red-600 font-semibold text-sm active:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>
    </div>
  );
}
