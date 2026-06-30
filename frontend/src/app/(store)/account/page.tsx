'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SignInButton from '@/components/ui/SignInButton';
import { useRouter } from 'next/navigation';
import {
  User, Package, MapPin, LogOut, ChevronRight, ChevronLeft, Clock, Truck,
  CheckCircle, XCircle, CreditCard, MessageCircle, Loader2, Shield,
  Mail, Phone, Edit3, Save, AlertCircle, ShoppingBag, Heart,
  Settings, Bell, RotateCcw, ArrowLeft, Sun, Globe, DollarSign, HelpCircle, Headphones, Info, Lock as LockIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';
import { addressesApi, ordersApi, returnsApi } from '@/lib/api';
import { getOrders, Order } from '@/lib/orders-api';
import CountryCodeSelector from '@/components/CountryCodeSelector';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PAID: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PROCESSING: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SHIPPED: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  PROCESSING: Package,
  SHIPPED: Truck,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
};

export default function AccountPage() {
  const router = useRouter();
  const { user, token, logout, updateProfile, fetchProfile, isLoading, isInitialized, error, clearError } = useAuthStore();
  
  // Initialize active tab from localStorage or default to 'orders'
  const [activeTab, setActiveTab] = useState<'orders' | 'returns' | 'profile' | 'addresses'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('account-active-tab');
      return (saved as any) || 'orders';
    }
    return 'orders';
  });

  // Save active tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('account-active-tab', activeTab);
  }, [activeTab]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returns, setReturns] = useState<any[]>([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [countryCode, setCountryCode] = useState('+27');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      // Extract country code from existing phone if present
      let phoneWithoutCode = user.phone || '';
      let detectedCode = '+27';
      
      if (user.phone) {
        const codes = ['+27', '+263', '+260', '+267', '+264', '+258', '+266', '+268', '+44', '+1', '+91', '+86', '+971', '+61', '+49'];
        for (const code of codes) {
          if (user.phone.startsWith(code)) {
            detectedCode = code;
            phoneWithoutCode = user.phone.substring(code.length);
            break;
          }
        }
      }
      
      setCountryCode(detectedCode);
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: phoneWithoutCode,
      });
    }
  }, [user]);

  // Fetch addresses from database
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) return;
      setAddressesLoading(true);
      try {
        const data = await addressesApi.list(token);
        setAddresses(data);
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      } finally {
        setAddressesLoading(false);
      }
    };
    fetchAddresses();
  }, [token]);

  const handleProfileSave = async () => {
    clearError();
    setSaveSuccess(false);
    try {
      const fullPhone = profileData.phone.trim() ? `${countryCode}${profileData.phone.trim()}` : undefined;
      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: fullPhone,
      });
      setSaveSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // Error handled by store
    }
  };

  // Fetch profile on mount
  useEffect(() => {
    if (token && !user) {
      fetchProfile();
    }
  }, [token, user, fetchProfile]);

  // Fetch orders on mount
  useEffect(() => {
    if (token) {
      setOrdersLoading(true);
      getOrders(token)
        .then(data => {
          setOrders(data);
          setOrdersLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch orders:', err);
          setOrdersLoading(false);
        });
    }
  }, [token]);

  // Fetch returns on mount (for sidebar count)
  useEffect(() => {
    if (token) {
      setReturnsLoading(true);
      returnsApi.list(token)
        .then(data => {
          setReturns(data);
          setReturnsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch returns:', err);
          setReturnsLoading(false);
        });
    }
  }, [token]);

  // Show loading while auth state rehydrates
  if (!isInitialized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-500 text-sm">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
          <p className="text-gray-500 max-w-sm">Access your orders, manage your profile, and more.</p>
          <div className="flex gap-3 justify-center pt-2">
            <SignInButton
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Sign In
            </SignInButton>
            <Link 
              href="/register" 
              className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'orders' as const, label: 'Orders', icon: Package, count: orders.length },
    { id: 'returns' as const, label: 'Returns', icon: RotateCcw, count: returns.length },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Mobile Layout - Account Hub */}
      <div className="sm:hidden min-h-screen bg-gray-50 pb-28">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Account</h1>
          </div>
          <div className="w-5" />
        </div>

        <div className="max-w-2xl mx-auto px-4 pt-5">
          {/* Profile Summary Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 mb-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl shrink-0">
                {user.firstName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{user.firstName} {user.lastName}</h2>
                <p className="text-sm text-blue-100 truncate">{user.email}</p>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                <CheckCircle className="w-3 h-3 text-white" />
                <span className="text-xs text-white font-medium">Verified</span>
              </div>
            </div>
            <Link 
              href="/account/profile"
              className="flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium text-sm transition-colors"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </Link>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
                  <Package className="w-5 h-5 text-[#003d7a]" />
                </div>
                <p className="text-lg font-bold text-gray-900">{orders.length}</p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <p className="text-lg font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500">Wishlist</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-lg font-bold text-gray-900">{addresses.length}</p>
                <p className="text-xs text-gray-500">Addresses</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mx-auto mb-2">
                  <RotateCcw className="w-5 h-5 text-violet-600" />
                </div>
                <p className="text-lg font-bold text-gray-900">{returns.length}</p>
                <p className="text-xs text-gray-500">Returns</p>
              </div>
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-2.5 px-1">Account Settings</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Link href="/account/profile" className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <User className="w-[18px] h-[18px] text-[#003d7a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Account Information</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">Update your personal details</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
              <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Package className="w-[18px] h-[18px] text-[#003d7a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">My Orders</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">View your order history</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
              <Link href="/account/returns" className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-[18px] h-[18px] text-[#003d7a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">My Returns</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">Track return requests</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
              <Link href="/account/addresses" className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-[18px] h-[18px] text-[#003d7a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Address Book</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">Manage your delivery addresses</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
              <Link href="/account/payment-methods" className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <CreditCard className="w-[18px] h-[18px] text-[#003d7a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Payment Methods</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">Manage saved cards & wallets</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Shopping Section */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-2.5 px-1">Shopping</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                  <Heart className="w-[18px] h-[18px] text-pink-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Wishlist</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">View saved items</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
              <Link href="/bundles" className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Package className="w-[18px] h-[18px] text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Bundles</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">View product bundles</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
              <Link href="/cart" className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-[18px] h-[18px] text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Cart</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">View your cart</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-2.5 px-1">Preferences</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Sun className="w-[18px] h-[18px] text-[#003d7a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Theme</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">Light, Dark or System</p>
                </div>
                <span className="text-xs font-semibold text-[#003d7a] bg-blue-50 px-2.5 py-1 rounded-lg shrink-0">Light</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Globe className="w-[18px] h-[18px] text-[#003d7a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Language</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">Choose your language</p>
                </div>
                <span className="text-xs font-semibold text-[#003d7a] bg-blue-50 px-2.5 py-1 rounded-lg shrink-0">English</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <DollarSign className="w-[18px] h-[18px] text-[#003d7a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Currency</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">Select your preferred currency</p>
                </div>
                <span className="text-xs font-semibold text-[#003d7a] bg-blue-50 px-2.5 py-1 rounded-lg shrink-0">ZAR</span>
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-2.5 px-1">Support</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Link href="/faq" className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-[18px] h-[18px] text-[#003d7a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Help Center</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">FAQs, guides & support</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
              <Link href="/contact" className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Headphones className="w-[18px] h-[18px] text-[#003d7a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Contact Us</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">Chat, email or call us</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
              <button className="w-full flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Info className="w-[18px] h-[18px] text-[#003d7a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">About BretuneTech</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">App version, terms & info</p>
                </div>
                <span className="text-xs font-semibold text-[#003d7a] bg-blue-50 px-2.5 py-1 rounded-lg shrink-0">v1.0.0</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-gray-100 shadow-sm rounded-2xl text-red-600 font-semibold text-sm active:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>

      {/* Desktop Layout - Orders/Returns */}
      <div className="hidden sm:block w-full min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-5">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <Link href="/account/profile" className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {user.firstName?.charAt(0) || 'U'}
            </Link>
            <Link href="/account/profile" className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">{user.firstName} {user.lastName}</h1>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </Link>
            <Link href="/account/settings" aria-label="Settings" className="shrink-0 w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#003d7a] hover:border-[#003d7a]/30 transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
          </div>

          {/* Tab bar — horizontal scroll on mobile */}
          <div className="max-w-6xl mx-auto mt-4 -mb-px flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedOrder(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {'count' in tab && tab.count ? (
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{tab.count}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid lg:grid-cols-4 gap-6">

          {/* Sidebar — desktop only */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            {/* Quick Stats */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Summary</p>
              {[
                { label: 'Pending', count: orders.filter(o => o.status === 'PENDING').length, color: 'text-yellow-600' },
                { label: 'Processing', count: orders.filter(o => o.status === 'PROCESSING').length, color: 'text-purple-600' },
                { label: 'Completed', count: orders.filter(o => o.status === 'COMPLETED').length, color: 'text-green-600' },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-sm">
                  <span className="text-gray-600">{s.label}</span>
                  <span className={`font-semibold ${s.color}`}>{s.count}</span>
                </div>
              ))}
            </div>

            {/* Sign Out */}
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl text-sm font-medium transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && !selectedOrder && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">Start shopping to see your orders here!</p>
                    <Link href="/products" className="text-blue-600 hover:text-blue-700 text-sm">Browse Products</Link>
                  </div>
                ) : (
                  orders.map((order) => {
                    const StatusIcon = statusIcons[order.status] || Package;
                    return (
                      <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors shadow-sm">
                        {/* Top row: status icon + order number + badge */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${statusColors[order.status]?.split(' ')[0] || 'bg-gray-100'}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-mono text-gray-900 font-semibold">{order.orderNumber}</span>
                              <span className="text-[11px] text-gray-400 ml-2">{formatDate(order.createdAt)}</span>
                            </div>
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase ${statusColors[order.status] || ''}`}>
                            {order.status}
                          </span>
                        </div>
                        {/* Item thumbnails only */}
                        <div className="flex items-center gap-2 mb-3">
                          {order.items.slice(0, 4).map((item, i) => (
                            <div key={i} className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                              <img
                                src={item.product?.images?.[0]?.url || '/assets/placeholder.svg'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.svg'; }}
                              />
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <span className="text-xs text-gray-400">+{order.items.length - 4}</span>
                          )}
                          <span className="text-xs text-gray-500 ml-1">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        </div>
                        {/* Bottom row: price + actions */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-base font-bold text-gray-900">{formatPrice(order.totalPrice)}</span>
                          <div className="flex items-center gap-3">
                            {order.status !== 'CANCELLED' && (
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`http://localhost:4000/api/orders/${order.id}/invoice`, {
                                      headers: { 'Authorization': `Bearer ${token}` },
                                    });
                                    if (response.ok) {
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `INV-${order.orderNumber}.pdf`;
                                      document.body.appendChild(a);
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                      document.body.removeChild(a);
                                    }
                                  } catch (err) {
                                    console.error('Failed to download invoice:', err);
                                  }
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700"
                              >
                                Invoice
                              </button>
                            )}
                            <Link
                              href={`/account/orders/${order.id}`}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                            >
                              View <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">My Returns</h2>
                {returnsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : returns.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                    <RotateCcw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No returns yet</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">You haven't submitted any return requests.</p>
                    <Link href="/account/orders" className="text-blue-600 hover:text-blue-700 text-sm">View Orders</Link>
                  </div>
                ) : (
                  returns.map((ret) => (
                    <Link key={ret.id} href={`/account/returns/${ret.id}`} className="block">
                      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                              <RotateCcw className="w-3.5 h-3.5 text-violet-600" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-mono text-gray-900 font-semibold">{ret.returnNumber}</span>
                              <span className="text-[11px] text-gray-400 ml-2">{formatDate(ret.createdAt)}</span>
                            </div>
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase ${
                            ret.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            ret.status === 'REQUESTED' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            ret.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            {ret.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="text-xs text-gray-500">Order #{ret.order?.orderNumber}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{ret.items?.length || 0} item{ret.items?.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-gray-900">{formatPrice(ret.totalReturnValue)}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
