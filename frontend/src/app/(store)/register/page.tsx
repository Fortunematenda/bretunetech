'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Phone, MapPin } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

const inputClass = 'appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
const labelClass = 'block text-sm font-medium text-gray-700';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [address, setAddress] = useState({
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData((p) => ({ ...p, [field]: e.target.value }));
  const setAddr = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddress((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone.trim() || undefined,
      });

      const authToken = useAuthStore.getState().token;
      if (authToken && address.street.trim()) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ ...address, isDefault: true }),
        });
      }

      router.push('/');
    } catch {
      // Error is handled by auth store
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">Join Bretunetech for exclusive deals and faster checkout</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {(error || validationError) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error || validationError}
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className={labelClass}>First Name</label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input id="firstName" type="text" required className={inputClass} placeholder="John"
                  value={formData.firstName} onChange={set('firstName')} />
              </div>
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>Last Name</label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input id="lastName" type="text" required className={inputClass} placeholder="Doe"
                  value={formData.lastName} onChange={set('lastName')} />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClass}>Email Address</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input id="email" type="email" required className={inputClass} placeholder="john@example.com"
                value={formData.email} onChange={set('email')} />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className={labelClass}>Phone Number <span className="text-gray-400 font-normal">(Optional)</span></label>
            <div className="mt-1 relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input id="phone" type="tel" className={inputClass} placeholder="+27 82 123 4567"
                value={formData.phone} onChange={set('phone')} />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input id="password" type={showPassword ? 'text' : 'password'} required
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••" value={formData.password} onChange={set('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input id="confirmPassword" type={showPassword ? 'text' : 'password'} required
                  className={inputClass} placeholder="••••••••"
                  value={formData.confirmPassword} onChange={set('confirmPassword')} />
              </div>
            </div>
          </div>

          {/* Address section */}
          <div className="border-t pt-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-800">Delivery Address <span className="text-gray-400 font-normal">(Optional — saves time at checkout)</span></h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Street Address</label>
                <div className="mt-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" className={inputClass} placeholder="123 Main Street"
                    value={address.street} onChange={setAddr('street')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Cape Town" value={address.city} onChange={setAddr('city')} />
                </div>
                <div>
                  <label className={labelClass}>Province</label>
                  <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    value={address.province} onChange={setAddr('province')}>
                    <option value="">Select province</option>
                    {['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Postal Code</label>
                  <input type="text" className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="8001" value={address.postalCode} onChange={setAddr('postalCode')} />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input type="text" className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={address.country} onChange={setAddr('country')} />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
