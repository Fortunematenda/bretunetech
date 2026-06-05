'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock3, Send, CheckCircle, Loader2, MessageCircle } from 'lucide-react';
import { brand } from '@/lib/brand';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to submit enquiry');
      }

      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="rounded-2xl border border-gray-800/70 bg-gradient-to-b from-slate-900/80 to-gray-950 p-6 sm:p-7">
          <p className="text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-3">Contact Bretune</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Let's plan your network upgrade</h1>
          <p className="text-sm text-gray-400 mb-6">
            Tell us about your site, goals, and timeline. Our team will get back with a scoped recommendation and quote.
          </p>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-gray-300">
              <Mail className="w-4 h-4 text-cyan-400" /> {brand.email}
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Phone className="w-4 h-4 text-cyan-400" /> {brand.phone}
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <MessageCircle className="w-4 h-4 text-green-400" /> WhatsApp: {brand.whatsapp}
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <MapPin className="w-4 h-4 text-cyan-400" /> {brand.location}
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Clock3 className="w-4 h-4 text-cyan-400" /> Mon – Fri, 08:00 – 17:30
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <a
              href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent('Hi Bretunetech, I have a question.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>

        {isSuccess ? (
          <div className="rounded-2xl border border-emerald-800/50 bg-emerald-900/20 p-6 sm:p-7 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Enquiry Submitted!</h2>
            <p className="text-gray-400 mb-6">
              Thank you for your enquiry. Our team will review your request and get back to you at <strong className="text-emerald-400">sales@bretunetech.com</strong> shortly.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="px-6 py-2 rounded-xl bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400 transition-colors"
            >
              Send Another Enquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-800/70 bg-gray-900/50 p-6 sm:p-7 space-y-4">
            <h2 className="text-xl font-semibold text-white">Request Service Callback</h2>
            
            {error && (
              <div className="p-3 rounded-lg bg-red-900/30 border border-red-800/50 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-700 bg-gray-950/70 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                placeholder="Full Name *"
              />
              <input
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-700 bg-gray-950/70 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                placeholder="Company"
              />
            </div>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-700 bg-gray-950/70 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              placeholder="Email Address *"
            />
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-700 bg-gray-950/70 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              placeholder="Phone Number"
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              minLength={10}
              className="w-full min-h-32 rounded-xl border border-gray-700 bg-gray-950/70 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              placeholder="Tell us about your network requirements... *"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-cyan-500 text-slate-900 font-semibold py-2.5 hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Enquiry
                </>
              )}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
