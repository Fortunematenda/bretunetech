'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Bell, User, Lock, MapPin, CreditCard, Shield,
  Sun, Globe, DollarSign, Heart, HelpCircle, Headphones, Info,
  LogOut, ChevronRight, Search, ShoppingCart, Settings, Package,
  Grid2X2, ChevronDown, SlidersHorizontal,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

interface Row {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  href?: string;
  value?: string;
}

function SettingRow({
  icon: Icon,
  title,
  subtitle,
  href,
  value,
}: {
  icon: any;
  title: string;
  subtitle: string;
  href?: string;
  value?: string;
}) {
  const row = (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      {value ? (
        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
          {value}
        </span>
      ) : null}

      <ChevronRight className="w-5 h-5 text-slate-400" />
    </div>
  );

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

function SidebarLink({
  icon: Icon,
  label,
  href,
  active,
  badge,
}: {
  icon: any;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
        active
          ? 'bg-blue-50 text-blue-600'
          : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1">{label}</span>

      {badge ? (
        <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function TopHeader() {
  return (
    <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="h-full px-6 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded bg-blue-700 text-white flex items-center justify-center font-black">
            BT
          </div>
          <span className="text-2xl font-black text-slate-900">
            Bretune<span className="text-blue-600">Tech</span>
          </span>
        </Link>

        <div className="flex-1 max-w-3xl">
          <div className="h-12 rounded-xl border border-slate-300 bg-white flex items-center px-4 gap-3">
            <input
              type="text"
              placeholder="Search for products, categories..."
              className="flex-1 outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
            <Search className="w-5 h-5 text-slate-700" />
          </div>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <button className="relative">
            <Bell className="w-6 h-6 text-slate-700" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          <Link href="/cart" className="relative">
            <ShoppingCart className="w-6 h-6 text-slate-700" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              2
            </span>
          </Link>

          <Link href="/account/profile" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              BT
            </div>
            <div className="hidden xl:block">
              <p className="text-sm font-bold text-slate-900">Bretune Tech</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function AccountSidebar() {
  return (
    <aside className="w-72 bg-white border-r border-slate-200 min-h-[calc(100vh-80px)] sticky top-20 shrink-0">
      <div className="p-6">
        <Link href="/account/profile" className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
            BT
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 truncate">Bretune Tech</h3>
            <p className="text-sm text-slate-500 truncate">bretunetech@gmail.com</p>
          </div>
        </Link>

        <nav className="space-y-2">
          <SidebarLink icon={Grid2X2} label="Dashboard" href="/account" />
          <SidebarLink icon={Package} label="My Orders" href="/account/orders" />
          <SidebarLink icon={Heart} label="My Wishlist" href="/wishlist" badge={2} />
          <SidebarLink icon={MapPin} label="Addresses" href="/account/addresses" />
          <SidebarLink icon={CreditCard} label="Payment Methods" href="/account/payment-methods" />
          <SidebarLink icon={Settings} label="Settings" href="/account/settings" active />
        </nav>

        <div className="border-t border-slate-200 mt-8 pt-6">
          <button className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 w-full">
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>
    </aside>
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
      </main>

      {/* Desktop Layout */}
      <main className="hidden md:block min-h-screen bg-slate-50">
        <TopHeader />

        <div className="flex">
          <AccountSidebar />

          <section className="flex-1 px-8 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-black text-slate-900">Settings</h1>
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
                      icon={Shield}
                      title="Security"
                      subtitle="Two-factor auth, devices & more"
                      href="/account/security"
                    />
                  </SettingsCard>

                  <SettingsCard icon={ShoppingCart} title="Shopping Preferences">
                    <SettingRow
                      icon={Heart}
                      title="Wishlist Privacy"
                      subtitle="Manage who can see your wishlist"
                      href="/wishlist"
                    />
                  </SettingsCard>
                </div>

                <div className="space-y-6">
                  <SettingsCard icon={SlidersHorizontal} title="Preferences">
                    <SettingRow
                      icon={Bell}
                      title="Notifications"
                      subtitle="Manage email, SMS & push alerts"
                      href="/account/notifications"
                    />

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

                  <SettingsCard icon={Headphones} title="Support">
                    <SettingRow
                      icon={HelpCircle}
                      title="Help Center"
                      subtitle="FAQs, guides & support"
                      href="/faq"
                    />

                    <SettingRow
                      icon={Headphones}
                      title="Contact Us"
                      subtitle="Chat, email or call us"
                      href="/contact"
                    />

                    <SettingRow
                      icon={Info}
                      title="About BretuneTech"
                      subtitle="App version, terms & info"
                      value="v1.0.0"
                    />
                  </SettingsCard>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 w-full bg-white rounded-2xl border border-slate-200 shadow-sm py-6 flex flex-col items-center justify-center gap-2 hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center gap-3 text-red-600 font-bold text-lg">
                  <LogOut className="w-5 h-5" />
                  Log Out
                </div>
                <p className="text-sm text-slate-500">
                  You will be signed out from your account
                </p>
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
