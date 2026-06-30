'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X, User, ShoppingCart, Heart, Package, Clock, ChevronRight,
  LogOut, Mail, Phone, Wifi, Camera, Network, Zap, Wrench,
  Router, Server, Radio, HardDrive, Tag, Sparkles, Star,
  Percent, TrendingUp, HelpCircle, Truck, RotateCcw, Info,
  FileText, Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';

interface Props {
  open: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  categories: { id?: string; name: string; slug: string }[];
  brands: { id?: string; name: string; slug: string }[];
}

/* ── helpers ── */
const catIconMap: Record<string, React.ReactNode> = {
  wifi:         <Wifi className="w-4 h-4" />,
  'wifi-routers': <Wifi className="w-4 h-4" />,
  cctv:         <Camera className="w-4 h-4" />,
  cameras:      <Camera className="w-4 h-4" />,
  networking:   <Network className="w-4 h-4" />,
  power:        <Zap className="w-4 h-4" />,
  accessories:  <Wrench className="w-4 h-4" />,
  cables:       <Wrench className="w-4 h-4" />,
  routers:      <Router className="w-4 h-4" />,
  switches:     <Server className="w-4 h-4" />,
  'access-points': <Radio className="w-4 h-4" />,
  storage:      <HardDrive className="w-4 h-4" />,
};

function getCatIcon(slug: string, name: string): React.ReactNode {
  const s = slug.toLowerCase();
  const n = name.toLowerCase();
  if (catIconMap[s]) return catIconMap[s];
  if (n.includes('wifi') || n.includes('router')) return <Wifi className="w-4 h-4" />;
  if (n.includes('cctv') || n.includes('camera')) return <Camera className="w-4 h-4" />;
  if (n.includes('network')) return <Network className="w-4 h-4" />;
  if (n.includes('power') || n.includes('ups')) return <Zap className="w-4 h-4" />;
  if (n.includes('switch')) return <Server className="w-4 h-4" />;
  if (n.includes('access')) return <Radio className="w-4 h-4" />;
  if (n.includes('storage')) return <HardDrive className="w-4 h-4" />;
  return <Tag className="w-4 h-4" />;
}

