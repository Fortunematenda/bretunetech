'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Package, MapPin, LogOut, ChevronRight, ChevronLeft, Clock, Truck, 
  CheckCircle, XCircle, CreditCard, MessageCircle, Loader2, Shield, 
  Mail, Phone, Edit3, Save, AlertCircle, ShoppingBag, Heart, 
  Settings, Bell
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';
import { addressesApi, ordersApi } from '@/lib/api';
import { getOrders, Order } from '@/lib/orders-api';

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
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    province: '',
    postalCode: '',
  });
  const [savingAddress, setSavingAddress] = useState(false);

  const handleAddAddress = async () => {
    if (!addressData.street || !addressData.city || !addressData.province || !addressData.postalCode) {
      return;
    }
    if (!token) return;
    setSavingAddress(true);
    try {
      // Call API to save address
      await addressesApi.create(token, {
        street: addressData.street,
        city: addressData.city,
        province: addressData.province,
        postalCode: addressData.postalCode,
        country: 'South Africa',
      });
      setShowAddressForm(false);
      setAddressData({ street: '', city: '', province: '', postalCode: '' });
      // Refresh user data to get new address
      await fetchProfile();
    } catch (err: any) {
      console.error('Failed to save address:', err);
      alert(err?.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileSave = async () => {
    clearError();
    setSaveSuccess(false);
    try {
      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || undefined,
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
            <Link 
              href="/login" 
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Sign In
            </Link>
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

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user.firstName}!</p>
        </div>
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-white border border-gray-200 rounded-xl p-2 space-y-1 shadow-sm">
            {[
              { id: 'orders' as const, label: 'My Orders', icon: Package, count: orders.length },
              { id: 'profile' as const, label: 'Profile', icon: User },
              { id: 'addresses' as const, label: 'Addresses', icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedOrder(null); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </span>
                {'count' in tab && tab.count ? (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tab.count}</span>
                ) : null}
              </button>
            ))}
          </nav>

          {/* Quick Stats */}
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending</span>
              <span className="text-yellow-600 font-medium">{orders.filter(o => o.status === 'PENDING').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Processing</span>
              <span className="text-purple-600 font-medium">{orders.filter(o => o.status === 'PROCESSING').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completed</span>
              <span className="text-green-600 font-medium">{orders.filter(o => o.status === 'COMPLETED').length}</span>
            </div>
          </div>
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
                    <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusColors[order.status]?.split(' ')[0] || 'bg-gray-100'}`}>
                            <StatusIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm font-mono text-gray-900 font-medium">{order.orderNumber}</span>
                            <span className="text-xs text-gray-500 ml-3">{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusColors[order.status] || ''}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                              <img
                                src={item.product?.images?.[0]?.url || '/assets/placeholder.svg'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.svg'; }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{item.name} x{item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-sm text-gray-500">+{order.items.length - 3} more</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">{formatPrice(order.totalPrice)}</span>
                        <div className="flex items-center gap-3">
                          {order.status !== 'CANCELLED' && (
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(`http://localhost:4000/api/orders/${order.id}/invoice`, {
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                    },
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
                              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              Download Invoice
                            </button>
                          )}
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            View Details <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}


          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm"
                >
                  {isEditingProfile ? (
                    <><XCircle className="w-4 h-4" /> Cancel</>
                  ) : (
                    <><Edit3 className="w-4 h-4" /> Edit Profile</>
                  )}
                </button>
              </div>

              {/* Status Messages */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              {saveSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <p className="text-emerald-600 text-sm">Profile updated successfully!</p>
                </div>
              )}
              
              {/* Profile Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                    {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'N'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-gray-500">Customer since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" /> First Name
                    </label>
                    {isEditingProfile ? (
                      <input 
                        type="text" 
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">{user.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" /> Last Name
                    </label>
                    {isEditingProfile ? (
                      <input 
                        type="text" 
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">{user.lastName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Address
                    </label>
                    <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 flex items-center gap-2">
                      {user.email}
                      <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Verified</span>
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Phone Number
                    </label>
                    {isEditingProfile ? (
                      <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+27 82 123 4567"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                        {user.phone || <span className="text-gray-500 italic">Not provided</span>}
                      </p>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                {isEditingProfile && (
                  <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                    <button 
                      onClick={() => setIsEditingProfile(false)}
                      className="px-6 py-2.5 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleProfileSave}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm"
                    >
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="w-4 h-4" /> Save Changes</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Address Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" /> Primary Address
                  </h3>
                  <Link 
                    href="/account?tab=addresses" 
                    onClick={() => setActiveTab('addresses')}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Manage <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                
                {user.addresses && user.addresses.length > 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-gray-900 font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-gray-600 text-sm mt-1">{user.addresses[0].street}</p>
                    <p className="text-gray-600 text-sm">{user.addresses[0].city}, {user.addresses[0].province} {user.addresses[0].postalCode}</p>
                    {user.phone && (
                      <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {user.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No address saved</p>
                    <button 
                      onClick={() => setActiveTab('addresses')}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Add an address
                    </button>
                  </div>
                )}
              </div>

              {/* Security Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Account Security</h3>
                      <p className="text-sm text-gray-500 mt-1">Your account is protected with secure authentication.</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
                <button 
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm"
                >
                  <MapPin className="w-4 h-4" /> Add New Address
                </button>
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Add New Address</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-gray-600 mb-1 block">Street Address</label>
                      <input 
                        type="text" 
                        value={addressData.street}
                        onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                        placeholder="123 Main Street, Apartment 4B"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">City</label>
                      <input 
                        type="text" 
                        value={addressData.city}
                        onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                        placeholder="Cape Town"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Province</label>
                      <select 
                        value={addressData.province}
                        onChange={(e) => setAddressData({ ...addressData, province: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select Province</option>
                        <option value="Eastern Cape">Eastern Cape</option>
                        <option value="Free State">Free State</option>
                        <option value="Gauteng">Gauteng</option>
                        <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                        <option value="Limpopo">Limpopo</option>
                        <option value="Mpumalanga">Mpumalanga</option>
                        <option value="Northern Cape">Northern Cape</option>
                        <option value="North West">North West</option>
                        <option value="Western Cape">Western Cape</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Postal Code</label>
                      <input 
                        type="text" 
                        value={addressData.postalCode}
                        onChange={(e) => setAddressData({ ...addressData, postalCode: e.target.value })}
                        placeholder="8001"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button 
                      onClick={() => setShowAddressForm(false)}
                      className="px-6 py-2.5 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddAddress}
                      disabled={savingAddress || !addressData.street || !addressData.city || !addressData.province || !addressData.postalCode}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm"
                    >
                      {savingAddress ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="w-4 h-4" /> Save Address</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Current Address from User */}
              {user.addresses && user.addresses.length > 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Primary Address</h3>
                      <p className="text-gray-900 font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-gray-600 text-sm mt-1">{user.addresses[0].street}</p>
                      <p className="text-gray-600 text-sm">{user.addresses[0].city}, {user.addresses[0].province} {user.addresses[0].postalCode}</p>
                      {user.phone && (
                        <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {user.phone}
                        </p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-blue-100 border border-blue-200 text-blue-700 text-xs font-medium rounded-full">
                      Default
                    </span>
                  </div>
                </div>
              ) : (
                /* Empty State */
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved addresses</h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">Save your delivery addresses for faster checkout. You can add multiple addresses.</p>
                  <button 
                    onClick={() => setShowAddressForm(true)}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-xl transition-colors"
                  >
                    Add Your First Address
                  </button>
                </div>
              )}

              {/* Info Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Quick Checkout</h4>
                    <p className="text-sm text-gray-500">Saved addresses will appear at checkout for faster order placement.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
