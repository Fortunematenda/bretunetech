'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X, Search, Star, Package, Tag, Heart, ShoppingCart, Settings, LogOut,
  Wifi, Laptop, Camera, Printer, Zap, Headphones, Network, Gamepad2,
  ChevronRight, User,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { SHOP_SOLUTIONS } from '@/lib/solutions';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export type NavDrawerCategory = {
  id?: string;
  name: string;
  slug: string;
  _count?: { products?: number };
  subcategories?: { name: string; slug: string }[];
};

export type NavDrawerBrand = {
  id?: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  categories: NavDrawerCategory[];
  brands: NavDrawerBrand[];
  /** When true, drawer is available on all breakpoints (desktop All menu). */
  desktop?: boolean;
};

const JUNK_CATEGORY_RE =
  /^(material|brand name|camera form factor|warranty)|recycled|post.?consumer|water.?repellent|oceancycle|specifically r:pet/i;

function isShopableCategory(name: string, slug: string): boolean {
  const n = (name || '').trim();
  const s = (slug || '').trim().toLowerCase();
  if (!n || !s) return false;
  if (n.length > 42) return false;
  if (JUNK_CATEGORY_RE.test(n) || JUNK_CATEGORY_RE.test(s)) return false;
  if (s === 'general') return false;
  return true;
}

function departmentIcon(key: string) {
  const k = key.toLowerCase();
  if (k.includes('network') || k.includes('wifi') || k === 'networking') return Wifi;
  if (k.includes('computer') || k.includes('laptop') || k.includes('desktop')) return Laptop;
  if (k.includes('cctv') || k.includes('camera') || k.includes('security')) return Camera;
  if (k.includes('print') || k.includes('office')) return Printer;
  if (k.includes('power') || k.includes('ups') || k.includes('backup') || k.includes('solar')) return Zap;
  if (k.includes('accessor') || k.includes('headphone') || k.includes('audio')) return Headphones;
  if (k.includes('wireless') || k.includes('antenna') || k.includes('bridge')) return Network;
  if (k.includes('gaming') || k.includes('game')) return Gamepad2;
  return Package;
}

function roleLabel(role?: string) {
  if (!role) return null;
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') return 'Administrator';
  if (role === 'CUSTOMER') return 'Customer';
  return role.replace(/_/g, ' ');
}

