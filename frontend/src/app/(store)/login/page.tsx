'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ShoppingCart, Zap, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const mode = searchParams.get('mode');
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [isRegister, setIsRegister] = useState(mode === 'register');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      if (isRegister) {
        await register(form);
      } else {
        await login(form.email, form.password);
      }
      router.push(redirectTo === 'checkout' ? '/checkout' : '/');
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Bretunetech</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-8">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            {isRegister ? 'Join us for the best tech deals in Zimbabwe' : 'Sign in to access your account'}
          </p>
          {redirectTo === 'checkout' && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-400">
              <ShoppingCart className="w-4 h-4" /> Complete your order
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 space-y-5 shadow-2xl shadow-black/20">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-400 text-xs">!</span>
              </div>
              {error}
            </div>
          )}

          {isRegister && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 block">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text" required value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    placeholder="John"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 block">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text" required value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'} required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                placeholder="••••••••"
                minLength={6}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 block">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  placeholder="+263 77 123 4567"
                />
              </div>
            </div>
          )}

          <button
            type="submit" disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Please wait...
              </span>
            ) : (
              <>
                {isRegister ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-500">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
              </span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); clearError(); }}
            className="w-full py-3 border border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 text-slate-300 font-medium rounded-xl transition-all"
          >
            {isRegister ? 'Sign In Instead' : 'Create Account'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl">
          <p className="text-xs text-slate-500 text-center">
            Admin access: <span className="text-slate-400">admin@bretunetech.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"><div className="flex items-center gap-3 text-slate-400"><div className="w-5 h-5 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin"></div>Loading...</div></div>}>
      <LoginContent />
    </Suspense>
  );
}
