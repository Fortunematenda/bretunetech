'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Mail, CheckCircle, Loader2, Lock,
} from 'lucide-react';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setSuccess(false);
    setError('');
    setMessage('');

    try {
      const result = await authApi.forgotPassword(email.trim().toLowerCase());
      setMessage(result?.message || 'If an account exists for that email, we have sent password reset instructions.');
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#003d7a] text-white flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Forgot Password?</h1>
          <p className="text-slate-500 mt-2">
            {success
              ? 'Check your email for reset instructions'
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003d7a] focus:outline-none transition-colors pl-12"
                    required
                    autoComplete="email"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-3 rounded-xl bg-[#003d7a] text-white font-semibold hover:bg-[#002a55] transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Check your email</h2>
            <p className="text-sm text-slate-500 mb-2">
              {message}
            </p>
            <p className="text-sm text-slate-500 mb-2">
              If you have an account for <span className="font-semibold text-slate-700">{email}</span>,
              open the link in that email within 1 hour.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Also check your <span className="font-semibold">Spam / Junk</span> folder.
              Use the same email address you sign in with.
            </p>
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setEmail('');
                setMessage('');
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Send Another Email
            </button>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#003d7a] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
