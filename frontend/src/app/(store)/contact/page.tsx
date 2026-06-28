'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, Clock3, Send, CheckCircle, Loader2, MessageCircle, Globe, Building2 } from 'lucide-react';
import { brand } from '@/lib/brand';
import { COMPANY } from '@/lib/company';
import { LinkedinIcon, FacebookIcon } from '@/components/ui/SocialIcons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function ContactPage() {
  useEffect(() => {
    document.title = 'Contact Us | Bretunetech';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Tell us about your site, goals, and timeline. Our team will get back with a scoped recommendation and quote.');
    }
  }, []);
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
    <div className="w-full px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-600 font-medium mb-4">
          <Mail className="w-4 h-4" /> Contact Us
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Let's plan your network upgrade</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Tell us about your site, goals, and timeline. Our team will get back with a scoped recommendation and quote.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 text-gray-600">
              <Building2 className="w-4 h-4 text-cyan-600" /> {COMPANY.legalName}
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Globe className="w-4 h-4 text-cyan-600" /> {COMPANY.website}
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-4 h-4 text-cyan-600" /> {COMPANY.email}
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="w-4 h-4 text-cyan-600" /> {brand.phone}
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp: {brand.whatsapp}
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Clock3 className="w-4 h-4 text-cyan-600" /> Mon – Fri, 08:00 – 17:30
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
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

        {/* Form */}
        {isSuccess ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Enquiry Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your enquiry. Our team will review your request and get back to you at <strong className="text-emerald-600">sales@bretunetech.com</strong> shortly.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="px-6 py-2 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-colors"
            >
              Send Another Enquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Request Service Callback</h2>
            
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                placeholder="Full Name *"
              />
              <input
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                placeholder="Company"
              />
            </div>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              placeholder="Email Address *"
            />
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              placeholder="Phone Number"
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              minLength={10}
              className="w-full min-h-32 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              placeholder="Tell us about your network requirements... *"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-cyan-600 text-white font-semibold py-2.5 hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      </div>

      {/* Social Media Section */}
      <div className="mt-12 border-t border-gray-200 pt-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Follow BretuneTech Online</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with us for product updates, industry news, promotions, and technology insights from our expert team.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* LinkedIn Card */}
          <a
            href="https://www.linkedin.com/company/bretunetech"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 group-hover:bg-blue-700 group-hover:scale-110 transition-all duration-300">
              <LinkedinIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">LinkedIn</h3>
            <p className="text-sm text-gray-600 text-center">
              Connect with us for professional networking, industry insights, and company updates
            </p>
            <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">Follow Us →</span>
          </a>

          {/* Facebook Card */}
          <a
            href="https://www.facebook.com/bretunetech"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-300 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-700 group-hover:bg-blue-800 group-hover:scale-110 transition-all duration-300">
              <FacebookIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Facebook</h3>
            <p className="text-sm text-gray-600 text-center">
              Follow us for product launches, special promotions, and technology news
            </p>
            <span className="text-sm font-semibold text-blue-700 group-hover:text-blue-800">Follow Us →</span>
          </a>
        </div>
      </div>
    </div>
  );
}
