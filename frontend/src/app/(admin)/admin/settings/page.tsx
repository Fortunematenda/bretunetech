'use client';

import { useState, useEffect } from 'react';
import { Save, Store, CreditCard, Bell, Shield, Truck, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { adminApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function SettingsPage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  
  // Shipping settings state
  const [shippingSettings, setShippingSettings] = useState({
    standardFee: 150,
    freeShippingThreshold: 1000,
    enableFreeShipping: true,
  });
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingSaved, setShippingSaved] = useState(false);

  // Load shipping settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!token) return;
      try {
        const settings = await adminApi.getShippingSettings(token);
        if (settings) {
          setShippingSettings(settings);
        }
      } catch {
        // Use defaults if API not available
      }
    };
    loadSettings();
  }, [token]);

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
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400">Configure your store and business preferences</p>
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
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
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
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Business Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Business Name</label>
                  <input
                    type="text"
                    defaultValue="Bretune Technologies"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email</label>
                  <input
                    type="email"
                    defaultValue="sales@bretune.co.za"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Phone</label>
                  <input
                    type="tel"
                    defaultValue="+27 61 268 5933"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">VAT Number</label>
                  <input
                    type="text"
                    defaultValue="VAT123456789"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Address</label>
                <textarea
                  defaultValue="123 Main Road, Cape Town, 8001, South Africa"
                  rows={3}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500 text-slate-900 rounded-xl font-medium hover:bg-cyan-400 transition-colors">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Payment Methods</h2>
              
              <div className="space-y-3">
                {['EFT/Bank Transfer', 'PayFast', 'Yoco', 'Cash on Delivery'].map((method) => (
                  <div
                    key={method}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{method}</p>
                      <p className="text-xs text-slate-400">
                        {method === 'EFT/Bank Transfer' ? 'Active' : 'Configure in dashboard'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${method === 'EFT/Bank Transfer' ? 'bg-green-500' : 'bg-slate-600'}`} />
                      <span className="text-xs text-slate-400">
                        {method === 'EFT/Bank Transfer' ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
              
              <div className="space-y-3">
                {[
                  { label: 'New order received', checked: true },
                  { label: 'Low stock alert', checked: true },
                  { label: 'New service booking', checked: true },
                  { label: 'Payment received', checked: true },
                  { label: 'Customer message', checked: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-300">{item.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Shipping Configuration</h2>
                {shippingSaved && (
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">Saved!</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Standard Shipping Fee
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R</span>
                    <input
                      type="number"
                      value={shippingSettings.standardFee}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, standardFee: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Default shipping fee for orders</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Free Shipping Threshold
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R</span>
                    <input
                      type="number"
                      value={shippingSettings.freeShippingThreshold}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Orders over this amount get free shipping</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="enableFreeShipping"
                  checked={shippingSettings.enableFreeShipping}
                  onChange={(e) => setShippingSettings({ ...shippingSettings, enableFreeShipping: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="enableFreeShipping" className="text-sm text-slate-300">
                  Enable Free Shipping
                </label>
              </div>

              {/* Preview */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Preview</h3>
                <p className="text-sm text-slate-300">
                  Standard shipping: <span className="text-white font-medium">{formatPrice(shippingSettings.standardFee)}</span>
                </p>
                <p className="text-sm text-slate-300 mt-1">
                  Free shipping on orders over: <span className="text-emerald-400 font-medium">{formatPrice(shippingSettings.freeShippingThreshold)}</span>
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleSaveShipping}
                  disabled={shippingLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500 text-slate-900 rounded-xl font-medium hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

          {activeTab === 'security' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
              <p className="text-slate-400">This section is coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
