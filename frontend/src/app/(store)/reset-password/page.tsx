'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { authApi } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is missing a token. Please request a new one.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setSuccess(true);
      setTimeout(() => router.push('/'), 2500);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
        <p className="text-sm text-slate-600 mb-4">
          This reset link is invalid. Please request a new password reset email.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-[#003d7a] text-white font-semibold hover:bg-[#002a55]"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Password updated</h2>
        <p className="text-sm text-slate-500 mb-4">
          You can now sign in with your new password. Redirecting…
        </p>
        <Link href="/" className="text-sm font-semibold text-[#003d7a] hover:underline">
          Go to homepage
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">New password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            placeholder="At least 8 characters"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003d7a] focus:outline-none pl-12 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Confirm password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={8}
          required
          placeholder="Re-enter new password"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003d7a] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 px-4 py-3 rounded-xl bg-[#003d7a] text-white font-semibold hover:bg-[#002a55] transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating…
          </>
        ) : (
          'Update password'
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#003d7a] text-white flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set a new password</h1>
          <p className="text-slate-500 mt-2">Choose a strong password for your BretuneTech account.</p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#003d7a]" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <div className="text-center mt-6">
          <Link href="/forgot-password" className="inline-flex items-center gap-2 text-sm font-semibold text-[#003d7a] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Request a new reset link
          </Link>
        </div>
      </div>
    </div>
  );
}
