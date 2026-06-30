'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, User, Lock, MapPin, CreditCard, Shield,
  Sun, Globe, DollarSign, Heart, HelpCircle, Headphones, Info,
  LogOut, ChevronRight, Search, ShoppingCart, Settings, Package,
  Grid2X2, ChevronDown, SlidersHorizontal,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';

interface Row {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  href?: string;
  value?: string;
  isLogout?: boolean;
}

function SettingRow({
  icon: Icon,
  title,
  subtitle,
  href,
  value,
  isLogout,
  onLogout,
}: {
  icon: any;
  title: string;
  subtitle: string;
  href?: string;
  value?: string;
  isLogout?: boolean;
  onLogout?: () => void;
}) {
  const row = (
    <div className={`flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-b-0 transition-colors ${isLogout ? 'hover:bg-red-50' : 'hover:bg-slate-50'}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isLogout ? 'bg-red-50' : 'bg-blue-50'}`}>
        <Icon className={`w-5 h-5 ${isLogout ? 'text-red-600' : 'text-blue-600'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-bold ${isLogout ? 'text-red-600' : 'text-slate-900'}`}>{title}</h4>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      {value ? (
        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
          {value}
        </span>
      ) : null}

      {!isLogout && <ChevronRight className="w-5 h-5 text-slate-400" />}
    </div>
  );

  if (isLogout) {
    return <button onClick={onLogout} className="w-full text-left">{row}</button>;
  }

  if (href) {
    return <Link href={href}>{row}</Link>;
  }

  return <button className="w-full text-left">{row}</button>;
}

function SettingsCard({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>

      <div>{children}</div>
    </section>
  );
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
    { icon: LogOut, title: 'Log Out', subtitle: 'Sign out from your account', isLogout: true },
  ];

  const preferenceRows: Row[] = [
    { icon: Sun, title: 'Theme', subtitle: 'Light, Dark or System', value: 'Light' },
    { icon: Globe, title: 'Language', subtitle: 'Choose your language', value: 'English' },
    { icon: DollarSign, title: 'Currency', subtitle: 'Select your preferred currency', value: 'ZAR' },
  ];

  const shoppingRows: Row[] = [
    { icon: Heart, title: 'Wishlist Privacy', subtitle: 'Manage who can see your wishlist', href: '/account/wishlist' },
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
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${row.isLogout ? 'bg-red-50' : 'bg-blue-50'}`}>
          <Icon className={`w-5 h-5 ${row.isLogout ? 'text-red-600' : 'text-blue-600'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold leading-tight ${row.isLogout ? 'text-red-600' : 'text-slate-900'}`}>{row.title}</p>
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
    if (row.isLogout) {
      return <button key={row.title} onClick={handleLogout} className="w-full text-left">{content}</button>;
    }
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

          <div className="w-9 h-9"></div>
        </header>

        <div className="px-4 pt-5 space-y-6">
          <Section title="Account Settings" rows={accountRows} />
          <Section title="Preferences" rows={preferenceRows} />
          <Section title="Shopping Preferences" rows={shoppingRows} />
          <Section title="Support" rows={supportRows} />
        </div>
      </main>

      {/* Desktop Layout */}
      <main className="hidden md:block min-h-screen bg-slate-50">
        <section className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
              <p className="text-slate-500 mt-2">
                Manage your account preferences and settings
              </p>
            </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <SettingsCard icon={User} title="Account Settings">
                    <SettingRow
                      icon={User}
                      title="Account Information"
                      subtitle="Update your personal details"
                      href="/account/profile"
                    />

                    <SettingRow
                      icon={Lock}
                      title="Change Password"
                      subtitle="Update your account password"
                      href="/account/change-password"
                    />

                    <SettingRow
                      icon={MapPin}
                      title="Address Book"
                      subtitle="Manage your delivery addresses"
                      href="/account/addresses"
                    />

                    <SettingRow
                      icon={CreditCard}
                      title="Payment Methods"
                      subtitle="Manage saved cards & wallets"
                      href="/account/payment-methods"
                    />

                    <SettingRow
                      icon={LogOut}
                      title="Log Out"
                      subtitle="Sign out from your account"
                      isLogout={true}
                      onLogout={handleLogout}
                    />
                  </SettingsCard>

                  <SettingsCard icon={SlidersHorizontal} title="Preferences">
                    <SettingRow
                      icon={Sun}
                      title="Theme"
                      subtitle="Light, Dark or System"
                      value="Light"
                    />

                    <SettingRow
                      icon={Globe}
                      title="Language"
                      subtitle="Choose your language"
                      value="English"
                    />

                    <SettingRow
                      icon={DollarSign}
                      title="Currency"
                      subtitle="Select your preferred currency"
                      value="ZAR"
                    />
                  </SettingsCard>
                </div>
              </div>
            </div>
          </section>
      </main>
    </>
  );
}
