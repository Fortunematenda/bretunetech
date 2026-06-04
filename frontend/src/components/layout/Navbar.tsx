'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, X, User, Search, Heart, ChevronDown, ChevronRight, LayoutGrid, LogOut, Package, Settings } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { brand } from '@/lib/brand';

const navItems = [
  { name: 'Products', href: '/products', hasDropdown: true },
  { name: 'Brands', href: '/brands', hasDropdown: true },
];

// Product categories with subcategories
const productCategories = [
  {
    name: 'Networking',
    slug: 'internet-networking',
    subcategories: [
      { name: 'Routers', slug: 'routers' },
      { name: 'Switches', slug: 'switches' },
      { name: 'Access Points', slug: 'access-points' },
      { name: 'Network Cables', slug: 'cables' },
    ],
  },
  {
    name: 'Power Solutions',
    slug: 'power-solutions',
    subcategories: [
      { name: 'UPS', slug: 'ups' },
      { name: 'Inverters', slug: 'inverters' },
      { name: 'Batteries', slug: 'batteries' },
      { name: 'Solar Panels', slug: 'solar' },
    ],
  },
  {
    name: 'Technology',
    slug: 'technology',
    subcategories: [
      { name: 'Laptops', slug: 'laptops' },
      { name: 'Desktops', slug: 'desktops' },
      { name: 'Monitors', slug: 'monitors' },
      { name: 'Components', slug: 'components' },
    ],
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    subcategories: [
      { name: 'Keyboards', slug: 'keyboards' },
      { name: 'Mice', slug: 'mice' },
      { name: 'Cables', slug: 'cables' },
      { name: 'Adapters', slug: 'adapters' },
    ],
  },
  {
    name: 'Cameras',
    slug: 'cameras',
    subcategories: [
      { name: 'IP Cameras', slug: 'ip-cameras' },
      { name: 'CCTV Cameras', slug: 'cctv-cameras' },
      { name: 'PTZ Cameras', slug: 'ptz-cameras' },
      { name: 'Doorbells', slug: 'doorbells' },
    ],
  },
];

const brands = [
  { name: 'MikroTik', slug: 'mikrotik' },
  { name: 'Ubiquiti', slug: 'ubiquiti' },
  { name: 'Hubble', slug: 'hubble' },
  { name: 'Must', slug: 'must' },
  { name: 'Mecer', slug: 'mecer' },
  { name: 'Logitech', slug: 'logitech' },
  { name: 'Hikvision', slug: 'hikvision' },
  { name: 'Dahua', slug: 'dahua' },
  { name: 'Ezviz', slug: 'ezviz' },
];

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deptOpen, setDeptOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<typeof productCategories[0] | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const itemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.itemCount());
  const { user, logout } = useAuthStore();

  useEffect(() => { setMounted(true); }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 shadow-md">

      {/* ── ROW 1: White bar — Logo + Search + Account ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center gap-4 py-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-[#003d7a] rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-blue-500 rounded-full" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[#003d7a] text-lg font-bold leading-none">{brand.shortName}</p>
              <p className="text-orange-500 text-[9px] font-medium">{brand.tagline}</p>
            </div>
          </Link>

          {/* Search */}
          <div className="flex flex-1">
            <input
              type="text"
              placeholder="Search for products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 border-r-0 rounded-l-sm text-sm text-gray-700 focus:outline-none focus:border-[#003d7a]"
            />
            <button className="px-4 py-2 bg-[#003d7a] hover:bg-blue-800 text-white rounded-r-sm">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Account + Cart */}
          <div className="hidden md:flex items-center gap-5 shrink-0">
            {user ? (
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

                    {user.role === 'ADMIN' ? (
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
                <Link href="/login" className="text-gray-700 hover:text-[#003d7a] font-medium">Login</Link>
                <Link href="/register" className="text-gray-700 hover:text-[#003d7a]">Register</Link>
              </div>
            )}
            <Link href="/wishlist" className="relative text-gray-700 hover:text-[#003d7a]">
              <Heart className="w-5 h-5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative text-gray-700 hover:text-[#003d7a]">
              <ShoppingCart className="w-5 h-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-gray-700 p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── ROW 2: Blue bar — Shop by Dept + Nav links ── */}
      <div className="bg-[#003d7a] hidden md:block">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-stretch">

          {/* Shop by Department */}
          <div
            className="relative shrink-0"
            onMouseEnter={() => setDeptOpen(true)}
            onMouseLeave={() => { setDeptOpen(false); setSelectedCategory(null); }}
          >
            <button className="flex items-center gap-2 px-5 py-3 bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold h-full">
              <LayoutGrid className="w-4 h-4" />
              Shop by Department
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
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <Link href="/products" className="block px-4 py-2 text-sm text-[#003d7a] font-semibold hover:bg-gray-50">
                      View All Products →
                    </Link>
                  </div>
                </div>

                {/* Subcategories panel */}
                {selectedCategory && (
                  <div className="w-56 border-l border-gray-100 py-2 bg-gray-50">
                    <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{selectedCategory.name}</p>
                    {selectedCategory.subcategories.map((sub) => (
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
                <div className="absolute top-full left-0 bg-white rounded-b-lg shadow-xl border border-gray-200 w-[180px] z-[200]">
                  <div className="p-3">
                    <Link href="/blog" className="block px-3 py-2 text-sm text-gray-700 hover:text-[#003d7a] hover:bg-gray-50 rounded" onClick={() => setActiveDropdown(null)}>Blog</Link>
                    <Link href="/faq" className="block px-3 py-2 text-sm text-gray-700 hover:text-[#003d7a] hover:bg-gray-50 rounded" onClick={() => setActiveDropdown(null)}>FAQ</Link>
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
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="block py-2 text-gray-700 hover:text-[#003d7a] border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>
                {item.name}
              </Link>
            ))}
            {/* Resources in mobile menu */}
            <div className="border-b border-gray-100 pb-2">
              <p className="py-2 text-gray-500 text-sm font-medium">Resources</p>
              <div className="pl-3 space-y-1">
                <Link href="/blog" className="block py-1.5 text-sm text-gray-600 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                <Link href="/faq" className="block py-1.5 text-sm text-gray-600 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
                <Link href="/contact" className="block py-1.5 text-sm text-gray-600 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
                <Link href="/warranty" className="block py-1.5 text-sm text-gray-600 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>Warranty</Link>
              </div>
            </div>
            <div className="pt-2 space-y-2">
              {user ? (
                <>
                  <Link href={user.role === 'ADMIN' ? '/admin' : '/account'} className="block py-2 text-gray-700 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>
                    {user.firstName || 'My Account'}
                  </Link>
                  {user.role !== 'ADMIN' && (
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
                  <Link href="/login" className="block py-2 text-gray-700 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link href="/register" className="block py-2 text-gray-700 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>Register</Link>
                </>
              )}
              <Link href="/cart" className="flex items-center gap-2 py-2 text-gray-700 hover:text-[#003d7a]" onClick={() => setMobileMenuOpen(false)}>
                <ShoppingCart className="w-4 h-4" /> Cart {mounted && itemCount > 0 && `(${itemCount})`}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
