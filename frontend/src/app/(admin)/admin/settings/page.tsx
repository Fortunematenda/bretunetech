'use client';

import { useState, useEffect } from 'react';
import { Save, Store, CreditCard, Bell, Shield, Truck, Loader2, Construction, CheckCircle, Circle, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { adminApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function SettingsPage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  
  // Business settings state
  const [businessSettings, setBusinessSettings] = useState({
    name: 'Bretune Technologies',
    legalName: 'Bretune Technologies (Pty) Ltd',
    registrationNumber: '2025/545182/07',
    taxNumber: '9276141273',
    email: 'sales@bretune.co.za',
    phone: '+27 61 268 5933',
    address: '123 Main Road, Cape Town, 8001, South Africa',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    branchCode: '',
    accountType: 'Current',
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
  });
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessSaved, setBusinessSaved] = useState(false);
  
  // Shipping settings state
  const [shippingSettings, setShippingSettings] = useState({
    standardFee: 99,
    freeShippingThreshold: 1500,
    enableFreeShipping: true,
  });
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingSaved, setShippingSaved] = useState(false);

  // Load shipping settings
  useEffect(() => {
    const loadSettings = async () => {
      const currentToken = useAuthStore.getState().token;
      if (!currentToken) return;
      try {
        const settings = await adminApi.getShippingSettings(currentToken);
        if (settings) {
          setShippingSettings(settings);
        }
      } catch {
        // Use defaults if API not available
      }
    };
    loadSettings();
  }, []);

  const handleSaveBusiness = async () => {
    if (!token) return;
    setBusinessLoading(true);
    setBusinessSaved(false);
    try {
      // Save to backend
      await adminApi.updateBusinessSettings(token, businessSettings);
      // Also save to localStorage as fallback
      localStorage.setItem('bretunetech-business-settings', JSON.stringify(businessSettings));
      setBusinessSaved(true);
      setTimeout(() => setBusinessSaved(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to save settings');
    } finally {
      setBusinessLoading(false);
    }
  };

  // Load business settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const currentToken = useAuthStore.getState().token;
      if (currentToken) {
        try {
          const settings = await adminApi.getBusinessSettings(currentToken);
          if (settings) {
            setBusinessSettings({
              name: settings.name || 'Bretune Technologies',
              legalName: settings.legalName || 'Bretune Technologies (Pty) Ltd',
              registrationNumber: settings.registrationNumber || '',
              taxNumber: settings.taxNumber || '',
              email: settings.email || 'sales@bretune.co.za',
              phone: settings.phone || '+27 61 268 5933',
              address: settings.address || '',
              bankName: settings.bankName || '',
              accountNumber: settings.accountNumber || '',
              accountHolder: settings.accountHolder || '',
              branchCode: settings.branchCode || '',
              accountType: settings.accountType || 'Current',
              maintenanceMode: settings.maintenanceMode || false,
              maintenanceMessage: settings.maintenanceMessage || 'We are currently performing maintenance. Please check back soon.',
            });
          }
        } catch {
          // Fallback to localStorage if API fails
          const saved = localStorage.getItem('bretunetech-business-settings');
          if (saved) {
            try {
              setBusinessSettings(JSON.parse(saved));
            } catch {}
          }
        }
      } else {
        // No token, use localStorage
        const saved = localStorage.getItem('bretunetech-business-settings');
        if (saved) {
          try {
            setBusinessSettings(JSON.parse(saved));
          } catch {}
        }
      }
    };
    
    loadSettings();
  }, []);

  const handleSaveShipping = async () => {
    if (!token) return;
    setShippingLoading(true);
    setShippingSaved(false);
    try {
      await adminApi.updateShippingSettings(token, shippingSettings);
      setShippingSaved(true);
      setTimeout(() => setShippingSaved(false), 3000);
    } catch {
      // Error handled
    } finally {
      setShippingLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'system', label: 'System', icon: Construction },
    { id: 'gateway-readiness', label: 'Gateway Readiness', icon: CheckCircle },
    { id: 'tracking', label: 'Tracking Pixels', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Configure your store and business preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/60 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="rounded-2xl border border-gray-200 bg-white/50 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
                {businessSaved && (
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Saved!</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Business Name</label>
                  <input
                    type="text"
                    value={businessSettings.name}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={businessSettings.email}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={businessSettings.phone}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Legal Name</label>
                  <input
                    type="text"
                    value={businessSettings.legalName}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, legalName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Registration Number</label>
                  <input
                    type="text"
                    value={businessSettings.registrationNumber}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tax Number</label>
                  <input
                    type="text"
                    value={businessSettings.taxNumber}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, taxNumber: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={businessSettings.address}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Bank Details (for EFT payments)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bank Name</label>
                    <input
                      type="text"
                      value={businessSettings.bankName}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, bankName: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                      placeholder="Bank name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Account Type</label>
                    <select
                      value={businessSettings.accountType}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, accountType: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Current">Current</option>
                      <option value="Savings">Savings</option>
                      <option value="Gold Business">Gold Business</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Account Number</label>
                    <input
                      type="text"
                      value={businessSettings.accountNumber}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, accountNumber: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                      placeholder="Account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Branch Code</label>
                    <input
                      type="text"
                      value={businessSettings.branchCode}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, branchCode: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                      placeholder="Branch code"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Account Holder Name</label>
                    <input
                      type="text"
                      value={businessSettings.accountHolder}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, accountHolder: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                      placeholder="Account holder name"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button 
                  onClick={handleSaveBusiness}
                  disabled={businessLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {businessLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="rounded-2xl border border-gray-200 bg-white/50 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
              
              <div className="space-y-3">
                {['EFT/Bank Transfer', 'PayFast', 'Yoco', 'Cash on Delivery'].map((method) => (
                  <div
                    key={method}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{method}</p>
                      <p className="text-xs text-gray-500">
                        {method === 'EFT/Bank Transfer' ? 'Active' : 'Configure in dashboard'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${method === 'EFT/Bank Transfer' ? 'bg-green-500' : 'bg-gray-600'}`} />
                      <span className="text-xs text-gray-500">
                        {method === 'EFT/Bank Transfer' ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="rounded-2xl border border-gray-200 bg-white/50 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              
              <div className="space-y-3">
                {[
                  { label: 'New order received', checked: true },
                  { label: 'Low stock alert', checked: true },
                  { label: 'New service booking', checked: true },
                  { label: 'Payment received', checked: true },
                  { label: 'Customer message', checked: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="w-4 h-4 rounded border-gray-300 bg-gray-100 text-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="rounded-2xl border border-gray-200 bg-white/50 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Shipping Configuration</h2>
                {shippingSaved && (
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Saved!</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Standard Shipping Fee
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                    <input
                      type="number"
                      value={shippingSettings.standardFee}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, standardFee: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Default shipping fee for orders</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Free Shipping Threshold
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                    <input
                      type="number"
                      value={shippingSettings.freeShippingThreshold}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Orders over this amount get free shipping</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/50 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="enableFreeShipping"
                  checked={shippingSettings.enableFreeShipping}
                  onChange={(e) => setShippingSettings({ ...shippingSettings, enableFreeShipping: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 bg-gray-100 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="enableFreeShipping" className="text-sm text-gray-700">
                  Enable Free Shipping
                </label>
              </div>

              {/* Preview */}
              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Preview</h3>
                <p className="text-sm text-gray-700">
                  Standard shipping: <span className="text-gray-900 font-medium">{formatPrice(shippingSettings.standardFee)}</span>
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Free shipping on orders over: <span className="text-emerald-600 font-medium">{formatPrice(shippingSettings.freeShippingThreshold)}</span>
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveShipping}
                  disabled={shippingLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {shippingLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Settings</>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'gateway-readiness' && (
            <div className="rounded-2xl border border-gray-200 bg-white/50 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Payment Gateway Readiness Checklist</h2>
                <div className="text-xs text-gray-500">Track compliance for payment provider approval</div>
              </div>

              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                <p className="text-sm text-cyan-200">
                  ℹ️ This checklist helps identify compliance gaps for payment gateway providers like PayFast, Paystack, Yoco, and Ozow.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'policies', label: 'Policies Completed', completed: true },
                  { id: 'company-info', label: 'Company Information Completed', completed: true },
                  { id: 'contact-info', label: 'Contact Information Completed', completed: true },
                  { id: 'delivery-info', label: 'Delivery Information Added', completed: true },
                  { id: 'returns-policy', label: 'Returns Policy Added', completed: true },
                  { id: 'warranty-policy', label: 'Warranty Policy Added', completed: true },
                  { id: 'trusted-supplier', label: 'Trusted Supplier Page Added', completed: true },
                  { id: 'social-links', label: 'Social Links Added', completed: false },
                  { id: 'product-delivery', label: 'Product Delivery Status Added', completed: true },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-4 bg-white/50 rounded-xl border border-gray-200"
                  >
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500" />
                    )}
                    <span className={`text-sm font-medium ${item.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-emerald-600">8/9</span> items completed
                  </div>
                  <button
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-medium rounded-xl transition-colors"
                  >
                    Update Checklist
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="rounded-2xl border border-gray-200 bg-white/50 p-12 text-center">
              <p className="text-gray-500">This section is coming soon</p>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="rounded-2xl border border-gray-200 bg-white/50 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Analytics & Tracking Pixels</h2>
                <p className="text-sm text-gray-500 mt-1">Add third-party analytics and marketing pixels to your storefront.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Google Analytics Measurement ID</label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                    onChange={(e) => {
                      localStorage.setItem('bt_ga_id', e.target.value);
                    }}
                    defaultValue={typeof window !== 'undefined' ? localStorage.getItem('bt_ga_id') || '' : ''}
                  />
                  <p className="text-xs text-gray-500">Your Google Analytics 4 measurement ID</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Facebook Pixel ID</label>
                  <input
                    type="text"
                    placeholder="123456789012345"
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                    onChange={(e) => {
                      localStorage.setItem('bt_fb_pixel', e.target.value);
                    }}
                    defaultValue={typeof window !== 'undefined' ? localStorage.getItem('bt_fb_pixel') || '' : ''}
                  />
                  <p className="text-xs text-gray-500">Your Facebook/Meta Pixel ID</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">TikTok Pixel ID</label>
                  <input
                    type="text"
                    placeholder="CXXXXXXXXXXXXXXX"
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                    onChange={(e) => {
                      localStorage.setItem('bt_tiktok_pixel', e.target.value);
                    }}
                    defaultValue={typeof window !== 'undefined' ? localStorage.getItem('bt_tiktok_pixel') || '' : ''}
                  />
                  <p className="text-xs text-gray-500">Your TikTok Pixel ID</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  💡 These pixels will be loaded on all store pages. Built-in analytics (page views, product views, visitors) is always active and does not require any configuration.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    alert('Pixel settings saved to local storage. They will be loaded on next page refresh.');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-400 transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Pixel Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="rounded-2xl border border-gray-200 bg-white/50 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Maintenance Mode</h2>
                {businessSaved && (
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Saved!</span>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-200">
                  ⚠️ When maintenance mode is enabled, the store will display a maintenance page to all visitors. Admin users can still access the site.
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/50 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={businessSettings.maintenanceMode}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, maintenanceMode: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 bg-gray-100 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="maintenanceMode" className="text-sm text-gray-700 font-medium">
                  Enable Maintenance Mode
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Maintenance Message</label>
                <textarea
                  value={businessSettings.maintenanceMessage}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, maintenanceMessage: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-cyan-500"
                  placeholder="Enter a message to display to visitors during maintenance"
                />
                <p className="text-xs text-gray-500">This message will be shown on the maintenance page</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveBusiness}
                  disabled={businessLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {businessLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Changes</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
