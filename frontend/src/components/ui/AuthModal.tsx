'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import CountryCodeSelector from '@/components/CountryCodeSelector';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
  redirectTo?: string;
}

type Step = 'form' | 'otp';

export default function AuthModal({ mode, onClose, onSwitchMode, redirectTo }: AuthModalProps) {
  const router = useRouter();
  const { login, register, verifyOtp, isLoading, error, clearError } = useAuthStore();

  const [step, setStep] = useState<Step>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(900); // 15 min in seconds
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countryCode, setCountryCode] = useState('+27');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '' });
  const [localError, setLocalError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    clearError();
    setLocalError('');
    setUnverifiedEmail('');
    setStep('form');
    setOtp(['', '', '', '', '', '']);
    setForm({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '' });
  }, [mode]);

  // Start/restart countdown when OTP step activates
  useEffect(() => {
    if (step === 'otp') {
      setCountdown(900);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [step]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleResendAndVerify = async () => {
    setResending(true);
    setLocalError('');
    clearError();
    try {
      await authApi.resendOtp(unverifiedEmail);
      setPendingEmail(unverifiedEmail);
      setUnverifiedEmail('');
      setStep('otp');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setUnverifiedEmail('');
    clearError();
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        onClose();
        if (redirectTo) router.push(redirectTo);
      } else {
        if (form.password !== form.confirmPassword) {
          setLocalError('Passwords do not match.');
          return;
        }
        if (!acceptTerms) {
          setLocalError('You must accept the terms and conditions.');
          return;
        }
        const fullPhone = form.phone.trim() ? `${countryCode}${form.phone.trim()}` : undefined;
        const result = await register({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: fullPhone,
          acceptedTerms: acceptTerms,
        });
        if (result.requiresVerification) {
          setPendingEmail(result.email);
          setStep('otp');
        }
      }
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('verify your email')) {
        setUnverifiedEmail(form.email);
        clearError();
      }
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) { setLocalError('Enter the full 6-digit code.'); return; }
    setLocalError('');
    clearError();
    try {
      await verifyOtp(pendingEmail, code);
      onClose();
      if (redirectTo) router.push(redirectTo);
    } catch {
      // error shown from store
    }
  };

  const displayError = localError || (unverifiedEmail ? '' : error);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* ── OTP STEP ── */}
          {step === 'otp' ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-[#003d7a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-7 h-7 text-[#003d7a]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
              <p className="text-sm text-gray-500 mb-1">We sent a 6-digit code to</p>
              <p className="text-sm font-semibold text-[#003d7a] mb-4">{pendingEmail}</p>

              {/* Countdown */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 ${
                countdown === 0
                  ? 'bg-red-50 text-red-500 border border-red-200'
                  : countdown <= 60
                  ? 'bg-orange-50 text-orange-500 border border-orange-200'
                  : 'bg-[#003d7a]/8 text-[#003d7a] border border-[#003d7a]/20'
              }`}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: countdown === 0 ? '#ef4444' : countdown <= 60 ? '#f97316' : '#003d7a' }} />
                {countdown === 0
                  ? 'Code expired'
                  : `Code expires in ${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`
                }
              </div>

              <div className="flex items-center justify-center gap-2 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    disabled={countdown === 0}
                    className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none transition-colors ${
                      countdown === 0 ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed' : 'border-gray-300 focus:border-[#003d7a]'
                    }`}
                  />
                ))}
              </div>

              {displayError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{displayError}</p>
              )}

              {countdown > 0 ? (
                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#003d7a] hover:bg-[#002d5a] text-white font-semibold rounded-lg transition-colors disabled:opacity-60 mb-4"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Verify & Continue</>}
                </button>
              ) : (
                <button
                  onClick={() => { setStep('form'); setOtp(['', '', '', '', '', '']); setLocalError(''); clearError(); }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors mb-4"
                >
                  Resend Code
                </button>
              )}

              <p className="text-xs text-gray-400">Didn&apos;t receive the code? Check your spam folder or{' '}
                <button onClick={() => { setStep('form'); setOtp(['', '', '', '', '', '']); }} className="text-[#003d7a] hover:underline">try again</button>.
              </p>
            </div>
          ) : (
            /* ── FORM STEP ── */
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {mode === 'login' ? 'Login' : 'Register'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                          placeholder="First name" required
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#003d7a] focus:ring-1 focus:ring-[#003d7a]/20" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                      <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        placeholder="Last name" required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#003d7a] focus:ring-1 focus:ring-[#003d7a]/20" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Email Address" required
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#003d7a] focus:ring-1 focus:ring-[#003d7a]/20 bg-yellow-50/40" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm text-gray-600">Password</label>
                    {mode === 'login' && (
                      <span className="text-xs text-[#003d7a] cursor-pointer hover:underline">Forgot Password?</span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••" required minLength={mode === 'register' ? 8 : undefined}
                      className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#003d7a] focus:ring-1 focus:ring-[#003d7a]/20 bg-yellow-50/40" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === 'register' && (
                    <p className="text-xs text-gray-400 mt-1">At least 8 characters and 1 special character or number</p>
                  )}
                </div>

                {mode === 'register' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword}
                          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                          placeholder="••••••••" required
                          className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#003d7a] focus:ring-1 focus:ring-[#003d7a]/20 bg-yellow-50/40" />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Phone <span className="text-gray-400">(optional)</span>
                      </label>
                      <div className="flex gap-2">
                        <CountryCodeSelector value={countryCode} onChange={setCountryCode} buttonClassName="px-3 py-2.5" />
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="tel" value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="Mobile Number"
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#003d7a] focus:ring-1 focus:ring-[#003d7a]/20" />
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="acceptTermsModal"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="acceptTermsModal" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                        I accept the{' '}
                        <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium underline">
                          Terms and Conditions
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium underline">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                  </>
                )}

                {unverifiedEmail && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                    <div className="flex gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Email not verified</p>
                        <p className="text-xs text-amber-600 mt-0.5">Your account hasn&apos;t been verified yet. Resend a code to <span className="font-semibold">{unverifiedEmail}</span> to complete sign-up.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleResendAndVerify}
                      disabled={resending}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                    >
                      {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Resend verification code</>}
                    </button>
                  </div>
                )}

                {displayError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{displayError}</p>
                )}

                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#003d7a] hover:bg-[#002d5a] text-white font-semibold rounded-lg transition-colors disabled:opacity-60">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>{mode === 'login' ? 'Login' : 'Continue'}<ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center"><span className="px-3 bg-white text-sm text-gray-400">Or</span></div>
              </div>

              <p className="text-center text-sm text-gray-500">
                {mode === 'login' ? (
                  <>New to Bretunetech?{' '}
                    <button onClick={() => onSwitchMode('register')} className="text-[#003d7a] font-semibold hover:underline">Register</button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button onClick={() => onSwitchMode('login')} className="text-[#003d7a] font-semibold hover:underline">Login</button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