export default function NavDrawer({
  open,
  onClose,
  onLoginClick,
  categories,
  brands,
  desktop = false,
}: Props) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.itemCount());
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [menuQuery, setMenuQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setMenuQuery('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  const departments = useMemo(() => {
    const fromApi = categories
      .filter((c) => isShopableCategory(c.name, c.slug))
      .map((c) => ({
        key: c.slug,
        name: c.name,
        href: `/products?category=${encodeURIComponent(c.slug)}`,
        count: typeof c._count?.products === 'number' ? c._count.products : undefined,
      }));

    if (fromApi.length >= 4) return fromApi.slice(0, 8);

    // Existing shop-by-solution nav (real routes) — never invent counts.
    return SHOP_SOLUTIONS.map((s) => ({
      key: s.slug,
      name: s.title,
      href: `/products?solution=${encodeURIComponent(s.slug)}`,
      count: undefined as number | undefined,
    }));
  }, [categories]);

  const topBrands = useMemo(
    () => (Array.isArray(brands) ? brands.filter((b) => b?.slug && b?.name).slice(0, 8) : []),
    [brands]
  );

  const q = menuQuery.trim().toLowerCase();
  const match = (label: string) => !q || label.toLowerCase().includes(q);

  const trending = [
    { href: '/best-sellers', label: 'Best Sellers', icon: Star },
    { href: '/new-arrivals', label: 'New Arrivals', icon: Package },
    { href: '/products?discount=true', label: 'Deals & Specials', icon: Tag },
  ].filter((item) => match(item.label));

  const filteredDepartments = departments.filter((d) => match(d.name));
  const filteredBrands = topBrands.filter((b) => match(b.name));

  const accountLinks = [
    { href: '/account/wishlist', label: 'Wishlist', icon: Heart, badge: mounted ? wishlistCount : 0 },
    { href: '/cart', label: 'Cart', icon: ShoppingCart, badge: mounted ? cartCount : 0 },
    { href: '/account/orders', label: 'My Orders', icon: Package },
    { href: '/account/settings', label: 'Account Settings', icon: Settings },
  ].filter((item) => match(item.label));

  const handleLogout = () => {
    logout();
    handleClose();
    router.push('/');
  };

  const accountHref =
    user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? '/admin' : '/account/profile';
  const displayName = user?.firstName?.trim() || user?.email?.split('@')[0] || 'there';
  const initial = (displayName.charAt(0) || 'U').toUpperCase();
  const role = roleLabel(user?.role);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-[1100] bg-black/50 transition-opacity duration-300',
          desktop ? '' : 'md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed top-0 left-0 z-[1200] flex h-full flex-col',
          'w-[88vw] max-w-[390px] border-r border-slate-200 bg-white p-0 shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          desktop ? '' : 'md:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* 1. User profile header */}
        <div className="shrink-0 border-b border-slate-100 px-4 pb-4 pt-4">
          <div className="flex items-start gap-3">
            {user ? (
              <Link
                href={accountHref}
                onClick={handleClose}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="relative shrink-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003d7a] text-sm font-bold text-white">
                    {initial}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">👋 Welcome back,</p>
                  <p className="truncate text-base font-bold text-slate-900">{displayName}</p>
                  {role && <p className="text-xs text-slate-500">{role}</p>}
                </div>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onLoginClick();
                }}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Welcome</p>
                  <p className="text-base font-bold text-slate-900">Sign in</p>
                  <p className="text-xs text-slate-500">Account &amp; orders</p>
                </div>
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close menu"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
          {/* 2. Menu search */}
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              ref={searchRef}
              value={menuQuery}
              onChange={(e) => setMenuQuery(e.target.value)}
              placeholder="Search menu..."
              className="h-10 rounded-xl border-slate-200 bg-white pl-9 pr-14 text-sm"
              aria-label="Search menu"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
              ⌘K
            </span>
          </div>

          {/* 3. Trending */}
          {trending.length > 0 && (
            <section className="mt-5">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-orange-600">
                🔥 Trending
              </p>
              <ul className="space-y-0.5">
                {trending.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleClose}
                        className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                      >
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* 4. Shop by Department */}
          {filteredDepartments.length > 0 && (
            <section className="mt-5">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#003d7a]">
                🏢 Shop by Department
              </p>
              <div className="grid grid-cols-2 gap-2">
                {filteredDepartments.map((dept) => {
                  const Icon = departmentIcon(dept.key);
                  return (
                    <Link
                      key={dept.key}
                      href={dept.href}
                      onClick={handleClose}
                      className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-[#003d7a]/40 hover:bg-slate-50"
                    >
                      <Icon className="h-4 w-4 text-[#003d7a]" />
                      <span className="text-xs font-semibold leading-snug text-slate-900">
                        {dept.name}
                      </span>
                      {typeof dept.count === 'number' && dept.count > 0 && (
                        <span className="text-[11px] text-slate-500">{dept.count.toLocaleString()}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
              <Separator className="my-3 bg-slate-100" />
              <Link
                href="/products"
                onClick={handleClose}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#003d7a] hover:underline"
              >
                View all departments
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </section>
          )}

          {/* 5. Top Brands */}
          {filteredBrands.length > 0 && (
            <section className="mt-5">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#003d7a]">
                🛡️ Top Brands
              </p>
              <div className="grid grid-cols-4 gap-2">
                {filteredBrands.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/products?brand=${encodeURIComponent(b.slug)}`}
                    onClick={handleClose}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 p-2 text-center transition-colors hover:border-[#003d7a]/40 hover:bg-slate-50"
                    title={b.name}
                  >
                    <div className="flex h-9 w-full items-center justify-center rounded-lg bg-slate-50 px-1">
                      {b.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.logoUrl} alt="" className="max-h-7 max-w-full object-contain" />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500">
                          {b.name.slice(0, 3).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="w-full truncate text-[10px] font-medium text-slate-700">
                      {b.name}
                    </span>
                  </Link>
                ))}
              </div>
              <Separator className="my-3 bg-slate-100" />
              <Link
                href="/products"
                onClick={handleClose}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#003d7a] hover:underline"
              >
                View all brands
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </section>
          )}

          {/* 6. Account quick links */}
          {accountLinks.length > 0 && (
            <section className="mt-5">
              <ul className="space-y-0.5">
                {accountLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleClose}
                        className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                      >
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span className="flex-1">{item.label}</span>
                        {typeof item.badge === 'number' && item.badge > 0 && (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#003d7a] px-1.5 text-[10px] font-bold text-white">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* 7. Logout / Sign in */}
          <div className="mt-4 border-t border-slate-100 pt-3">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onLoginClick();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-semibold text-[#003d7a] transition-colors hover:bg-blue-50"
              >
                <User className="h-4 w-4" />
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
