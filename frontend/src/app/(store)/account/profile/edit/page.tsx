'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, User, Mail, Phone, Calendar, Camera, Save, X,
  MapPin, Shield, Lock, ChevronRight,
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
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between md:hidden">
        <button onClick={handleCancel} className="w-9 h-9 flex items-center justify-center">
          <X className="w-5 h-5 text-slate-900" />
        </button>

        <h1 className="text-base font-bold text-slate-900">Edit Profile</h1>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="text-sm font-bold text-blue-600 disabled:text-gray-400"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Photo Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl">
                {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 border-4 border-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-slate-900">Profile Photo</h2>
              <p className="text-sm text-slate-500 mt-1">JPG, PNG or GIF. Max 5MB</p>
              <button className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700">
                Upload New Photo
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-blue-600" />
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:outline-none transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-gray-400" />
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
                  className="w-32"
                />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:outline-none transition-colors"
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
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-slate-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Link
            href="/account/change-password"
            className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Change Password</p>
              <p className="text-xs text-slate-500">Update your account password</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>

          <Link
            href="/account/addresses"
            className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Manage Addresses</p>
              <p className="text-xs text-slate-500">Update your delivery addresses</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
