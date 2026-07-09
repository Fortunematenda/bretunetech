'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, X, User, Search, Heart, ChevronDown, ChevronRight, LayoutGrid, LogOut, Package, Settings, Loader2, Bell, SlidersHorizontal } from 'lucide-react';
import MobileSidebar from '@/components/layout/MobileSidebar';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptDrawerOpen, setDeptDrawerOpen] = useState(false);
  const [drawerExpandedCats, setDrawerExpandedCats] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<typeof productCategories[0] | null>(null);
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
  const notifRef = useRef<HTMLDivElement>(null);
  const mobileSearchDropdownRef = useRef<HTMLDivElement>(null);
  const itemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.itemCount());

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const { user, logout, token } = useAuthStore();

  useEffect(() => { setMounted(true); }, []);

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
        name: c.name,
        slug: c.slug,
        subcategories: c.children || []
      })) : []))
      .catch(() => {});
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (
        searchRef.current && !searchRef.current.contains(event.target as Node) &&
        mobileSearchDropdownRef.current && !mobileSearchDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search autocomplete
  useEffect(() => {
    if (searchQuery.length >= 3) {
      setSearchLoading(true);
      const timer = setTimeout(async () => {
        try {
          const data = await productsApi.list({ search: searchQuery, limit: '15' });
          setSearchResults((data as any).products || []);
          setShowSearchDropdown(true);
        } catch {
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
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
            <img src="/assets/logo/logo-no-bac.png" alt="Bretunetech Logo" className="h-8 sm:h-10 w-auto" />
          </Link>

          {/* Search */}
          <div className="hidden sm:flex flex-1 relative" ref={searchRef}>
            <input
              type="text"
              placeholder="Search for products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 border-r-0 rounded-l-sm text-sm text-gray-700 focus:outline-none focus:border-[#003d7a]"
            />
            <button onClick={handleSearch} className="px-4 py-2 bg-[#003d7a] hover:bg-blue-800 text-white rounded-r-sm">
              {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[1000] max-h-[500px] overflow-y-auto max-w-md">
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {product.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">{product.sku || ''}</p>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No products found
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
            {user && unreadCount > 0 && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
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
                            onClick={async () => {
                              alert('Mark all read clicked');
                              if (!token) return;
                              try {
                                console.log('Marking all as read...');
                                await notificationsApi.markAllAsRead(token);
                                console.log('Marked all as read, refreshing...');
                                await refreshNotifications();
                              } catch (err) {
                                console.error('Failed to mark all as read:', err);
                                alert('Error: ' + JSON.stringify(err));
                              }
                            }}
                            className="text-[10px] text-gray-500 hover:text-gray-700"
                          >
                            Mark all read
                          </button>
                          <button
                            onClick={async () => {
                              alert('Clear all clicked');
                              if (!token) return;
                              try {
                                console.log('Clearing all notifications...');
                                await notificationsApi.clearAll(token);
                                console.log('Cleared all, refreshing...');
                                await refreshNotifications();
                              } catch (err) {
                                console.error('Failed to clear all:', err);
                                alert('Error: ' + JSON.stringify(err));
                              }
                            }}
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
            {user && unreadCount > 0 && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
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
            {/* Search results dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  {searchResults.slice(0, 8).map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); setMobileSearchOpen(false); }}
                      className="flex items-center gap-3 px-3 py-3 active:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {product.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain p-0.5" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-900 line-clamp-2 leading-snug">{product.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {/* Empty state when no results */}
            {searchQuery && !searchLoading && searchResults.length === 0 && (
              <div className="flex-1 flex items-center justify-center px-4 pb-4">
                <div className="text-center text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No products found</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── ROW 2: Blue bar — All menu + Shop by Category + Nav links ── */}
      <div className="bg-[#003d7a] hidden md:block">
        <div className="max-w-[90vw] mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-stretch">

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
                    <Link href="/blog" className="block px-3 py-2 text-sm text-gray-700 hover:text-[#003d7a] hover:bg-gray-50 rounded" onClick={() => setActiveDropdown(null)}>Blog</Link>
                    <Link href="/faq" className="block px-3 py-2 text-sm text-gray-700 hover:text-[#003d7a] hover:bg-gray-50 rounded" onClick={() => setActiveDropdown(null)}>FAQ</Link>
                    <Link href="/quote" className="block px-3 py-2 text-sm font-semibold text-orange-600 hover:text-orange-500 hover:bg-orange-50 rounded" onClick={() => setActiveDropdown(null)}>Get a Quote</Link>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* ── Amazon-style Slide-out Drawer ── */}
      {deptDrawerOpen && (
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeptDrawerOpen(false)} />
          <aside className="absolute top-0 left-0 h-full w-[320px] bg-white shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center gap-3 px-5 py-3.5 bg-[#232f3e] text-white">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
              {user ? (
                <Link href="/account/profile" onClick={() => setDeptDrawerOpen(false)} className="text-sm font-bold">
                  Hello, {user.firstName || user.email?.split('@')[0]}
                </Link>
              ) : (
                <button onClick={() => { setDeptDrawerOpen(false); setAuthModal('login'); }} className="text-sm font-bold">
                  Hello, sign in
                </button>
              )}
              <button onClick={() => setDeptDrawerOpen(false)} className="ml-auto p-1 hover:bg-white/20 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trending */}
            <div className="py-3 border-b border-gray-200">
              <h3 className="px-5 text-sm font-bold text-gray-900 mb-1">Trending</h3>
              <Link href="/best-sellers" onClick={() => setDeptDrawerOpen(false)}
                className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Best Sellers
              </Link>
              <Link href="/products" onClick={() => setDeptDrawerOpen(false)}
                className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                New Releases
              </Link>
              <Link href="/products?discount=true" onClick={() => setDeptDrawerOpen(false)}
                className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Deals & Specials
              </Link>
            </div>

            {/* Shop By Department */}
            <div className="py-3 border-b border-gray-200">
              <h3 className="px-5 text-sm font-bold text-gray-900 mb-1">Shop By Department</h3>
              {productCategories.map((cat) => {
                const hasChildren = cat.subcategories && cat.subcategories.length > 0;
                const isExpanded = drawerExpandedCats.has(cat.slug);
                return (
                  <div key={cat.slug}>
                    <div className="flex items-center hover:bg-gray-50 transition-colors">
                      <Link
                        href={`/products?category=${cat.slug}`}
                        onClick={() => setDeptDrawerOpen(false)}
                        className="flex-1 px-5 py-2.5 text-sm text-gray-700"
                      >
                        {cat.name}
                      </Link>
                      {hasChildren && (
                        <button
                          onClick={() => {
                            setDrawerExpandedCats(prev => {
                              const next = new Set(prev);
                              if (next.has(cat.slug)) next.delete(cat.slug);
                              else next.add(cat.slug);
                              return next;
                            });
                          }}
                          className="px-4 py-2.5 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      )}
                    </div>
                    {hasChildren && isExpanded && (
                      <div className="bg-gray-50 border-t border-b border-gray-100">
                        {cat.subcategories.map((sub: any) => (
                          <Link key={sub.slug} href={`/products?category=${sub.slug}`}
                            onClick={() => setDeptDrawerOpen(false)}
                            className="block px-8 py-2 text-sm text-gray-600 hover:text-[#003d7a] transition-colors">
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <Link href="/products" onClick={() => setDeptDrawerOpen(false)}
                className="flex items-center gap-1 px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                See all <ChevronDown className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Filters */}
            <div className="py-3 border-b border-gray-200">
              <h3 className="px-5 text-sm font-bold text-gray-900 mb-1">Filters</h3>
              <Link href="/products?maxPrice=1000" onClick={() => setDeptDrawerOpen(false)}
                className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Under R1,000
              </Link>
              <Link href="/products?minPrice=1000&maxPrice=5000" onClick={() => setDeptDrawerOpen(false)}
                className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                R1,000 – R5,000
              </Link>
              <Link href="/products?minPrice=5000&maxPrice=10000" onClick={() => setDeptDrawerOpen(false)}
                className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                R5,000 – R10,000
              </Link>
              <Link href="/products?condition=NEW" onClick={() => setDeptDrawerOpen(false)}
                className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                New Products
              </Link>
              <Link href="/products?condition=REFURBISHED" onClick={() => setDeptDrawerOpen(false)}
                className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Refurbished
              </Link>
            </div>

            {/* Help & Settings */}
            <div className="py-3">
              <h3 className="px-5 text-sm font-bold text-gray-900 mb-1">Help & Settings</h3>
              <Link href="/account" onClick={() => setDeptDrawerOpen(false)}
                className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Your Account
              </Link>
              <Link href="/contact" onClick={() => setDeptDrawerOpen(false)}
                className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Contact Us
              </Link>
              <Link href="/faq" onClick={() => setDeptDrawerOpen(false)}
                className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                FAQ
              </Link>
            </div>
          </aside>
        </div>
      )}

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
