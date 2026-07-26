'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, X, User, Search, Heart, ChevronDown, LogOut, Package, Settings, Loader2, Bell } from 'lucide-react';
import MobileSidebar from '@/components/layout/MobileSidebar';
import NavDrawer from '@/components/layout/NavDrawer';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { brand } from '@/lib/brand';
import { brandsApi, categoriesApi, productsApi, notificationsApi } from '@/lib/api';
import AuthModal from '@/components/ui/AuthModal';
import { LinkedinIcon, FacebookIcon } from '@/components/ui/SocialIcons';

const navItems: { name: string; href: string; hasDropdown: boolean }[] = [];

function getTimeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deptDrawerOpen, setDeptDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const desktopNotifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);
  const mobileSearchDropdownRef = useRef<HTMLDivElement>(null);
  const itemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.itemCount());

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/products?search=${encodeURIComponent(q)}`);
    // Keep the query in the input (Takealot-style); just close suggestions / mobile sheet.
    setSearchResults([]);
    setShowSearchDropdown(false);
    setMobileSearchOpen(false);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };
  const { user, logout, token } = useAuthStore();

  useEffect(() => { setMounted(true); }, []);

  // Only keep search text on the products listing when ?search= is active.
  // Clear when opening a product page or any other route.
  useEffect(() => {
    if (pathname === '/products') {
      setSearchQuery(searchParams.get('search') || '');
      return;
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (deptDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [deptDrawerOpen]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await brandsApi.list();
        setBrands(Array.isArray(data) ? data : []);
      } catch {
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    categoriesApi.list()
      .then((data) => setProductCategories(Array.isArray(data) ? data.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        _count: c._count,
        subcategories: c.children || [],
      })) : []))
      .catch(() => {});
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      const clickedInsideDesktopSearch = searchRef.current?.contains(event.target as Node) ?? false;
      const clickedInsideMobileSearch = mobileSearchDropdownRef.current?.contains(event.target as Node) ?? false;
      if (!clickedInsideDesktopSearch && !clickedInsideMobileSearch) {
        setShowSearchDropdown(false);
      }
      const clickedInsideDesktopNotifications = desktopNotifRef.current?.contains(event.target as Node) ?? false;
      const clickedInsideMobileNotifications = mobileNotifRef.current?.contains(event.target as Node) ?? false;
      if (!clickedInsideDesktopNotifications && !clickedInsideMobileNotifications) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search autocomplete — show options after 3 characters; match typed words via API
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 3) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    setShowSearchDropdown(true);

    const timer = setTimeout(async () => {
      try {
        const data = await productsApi.list({ search: query, limit: '15' });
        if (cancelled) return;
        const products = ((data as any).products || []) as any[];
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        const synonyms: Record<string, string[]> = {
          comp: ['computer', 'laptop', 'notebook', 'desktop', 'tower'],
          computer: ['laptop', 'notebook', 'desktop', 'tower'],
          computers: ['laptop', 'notebook', 'desktop', 'tower'],
          computing: ['laptop', 'notebook', 'desktop'],
        };
        const noise = new Set(['compact', 'compatible', 'component', 'components', 'composite']);
        const scoreProduct = (p: any) => {
          const name = `${p.displayName || p.name || ''}`.toLowerCase();
          const words = name.split(/[^a-z0-9]+/).filter(Boolean);
          const cat = `${p.category?.name || ''} ${p.category?.slug || ''}`.toLowerCase();
          const brand = `${p.brand?.name || ''}`.toLowerCase();
          const sku = `${p.sku || ''}`.toLowerCase();
          const haystack = `${name} ${cat}`;
          return terms.reduce((score, term) => {
            let s = score;
            const extras = synonyms[term] || [];
            const deviceHit = ['laptop', 'notebook', 'desktop', 'tower'].some((v) => haystack.includes(v));
            if (deviceHit) s += 24;
            else if (extras.some((v) => haystack.includes(v))) s += 8;
            if (cat.startsWith(term) || cat.includes(term)) s += 8;
            const wordHits = words.filter((w) => w.startsWith(term));
            if (wordHits.some((w) => w.startsWith('computer'))) s += deviceHit ? 8 : 3;
            else if (wordHits.some((w) => noise.has(w))) s += 1;
            else if (wordHits.length) s += 6;
            if (name.startsWith(term)) s += 5;
            if (name.includes(term) && !wordHits.every((w) => noise.has(w))) s += 3;
            if (brand.includes(term)) s += 2;
            if (sku.includes(term)) s += 2;
            return s;
          }, 0);
        };
        const ranked = [...products].sort((a, b) => scoreProduct(b) - scoreProduct(a));
        setSearchResults(ranked);
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Fetch notifications for logged-in users
  useEffect(() => {
    if (!mounted || !user || !token) return;

    const fetchNotifications = async () => {
      try {
        const data = await notificationsApi.getNotifications(token, { limit: 10 });
        setNotifications(data);
      } catch {
        setNotifications([]);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const data = await notificationsApi.getUnreadCount(token);
        setUnreadCount(data.count);
      } catch {
        setUnreadCount(0);
      }
    };

    fetchNotifications();
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [mounted, user, token]);

  // Refetch notifications after marking as read
  const refreshNotifications = async () => {
    if (!token) return;
    try {
      const [notifData, countData] = await Promise.all([
        notificationsApi.getNotifications(token, { limit: 10 }),
        notificationsApi.getUnreadCount(token),
      ]);
      setNotifications(notifData);
      const count = countData?.count ?? 0;
      setUnreadCount(count);
      console.log('Notifications refreshed, unread count:', count);
    } catch (err) {
      console.error('Failed to refresh notifications:', err);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAllNotificationsRead = async () => {
    if (!token) return;
    try {
      await notificationsApi.markAllAsRead(token);
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
      setUnreadCount(0);
      await refreshNotifications();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!token) return;
    try {
      await notificationsApi.clearAll(token);
      setNotifications([]);
      setUnreadCount(0);
      await refreshNotifications();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 overflow-visible">

      {/* ── ROW 1: White bar — Logo + Search + Account ── */}
      <div className="bg-white shadow-md">
        <div className="w-full mx-auto px-2 sm:px-4 lg:px-8 flex items-center gap-1.5 sm:gap-4 py-2.5 sm:py-3 overflow-visible">

          {/* Mobile hamburger — far left on mobile */}
          <button className="md:hidden text-gray-700 p-1 shrink-0" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/assets/logo/logo-no-bac.png"
              alt="BretuneTech Logo"
              width={160}
              height={40}
              className="h-8 w-auto sm:h-10"
              priority
            />
          </Link>

          {/* Search */}
          <div className="hidden sm:flex flex-1 relative" ref={searchRef}>
            <input
              type="text"
              placeholder="Search for products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.trim().length >= 3) setShowSearchDropdown(true); }}
              onClick={() => { if (searchQuery.trim().length >= 3) setShowSearchDropdown(true); }}
              onKeyDown={handleSearchKeyPress}
              autoComplete="off"
              className="flex-1 px-4 py-2 border border-gray-300 border-r-0 rounded-l-sm text-sm text-gray-700 focus:outline-none focus:border-[#003d7a]"
            />
            <button onClick={handleSearch} className="px-4 py-2 bg-[#003d7a] hover:bg-blue-800 text-white rounded-r-sm" aria-label="Search products">
              {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>

            {/* Search Dropdown */}
            {showSearchDropdown && searchQuery.trim().length >= 3 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[1000] max-h-[500px] overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.displayName || product.name} className="w-full h-full object-contain p-0.5" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.displayName || product.name}</p>
                          {product.brand?.name && (
                            <p className="text-[11px] text-gray-500 mt-0.5">{product.brand.name}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-[#003d7a]">
                            R {Number(product.sellingPrice || 0).toLocaleString('en-ZA')}
                          </p>
                          {product.sku && <p className="text-[10px] text-gray-400 font-mono">{product.sku}</p>}
                        </div>
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleSearch()}
                      className="w-full px-4 py-3 text-sm font-semibold text-[#003d7a] hover:bg-blue-50 text-left"
                    >
                      View all results for “{searchQuery.trim()}”
                    </button>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No products found for “{searchQuery.trim()}”
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account + Cart */}
          <div className="hidden md:flex items-center gap-5 shrink-0 overflow-visible">
            {user ? (
              <div className="relative overflow-visible" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1 text-sm text-gray-700 hover:text-[#003d7a]"
                >
                  <User className="w-4 h-4" />
                  <span>{user.firstName || 'Account'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] py-1">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#003d7a]"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/account"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#003d7a]"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User className="w-4 h-4" /> My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#003d7a]"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Package className="w-4 h-4" /> My Orders
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <button onClick={() => setAuthModal('login')} className="text-gray-700 hover:text-[#003d7a] font-medium">Login</button>
                <button onClick={() => setAuthModal('register')} className="text-gray-700 hover:text-[#003d7a]">Register</button>
              </div>
            )}
            <Link href="/account/wishlist" className="relative text-gray-700 hover:text-[#003d7a]">
              <Heart className="w-5 h-5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {user && (unreadCount > 0 || notifications.length > 0) && (
              <div className="relative" ref={desktopNotifRef}>
                <button
                  onClick={() => {
                    const willOpen = !notifOpen;
                    setNotifOpen(willOpen);
                    if (willOpen) refreshNotifications();
                  }}
                  className="relative text-gray-700 hover:text-[#003d7a]"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-[200]">
                    <div className="flex items-center justify-between p-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">Notifications</p>
                      {notifications.length > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-[10px] text-gray-500 hover:text-gray-700"
                          >
                            Mark all read
                          </button>
                          <button
                            onClick={clearAllNotifications}
                            className="text-[10px] text-red-500 hover:text-red-700"
                          >
                            Clear all
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50' : ''}`}
                            onClick={async () => {
                              if (!notif.isRead && token) {
                                try {
                                  await notificationsApi.markAsRead(token, notif.id);
                                  await refreshNotifications();
                                } catch {}
                              }
                              if (notif.link) {
                                setNotifOpen(false);
                                router.push(notif.link);
                              }
                            }}
                          >
                            <p className="text-sm text-gray-900">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{getTimeAgo(notif.createdAt)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <Link href="/cart" className="relative text-gray-700 hover:text-[#003d7a]">
              <ShoppingCart className="w-5 h-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile right icons: search + bell (if logged in) + wishlist + cart */}
          <div className="md:hidden flex items-center gap-2.5 ml-auto shrink-0">
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="text-gray-700 p-0.5"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            {user && (unreadCount > 0 || notifications.length > 0) && (
              <div className="relative" ref={mobileNotifRef}>
                <button
                  onClick={() => {
                    const willOpen = !notifOpen;
                    setNotifOpen(willOpen);
                    if (willOpen) refreshNotifications();
                  }}
                  className="relative text-gray-700 p-0.5"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 bg-black/40 z-[1290]"
                      onClick={() => setNotifOpen(false)}
                    />
                    {/* Bottom sheet */}
                    <div
                      className="fixed left-0 right-0 bottom-0 z-[1300] bg-white rounded-t-2xl shadow-2xl flex flex-col"
                      style={{ maxHeight: '75vh', paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
                    >
                      {/* Drag handle */}
                      <div className="flex justify-center pt-3 pb-1 shrink-0">
                        <div className="w-10 h-1 rounded-full bg-gray-300" />
                      </div>
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#003d7a]" />
                          <p className="text-[15px] font-bold text-gray-900">Notifications</p>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {notifications.length > 0 && (
                            <>
                              <button
                                onClick={async () => {
                                  if (!token) return;
                                  try {
                                    console.log('Mobile: Marking all as read...');
                                    await notificationsApi.markAllAsRead(token);
                                    console.log('Mobile: Marked all as read, refreshing...');
                                    await refreshNotifications();
                                  } catch (err) {
                                    console.error('Mobile: Failed to mark all as read:', err);
                                  }
                                }}
                                className="text-[11px] font-medium text-[#003d7a]"
                              >Mark all read</button>
                              <button
                                onClick={async () => {
                                  if (!token) return;
                                  try {
                                    console.log('Mobile: Clearing all notifications...');
                                    await notificationsApi.clearAll(token);
                                    console.log('Mobile: Cleared all, refreshing...');
                                    await refreshNotifications();
                                  } catch (err) {
                                    console.error('Mobile: Failed to clear all:', err);
                                  }
                                }}
                                className="text-[11px] font-medium text-red-500"
                              >Clear</button>
                            </>
                          )}
                          <button onClick={() => setNotifOpen(false)} className="text-gray-400 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {/* Notification list */}
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Bell className="w-8 h-8 mb-3 opacity-30" />
                            <p className="text-sm">No notifications</p>
                          </div>
                        ) : notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 active:bg-gray-50 cursor-pointer ${!notif.isRead ? 'bg-blue-50/60' : ''}`}
                            onClick={async () => {
                              if (!notif.isRead && token) { try { await notificationsApi.markAsRead(token, notif.id); await refreshNotifications(); } catch {} }
                              if (notif.link) { setNotifOpen(false); router.push(notif.link); }
                            }}
                          >
                            <div className="mt-1 shrink-0">
                              {!notif.isRead
                                ? <span className="w-2 h-2 rounded-full bg-[#003d7a] block" />
                                : <span className="w-2 h-2 rounded-full bg-gray-200 block" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-gray-900 leading-snug">{notif.title}</p>
                              <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-3 leading-snug">{notif.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{getTimeAgo(notif.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            <Link href="/account/wishlist" className="relative text-gray-700">
              <Heart className="w-5 h-5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative text-gray-700">
              <ShoppingCart className="w-5 h-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile search bottom sheet modal */}
      {mobileSearchOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-[1290] md:hidden"
            onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); setShowSearchDropdown(false); }}
          />
          {/* Bottom sheet */}
          <div
            className="fixed left-0 right-0 top-0 z-[1300] bg-white shadow-2xl flex flex-col md:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#003d7a]" />
                <p className="text-[15px] font-bold text-gray-900">Search</p>
              </div>
              <button onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); setShowSearchDropdown(false); }} className="text-gray-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Search input */}
            <div className="px-4 py-3 shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search for products, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none min-w-0"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-400 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {/* Search results */}
            {searchQuery.trim().length >= 3 && (
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {searchLoading ? (
                  <div className="py-10 text-center text-gray-400 text-sm">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    {searchResults.slice(0, 10).map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); setMobileSearchOpen(false); }}
                        className="flex items-center gap-3 px-3 py-3 active:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.displayName || product.name} className="w-full h-full object-contain p-0.5" />
                          ) : (
                            <Package className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-gray-900 line-clamp-2 leading-snug">{product.displayName || product.name}</p>
                          {product.brand?.name && (
                            <p className="text-[11px] text-gray-500 mt-0.5">{product.brand.name}</p>
                          )}
                        </div>
                        <p className="text-[12px] font-semibold text-[#003d7a] shrink-0">
                          R {Number(product.sellingPrice || 0).toLocaleString('en-ZA')}
                        </p>
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => { handleSearch(); setMobileSearchOpen(false); }}
                      className="w-full px-3 py-3 text-sm font-semibold text-[#003d7a] active:bg-blue-50 text-left border-t border-gray-100"
                    >
                      View all results
                    </button>
                  </div>
                ) : (
                  <div className="py-10 text-center text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No products found for “{searchQuery.trim()}”</p>
                  </div>
                )}
              </div>
            )}
            {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
              <div className="px-4 pb-4 text-center text-gray-400 text-sm">
                Type at least 3 characters to see suggestions
              </div>
            )}
          </div>
        </>
      )}

      {/* ── ROW 2: Blue bar — All menu + Shop by Category + Nav links ── */}
      <div className="bg-[#003d7a] hidden md:block">
        <div className="mx-auto flex w-full max-w-[1560px] items-stretch px-4 sm:px-6">

          {/* All Categories hamburger button (Amazon-style) */}
          <button
            onClick={() => setDeptDrawerOpen(true)}
            className="flex items-center gap-1.5 px-4 py-3 text-white text-sm font-bold hover:bg-blue-800 transition-colors h-full border-r border-white/10"
          >
            <Menu className="w-5 h-5" />
            All
          </button>

          

          {/* Horizontal nav links */}
          <nav className="flex items-stretch">
            <Link href="/products?discount=true" className="flex items-center px-4 py-3 text-sm text-white hover:text-orange-400 hover:bg-blue-800 transition-colors h-full">
              Today&apos;s Deals
            </Link>
            <Link href="/best-sellers" className="flex items-center px-4 py-3 text-sm text-white hover:text-orange-400 hover:bg-blue-800 transition-colors h-full">
              Best Sellers
            </Link>
            <Link href="/new-arrivals" className="flex items-center px-4 py-3 text-sm text-white hover:text-orange-400 hover:bg-blue-800 transition-colors h-full">
              New Arrivals
            </Link>
            <Link href="/services" className="flex items-center px-4 py-3 text-sm text-white hover:text-orange-400 hover:bg-blue-800 transition-colors h-full">
              Services
            </Link>
            <Link href="/bundles" className="flex items-center px-4 py-3 text-sm text-white hover:text-orange-400 hover:bg-blue-800 transition-colors h-full">
              Bundles
            </Link>
            <Link href="/contact" className="flex items-center px-4 py-3 text-sm text-white hover:text-orange-400 hover:bg-blue-800 transition-colors h-full">
              Contact Us
            </Link>

            {/* Resources Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('Resources')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 px-4 py-3 text-sm text-white hover:text-orange-400 hover:bg-blue-800 transition-colors h-full">
                Resources
                <ChevronDown className="w-3 h-3" />
              </button>

              {activeDropdown === 'Resources' && (
                <div className="absolute top-full left-0 bg-white rounded-b-lg shadow-xl border border-gray-200 w-[200px] z-[200]">
                  <div className="p-3">
                    <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Services</p>
                    <Link href="/services/book" className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[#003d7a] hover:bg-blue-50 rounded" onClick={() => setActiveDropdown(null)}>📅 Book a Service</Link>
                    <div className="border-t border-gray-100 my-2" />
                    <p className="px-3 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Info</p>
                    <Link href="/faq" className="block px-3 py-2 text-sm text-gray-700 hover:text-[#003d7a] hover:bg-gray-50 rounded" onClick={() => setActiveDropdown(null)}>FAQ</Link>
                    <Link href="/about" className="block px-3 py-2 text-sm text-gray-700 hover:text-[#003d7a] hover:bg-gray-50 rounded" onClick={() => setActiveDropdown(null)}>About</Link>
                    <Link href="/quote" className="block px-3 py-2 text-sm font-semibold text-orange-600 hover:text-orange-500 hover:bg-orange-50 rounded" onClick={() => setActiveDropdown(null)}>Get a Quote</Link>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop All-menu drawer */}
      <NavDrawer
        open={deptDrawerOpen}
        onClose={() => setDeptDrawerOpen(false)}
        onLoginClick={() => setAuthModal('login')}
        categories={productCategories}
        brands={brands}
        desktop
      />

      {/* Mobile Sidebar Drawer */}
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onLoginClick={() => setAuthModal('login')}
        categories={productCategories}
        brands={brands}
      />

      {/* Auth Modal */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitchMode={(m) => setAuthModal(m)}
        />
      )}
    </header>
  );
}