/* ── section heading ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-5 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
      {children}
    </p>
  );
}

/* ── single menu row ── */
function MenuItem({
  href, icon, label, badge, onClick,
}: {
  href: string; icon: React.ReactNode; label: string; badge?: number; onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors"
    >
      <span className="text-gray-500 shrink-0">{icon}</span>
      <span className="flex-1 font-medium">{label}</span>
      {badge != null && badge > 0 && (
        <span className="min-w-[20px] h-5 px-1 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
    </Link>
  );
}

/* ── divider ── */
function Divider() {
  return <div className="h-px bg-gray-100 mx-4" />;
}

/* ── main component ── */
export default function MobileSidebar({ open, onClose, onLoginClick, categories, brands }: Props) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.itemCount());
  const drawerRef = useRef<HTMLDivElement>(null);

  /* lock body scroll when open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* ESC to close */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const close = () => onClose();

  const handleSignOut = () => {
    logout();
    close();
    router.push('/');
  };

  /* static fallback department list (merged with live categories below) */
  const staticDepts = [
    { slug: 'wifi-routers', name: 'WiFi Routers' },
    { slug: 'cctv-cameras', name: 'CCTV Cameras' },
    { slug: 'networking', name: 'Networking' },
    { slug: 'power', name: 'Power & Backup' },
    { slug: 'accessories', name: 'Accessories' },
    { slug: 'switches', name: 'Switches' },
    { slug: 'access-points', name: 'Access Points' },
    { slug: 'cameras', name: 'IP Cameras' },
    { slug: 'storage', name: 'Storage' },
  ];

  /* use live categories if available, else fall back to static */
  const departments = categories.length > 0
    ? categories.slice(0, 10)
    : staticDepts;

  /* known brands list — merge live brand data */
  const knownBrands = ['Ubiquiti', 'Dahua', 'Cudy', 'MikroTik', 'TP-Link', 'Hikvision', 'Reyee'];
  const displayBrands = brands.length > 0
    ? brands.slice(0, 8)
    : knownBrands.map((n) => ({ id: n, name: n, slug: n.toLowerCase().replace(/\//g, '-') }));

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[1100] bg-black/50 transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 left-0 z-[1200] h-full w-[85vw] max-w-[360px] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ── Blue account header ── */}
        <div className="bg-[#003d7a] shrink-0">
          <div className="flex items-center justify-between px-4 pt-3 pb-3">
            {/* Logo + greeting */}
            <Link href="/" onClick={close} className="flex items-center gap-2.5">
              <img
                src="/assets/logo/logo-no-bac.png"
                alt="BretuneTech"
                className="h-7 w-auto"
                style={{ filter: 'brightness(0) invert(1)', mixBlendMode: 'screen' }}
              />
            </Link>
            <button
              onClick={close}
              aria-label="Close menu"
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account row */}
          {user ? (
            <Link
              href={user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? '/admin' : '/account'}
              onClick={close}
              className="flex items-center gap-3 px-4 pb-4 group"
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">
                  Hello, {user.firstName || 'there'}
                </p>
                <p className="text-blue-200 text-xs">View your account →</p>
              </div>
            </Link>
          ) : (
            <button
              onClick={() => { close(); onLoginClick(); }}
              className="flex items-center gap-3 px-4 pb-4 w-full text-left group"
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">Hello, sign in</p>
                <p className="text-blue-200 text-xs">Account &amp; orders →</p>
              </div>
            </button>
          )}
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* Quick links */}
          <SectionTitle>Quick Links</SectionTitle>
          <MenuItem href="/account"         icon={<User className="w-4 h-4" />}         label="Your Account"     onClick={close} />
          <MenuItem href="/account"         icon={<Package className="w-4 h-4" />}       label="Orders"           onClick={close} />
          <MenuItem href="/wishlist"        icon={<Heart className="w-4 h-4" />}         label="Wishlist"         badge={wishlistCount} onClick={close} />
          <MenuItem href="/cart"            icon={<ShoppingCart className="w-4 h-4" />}  label="Cart"             badge={itemCount}     onClick={close} />
          <MenuItem href="/products"        icon={<Clock className="w-4 h-4" />}         label="Recently Viewed"  onClick={close} />

          <Divider />

          {/* Shop by Department */}
          <SectionTitle>Shop by Department</SectionTitle>
          {departments.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              onClick={close}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <span className="text-gray-500 shrink-0">{getCatIcon(cat.slug, cat.name)}</span>
              <span className="flex-1 font-medium">{cat.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            </Link>
          ))}

          <Divider />

          {/* Featured Brands */}
          <SectionTitle>Featured Brands</SectionTitle>
          {displayBrands.map((b) => (
            <Link
              key={b.slug}
              href={`/products?brand=${b.slug}`}
              onClick={close}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-gray-500 leading-none text-center">
                  {b.name.slice(0, 2).toUpperCase()}
                </span>
              </span>
              <span className="flex-1 font-medium">{b.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            </Link>
          ))}

          <Divider />

          {/* Deals & Featured */}
          <SectionTitle>Deals &amp; Featured</SectionTitle>
          <MenuItem href="/products?filter=on-special"   icon={<Percent className="w-4 h-4" />}    label="Today's Deals"       onClick={close} />
          <MenuItem href="/products?filter=new-arrivals" icon={<Sparkles className="w-4 h-4" />}   label="New Arrivals"         onClick={close} />
          <MenuItem href="/products?featured=true"       icon={<Star className="w-4 h-4" />}       label="Featured Products"   onClick={close} />
          <MenuItem href="/products?filter=best-sellers" icon={<TrendingUp className="w-4 h-4" />} label="Best Sellers"         onClick={close} />
          <MenuItem href="/products?discount=true"       icon={<Tag className="w-4 h-4" />}        label="Clearance Deals"     onClick={close} />

          <Divider />

          {/* Help & Settings */}
          <SectionTitle>Help &amp; Settings</SectionTitle>
          <MenuItem href="/contact"     icon={<Phone className="w-4 h-4" />}       label="Contact Us"             onClick={close} />
          <MenuItem href="/faq"         icon={<HelpCircle className="w-4 h-4" />}  label="FAQ"                    onClick={close} />
          <MenuItem href="/services"    icon={<Truck className="w-4 h-4" />}       label="Delivery Information"   onClick={close} />
          <MenuItem href="/warranty"    icon={<RotateCcw className="w-4 h-4" />}   label="Returns &amp; Warranty" onClick={close} />
          <MenuItem href="/about"       icon={<Info className="w-4 h-4" />}        label="About BretuneTech"      onClick={close} />
          <MenuItem href="/terms"       icon={<FileText className="w-4 h-4" />}    label="Terms &amp; Conditions" onClick={close} />
          <MenuItem href="/privacy"     icon={<Shield className="w-4 h-4" />}      label="Privacy Policy"         onClick={close} />

          {/* Sign out (logged in) / Sign in (logged out) */}
          {user ? (
            <>
              <Divider />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3.5 w-full text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="font-medium">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Divider />
              <button
                onClick={() => { close(); onLoginClick(); }}
                className="flex items-center gap-3 px-4 py-3.5 w-full text-sm text-[#003d7a] hover:bg-blue-50 transition-colors"
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="font-medium">Sign In / Register</span>
              </button>
            </>
          )}

          {/* Spacer for bottom nav — must clear the 64px sticky bottom nav */}
          <div className="h-20" />
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-gray-100 px-4 py-3 bg-gray-50">
          <p className="text-xs font-bold text-gray-700">BretuneTech</p>
          <p className="text-[10px] text-gray-400 leading-snug">Technology ecommerce &amp; solutions provider</p>
          <a href="mailto:support@bretunetech.com" className="flex items-center gap-1.5 mt-1.5 text-[10px] text-[#003d7a]">
            <Mail className="w-3 h-3" /> support@bretunetech.com
          </a>
        </div>
      </div>
    </>
  );
}
