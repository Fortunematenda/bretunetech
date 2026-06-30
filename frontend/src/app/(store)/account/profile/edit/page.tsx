'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, User, Mail, Phone, Camera, Save, X,
  MapPin, Shield, Lock, ChevronRight, Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import CountryCodeSelector from '@/components/CountryCodeSelector';

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, token, updateProfile, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [countryCode, setCountryCode] = useState('+27');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

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
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: phoneWithoutCode,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setSuccess(false);
    
    try {
      const fullPhone = `${countryCode}${formData.phone}`;
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: fullPhone,
      });
      
      await fetchProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      alert(error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      {/* Mobile Layout */}
      <main className="md:hidden min-h-screen bg-slate-50 pb-28">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 h-14 px-4 flex items-center justify-between">
          <Link href="/account/profile" className="w-9 h-9 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-900" />
          </Link>

          <h1 className="text-base font-bold text-slate-900">Edit Profile</h1>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="text-sm font-bold text-[#003d7a] disabled:text-gray-400"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </header>

        <div className="px-4 pt-4 space-y-4 max-w-xl mx-auto">
          {/* Profile Photo Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-[#003d7a] text-white flex items-center justify-center font-bold text-xl">
                  {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#003d7a] border-4 border-white rounded-full flex items-center justify-center hover:bg-[#002a55] transition-colors">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              
              <div>
                <h2 className="text-base font-bold text-slate-900">Profile Photo</h2>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG or GIF. Max 5MB</p>
                <button className="mt-2 text-xs font-semibold text-[#003d7a]">
                  Upload New Photo
                </button>
              </div>
            </div>
          </div>

          {/* Personal Information Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-[#003d7a]" />
              <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#003d7a] focus:outline-none transition-colors text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#003d7a] focus:outline-none transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-2">Email Address</label>
                <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-lg">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{user?.email || ''}</span>
                  <span className="text-xs text-slate-400 ml-auto">Cannot be changed</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <CountryCodeSelector
                    value={countryCode}
                    onChange={setCountryCode}
                    className="w-28"
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 focus:border-[#003d7a] focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>
            </div>

            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700">Profile updated successfully!</span>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#003d7a] text-white font-semibold hover:bg-[#002a55] transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <Link
              href="/account/change-password"
              className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#e6f0ff] flex items-center justify-center">
                <Lock className="w-4 h-4 text-[#003d7a]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Change Password</p>
                <p className="text-xs text-slate-500">Update your account password</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/account/addresses"
              className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#e6f0ff] flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#003d7a]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Manage Addresses</p>
                <p className="text-xs text-slate-500">Update your delivery addresses</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </main>

      {/* Desktop Layout */}
      <main className="hidden md:block min-h-screen bg-slate-50">
        <section className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
              <p className="text-slate-500 mt-2">Update your personal information</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Profile Photo Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-[#003d7a] text-white flex items-center justify-center font-bold text-3xl">
                      {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-9 h-9 bg-[#003d7a] border-4 border-white rounded-full flex items-center justify-center hover:bg-[#002a55] transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Profile Photo</h2>
                    <p className="text-sm text-slate-500 mt-1">JPG, PNG or GIF. Max 5MB</p>
                    <button className="mt-3 text-sm font-semibold text-[#003d7a]">
                      Upload New Photo
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information Form */}
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <User className="w-5 h-5 text-[#003d7a]" />
                  <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003d7a] focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003d7a] focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-600">{user?.email || ''}</span>
                      <span className="text-xs text-slate-400 ml-auto">Cannot be changed</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Phone Number</label>
                    <div className="flex gap-2">
                      <CountryCodeSelector
                        value={countryCode}
                        onChange={setCountryCode}
                        className="w-36"
                      />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003d7a] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {success && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">Profile updated successfully!</span>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#003d7a] text-white font-semibold hover:bg-[#002a55] transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
              <Link
                href="/account/change-password"
                className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#e6f0ff] flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#003d7a]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">Change Password</p>
                  <p className="text-xs text-slate-500">Update your account password</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>

              <Link
                href="/account/addresses"
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#e6f0ff] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#003d7a]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">Manage Addresses</p>
                  <p className="text-xs text-slate-500">Update your delivery addresses</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
