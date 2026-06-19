'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, X, User, Search, Heart, ChevronDown, ChevronRight, LayoutGrid, LogOut, Package, Settings, Loader2, Bell } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { brand } from '@/lib/brand';
import { brandsApi, categoriesApi, productsApi, notificationsApi } from '@/lib/api';
import AuthModal from '@/components/ui/AuthModal';
import { LinkedinIcon, FacebookIcon } from '@/components/ui/SocialIcons';

const navItems = [
  { name: 'Brands', href: '/brands', hasDropdown: true },
];

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
      .then((data) => setProductCategories(Array.isArray(data) ? data.map((c: any) => ({ name: c.name, slug: c.slug, subcategories: [] })) : []))
      .catch(() => {});
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
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
      setUnreadCount(countData.count);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-md overflow-visible">

      {/* ── ROW 1: White bar — Logo + Search + Account ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[90vw] mx-auto w-full px-3 sm:px-4 sm:px-6 lg:px-8 flex items-center gap-2 sm:gap-4 py-3 overflow-x-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#003d7a] rounded-full flex items-center justify-center">
              <div className="w-4.5 h-4.5 sm:w-6 sm:h-6 bg-gradient-to-br from-orange-400 to-blue-500 rounded-full" />
            </div>
            <div>
              <p className="text-[#003d7a] text-base sm:text-lg font-bold leading-none">{brand.shortName}</p>
              <p className="hidden sm:block text-orange-500 text-[9px] font-medium">{brand.tagline}</p>
            </div>
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
          <div className="hidden md:flex items-center gap-5 shrink-0">
            {mounted && user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1 text-sm text-gray-700 hover:text-[#003d7a]"
                >
                  <User className="w-4 h-4" />
                  <span>{user.firstName || 'Account'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[200] py-1">
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
            ) : mounted && !user ? (
              <div className="flex items-center gap-3 text-sm">
                <button onClick={() => setAuthModal('login')} className="text-gray-700 hover:text-[#003d7a] font-medium">Login</button>
                <button onClick={() => setAuthModal('register')} className="text-gray-700 hover:text-[#003d7a]">Register</button>
              </div>
            ) : (
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
            )}
            <Link href="/wishlist" className="relative text-gray-700 hover:text-[#003d7a]">
              <Heart className="w-5 h-5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {mounted && user && (
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
                              if (!token) return;
                              try {
                                await notificationsApi.markAllAsRead(token);
                                await refreshNotifications();
                              } catch {}
                            }}
                            className="text-[10px] text-gray-500 hover:text-gray-700"
                          >
                            Mark all read
                          </button>
                          <button
                            onClick={async () => {
                              if (!token) return;
                              try {
                                await notificationsApi.clearAll(token);
                                await refreshNotifications();
                              } catch {}
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

          {/* Cart icon on mobile */}
          <Link href="/cart" className="md:hidden relative text-gray-700 hover:text-[#003d7a] ml-1 shrink-0">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Wishlist icon on mobile */}
          <Link href="/wishlist" className="md:hidden relative text-gray-700 hover:text-[#003d7a] ml-1 shrink-0">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            {mounted && wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Search icon on mobile */}
          <button className="md:hidden text-gray-700 p-1 ml-1 shrink-0" onClick={() => setMobileSearchOpen(!mobileSearchOpen)}>
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Mobile menu toggle - far right */}
          <button className="md:hidden text-gray-700 p-1 ml-1 shrink-0" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#003d7a]"
            />
            <button onClick={() => setMobileSearchOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ── ROW 2: Blue bar — Shop by Category + Nav links ── */}
      <div className="bg-[#003d7a] hidden md:block">
        <div className="max-w-[90vw] mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-stretch">

          {/* Shop by Category */}
          <div
            className="relative shrink-0"
            onMouseEnter={() => setDeptOpen(true)}
            onMouseLeave={() => { setDeptOpen(false); setSelectedCategory(null); }}
          >
            <button className="flex items-center gap-2 px-5 py-3 bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold h-full">
              <LayoutGrid className="w-4 h-4" />
              Shop by Category
              <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${deptOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Department mega dropdown */}
            {deptOpen && (
              <div className="absolute top-full left-0 flex bg-white shadow-2xl border border-gray-200 z-[300] min-w-[220px]">
                {/* Category list */}
                <div className="w-56 py-2">
                  {productCategories.map((cat) => (
                    <button
                      key={cat.slug}
                      onMouseEnter={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        selectedCategory?.slug === cat.slug ? 'bg-blue-50 text-[#003d7a] font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  ))}
                  <div className="border-t border-gray-100 mt-2 pt-2" onMouseEnter={() => setSelectedCategory(null)}>
                    <Link href="/products" className="block px-4 py-2 text-sm text-[#003d7a] font-semibold hover:bg-gray-50">
                      View All Products →
                    </Link>
                    <Link href="/bundles" className="block px-4 py-2 text-sm text-orange-600 font-semibold hover:bg-orange-50" onClick={() => { setDeptOpen(false); setSelectedCategory(null); }}>
                      🎁 Bundle Kits →
                    </Link>
                  </div>
                </div>

                {/* Subcategories panel */}
                {selectedCategory && (
                  <div className="w-56 border-l border-gray-100 py-2 bg-gray-50">
                    <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{selectedCategory.name}</p>
                    {selectedCategory.subcategories.map((sub: any) => (
                      <Link
                        key={sub.slug}
                        href={`/products?category=${selectedCategory.slug}&subcategory=${sub.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-[#003d7a] hover:bg-blue-50"
                        onClick={() => { setDeptOpen(false); setSelectedCategory(null); }}
                      >
                        {sub.name}
                      </Link>
                    ))}
                    <Link
                      href={`/products?category=${selectedCategory.slug}`}
                      className="block px-4 py-2.5 mt-1 border-t border-gray-100 text-sm text-[#003d7a] font-medium hover:bg-blue-50"
                      onClick={() => { setDeptOpen(false); setSelectedCategory(null); }}
                    >
                      All {selectedCategory.name} →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Horizontal nav tabs */}
          <nav className="flex items-stretch">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-3 text-sm text-white hover:text-orange-400 hover:bg-blue-800 transition-colors h-full">
                  {item.name}
                  {item.hasDropdown && <ChevronDown className="w-3 h-3" />}
                </button>

                {/* Brands Dropdown */}
                {item.name === 'Brands' && activeDropdown === 'Brands' && (
                  <div className="absolute top-full left-0 bg-white rounded-b-lg shadow-xl border border-gray-200 w-[200px] z-[200]">
                    <div className="p-3">
                      {brands.map((b) => (
                        <Link key={b.slug} href={`/products?brand=${b.slug}`} className="block px-3 py-2 text-sm text-gray-700 hover:text-[#003d7a] hover:bg-gray-50 rounded" onClick={() => setActiveDropdown(null)}>
                          {b.name}
                        </Link>
                      ))}
                      <Link href="/brands" className="block mt-2 pt-2 border-t border-gray-100 px-3 py-1 text-sm text-[#003d7a] font-medium hover:underline" onClick={() => setActiveDropdown(null)}>
                        View All Brands →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}

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
                    <Link href="/services" className="block px-3 py-2 text-sm text-gray-700 hover:text-[#003d7a] hover:bg-gray-50 rounded" onClick={() => setActiveDropdown(null)}>Our Services</Link>
                    <Link href="/services/book" className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[#003d7a] hover:bg-blue-50 rounded" onClick={() => setActiveDropdown(null)}>📅 Book a Service</Link>
                    <div className="border-t border-gray-100 my-2" />
                    <p className="px-3 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Info</p>
                    <Link href="/blog" className="block px-3 py-2 text-sm text-gray-700 hover:text-[#003d7a] hover:bg-gray-50 rounded" onClick={() => setActiveDropdown(null)}>Blog</Link>
                    <Link href="/faq" className="block px-3 py-2 text-sm text-gray-700 hover:text-[#003d7a] hover:bg-gray-50 rounded" onClick={() => setActiveDropdown(null)}>FAQ</Link>
                    <Link href="/quote" className="block px-3 py-2 text-sm font-semibold text-orange-600 hover:text-orange-500 hover:bg-orange-50 rounded" onClick={() => setActiveDropdown(null)}>Get a Quote</Link>
                    <Link href="/contact" className="block px-3 py-2 text-sm text-gray-700 hover:text-[#003d7a] hover:bg-gray-50 rounded" onClick={() => setActiveDropdown(null)}>Contact Us</Link>
                    <Link href="/warranty" className="block px-3 py-2 text-sm text-gray-700 hover:text-[#003d7a] hover:bg-gray-50 rounded" onClick={() => setActiveDropdown(null)}>Warranty</Link>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-3 space-y-2">
            {/* Mobile search */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#003d7a]"
              />
            </div>
            {/* Shop main links */}
            <div className="border-b border-gray-100 pb-2">
              <Link href="/products" className="block py-2 text-sm font-semibold text-[#003d7a] hover:text-blue-800" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
              <Link href="/categories" className="block py-2 text-sm font-semibold text-[#003d7a] hover:text-blue-800" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
              <Link href="/brands" className="block py-2 text-sm font-semibold text-[#003d7a] hover:text-blue-800" onClick={() => setMobileMenuOpen(false)}>Brands</Link>
              <Link href="/bundles" className="block py-2 text-sm font-semibold text-orange-600 hover:text-orange-500" onClick={() => setMobileMenuOpen(false)}>🎁 Bundle Kits</Link>
            </div>
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="block py-2 text-gray-700 hover:text-[#003d7a] border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>
                {item.name}
              </Link>
            ))}
            {/* Resources in mobile menu */}
            <div className="border-b border-gray-100 pb-2">
              <p className="py-2 text-gray-500 text-sm font-medium">Services</p>
              <div className="pl-3 space-y-1">
                <Link href="/services" className="block py-1.5 text-sm text-gray-600 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>Our Services</Link>
                <Link href="/services/book" className="block py-1.5 text-sm font-semibold text-[#003d7a] hover:text-blue-800" onClick={() => setMobileMenuOpen(false)}>📅 Book a Service</Link>
              </div>
            </div>
            <div className="border-b border-gray-100 pb-2">
              <p className="py-2 text-gray-500 text-sm font-medium">Resources</p>
              <div className="pl-3 space-y-1">
                <Link href="/blog" className="block py-1.5 text-sm text-gray-600 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                <Link href="/faq" className="block py-1.5 text-sm text-gray-600 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
                <Link href="/quote" className="block py-1.5 text-sm font-semibold text-orange-600 hover:text-orange-500" onClick={() => setMobileMenuOpen(false)}>Get a Quote</Link>
                <Link href="/contact" className="block py-1.5 text-sm text-gray-600 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
                <Link href="/warranty" className="block py-1.5 text-sm text-gray-600 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>Warranty</Link>
              </div>
            </div>
            <div className="pt-2 space-y-2">
              {user ? (
                <>
                  <Link href={(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? '/admin' : '/account'} className="block py-2 text-gray-700 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>
                    {user.firstName || 'My Account'}
                  </Link>
                  {user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && (
                    <Link href="/account/orders" className="block py-2 text-gray-700 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>
                      My Orders
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      router.push('/');
                    }}
                    className="block w-full text-left py-2 text-red-600 hover:text-red-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMobileMenuOpen(false); setAuthModal('login'); }} className="block py-2 text-gray-700 hover:text-[#003d7a]">Login</button>
                  <button onClick={() => { setMobileMenuOpen(false); setAuthModal('register'); }} className="block py-2 text-gray-700 hover:text-[#003d7a]">Register</button>
                </>
              )}
              <Link href="/cart" className="flex items-center gap-2 py-2 text-gray-700 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>
                <ShoppingCart className="w-4 h-4" /> Cart {mounted && itemCount > 0 && `(${itemCount})`}
              </Link>
            </div>

            {/* Social Links Section */}
            <div className="border-t border-gray-100 mt-4 pt-4">
              <p className="px-2 py-2 text-gray-500 text-sm font-medium">Follow BretuneTech</p>
              <div className="flex items-center gap-3 px-2">
                <a
                  href="https://www.linkedin.com/company/bretunetech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium flex-1"
                >
                  <LinkedinIcon className="w-4 h-4" /> LinkedIn
                </a>
                <a
                  href="https://www.facebook.com/bretunetech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors text-sm font-medium flex-1"
                >
                  <FacebookIcon className="w-4 h-4" /> Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

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
