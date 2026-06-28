'use client';

import { useState, useEffect } from 'react';
import {
  Wifi, Cable, Camera, Router, Headset, Wrench,
  MessageCircle, Send, CheckCircle, Loader2, Zap, Shield, Phone,
} from 'lucide-react';
import { brand, serviceCatalog } from '@/lib/brand';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const serviceIcons: Record<string, any> = {
  'wifi-installations': Wifi,
  'fibre-installations': Cable,
  'cctv-setup': Camera,
  'mikrotik-configuration': Router,
  'remote-support': Headset,
  'network-troubleshooting': Wrench,
};

const serviceWhatsApp: Record<string, string> = {
  'wifi-installations': "Hi Bretunetech! I'd like a quote for a Wi-Fi installation.",
  'fibre-installations': "Hi Bretunetech! I'd like a quote for a fibre installation.",
  'cctv-setup': "Hi Bretunetech! I'd like a quote for a CCTV setup.",
  'mikrotik-configuration': "Hi Bretunetech! I'd like a quote for MikroTik configuration.",
  'remote-support': "Hi Bretunetech! I need remote support assistance.",
  'network-troubleshooting': "Hi Bretunetech! I need help with network troubleshooting.",
};

const budgetOptions = [
  'Under R5,000',
  'R5,000 – R15,000',
  'R15,000 – R50,000',
  'R50,000 – R100,000',
  'R100,000+',
  'Not sure yet',
];

const urgencyOptions = [
  'ASAP (within a week)',
  'Within a month',
  '1–3 months',
  'Just planning ahead',
];

export default function QuotePage() {
  useEffect(() => {
    document.title = 'Get a Quote | Bretunetech';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Tell us what you need. We\'ll scope it, price it, and get back to you within one business day.');
    }
  }, []);

  const [selectedService, setSelectedService] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    budget: '',
    urgency: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) { setError('Please select a service.'); return; }
    setIsSubmitting(true);
    setError('');

    const serviceLabel = serviceCatalog.find(s => s.slug === selectedService)?.name || selectedService;
    const message = `Service: ${serviceLabel}\nBudget: ${formData.budget || 'Not specified'}\nUrgency: ${formData.urgency || 'Not specified'}\n\n${formData.message}`;

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          service: serviceLabel,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to submit');
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const waLink = (slug: string) =>
    `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(serviceWhatsApp[slug] || "Hi Bretunetech! I'd like to get a quote.")}`;

  if (isSuccess) {
    return (
      <div className="w-full px-4 sm:px-6 py-16 max-w-2xl mx-auto text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Request Sent!</h1>
          <p className="text-gray-500 mb-2">
            Thank you, <strong>{formData.name}</strong>. We've received your request and will get back to you at <strong>{formData.email}</strong> within 24 hours.
          </p>
          <p className="text-gray-400 text-sm mb-8">Need a faster response? Chat with us on WhatsApp right now.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={waLink(selectedService)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
            <button
              onClick={() => { setIsSuccess(false); setSelectedService(''); setFormData({ name: '', email: '', phone: '', company: '', budget: '', urgency: '', message: '' }); }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#003d7a]/10 border border-[#003d7a]/20 rounded-full text-sm text-[#003d7a] font-semibold mb-4">
          <Zap className="w-4 h-4" /> Free Quote — No Obligation
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Get a Quote</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
          Tell us what you need. We'll scope it, price it, and get back to you within one business day.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: service picker + form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1: Service */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#003d7a] text-white text-xs flex items-center justify-center font-bold">1</span>
              Select a Service
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {serviceCatalog.map((svc) => {
                const Icon = serviceIcons[svc.slug] ?? Wifi;
                const active = selectedService === svc.slug;
                return (
                  <button
                    key={svc.slug}
                    type="button"
                    onClick={() => { setSelectedService(svc.slug); setError(''); }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all text-xs font-medium ${
                      active
                        ? 'border-[#003d7a] bg-[#003d7a]/5 text-[#003d7a]'
                        : 'border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-[#003d7a]' : 'text-gray-400'}`} />
                    {svc.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Quote form */}
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#003d7a] text-white text-xs flex items-center justify-center font-bold">2</span>
              Your Details
            </h2>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <input name="name" value={formData.name} onChange={handleChange} required placeholder="Full Name *"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003d7a]" />
              <input name="company" value={formData.company} onChange={handleChange} placeholder="Company / Organisation"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003d7a]" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Email Address *"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003d7a]" />
              <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Phone / WhatsApp Number"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003d7a]" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <select name="budget" value={formData.budget} onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#003d7a] bg-white">
                <option value="">Budget Range (optional)</option>
                {budgetOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select name="urgency" value={formData.urgency} onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#003d7a] bg-white">
                <option value="">Timeline / Urgency (optional)</option>
                {urgencyOptions.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <textarea name="message" value={formData.message} onChange={handleChange} required minLength={10}
              placeholder="Describe your requirements — site size, number of users, existing equipment, specific issues... *"
              className="w-full min-h-28 rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003d7a] resize-none" />

            <button type="submit" disabled={isSubmitting}
              className="w-full rounded-xl bg-[#003d7a] hover:bg-[#0056b3] text-white font-semibold py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Submit Quote Request</>}
            </button>
          </form>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-4">

          {/* WhatsApp Quick Chat */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Prefer to chat?</h3>
            <p className="text-xs text-gray-500 mb-4">Message us on WhatsApp and we'll respond within the hour.</p>
            {selectedService ? (
              <a
                href={waLink(selectedService)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp — {serviceCatalog.find(s => s.slug === selectedService)?.name}
              </a>
            ) : (
              <a
                href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent("Hi Bretunetech! I'd like to get a quote.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
            )}
          </div>

          {/* Quick service WhatsApp shortcuts */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Quick WhatsApp Enquiry</h3>
            <div className="space-y-2">
              {serviceCatalog.map(svc => {
                const Icon = serviceIcons[svc.slug] ?? Wifi;
                return (
                  <a
                    key={svc.slug}
                    href={waLink(svc.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all group"
                  >
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-green-600 shrink-0" />
                    <span className="text-xs text-gray-700 group-hover:text-green-700 font-medium">{svc.name}</span>
                    <MessageCircle className="w-3.5 h-3.5 text-gray-300 group-hover:text-green-500 ml-auto shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Trust signals */}
          <div className="bg-[#003d7a] rounded-2xl p-5 text-white">
            <h3 className="text-sm font-bold mb-3">Why Bretunetech?</h3>
            <ul className="space-y-2.5 text-xs text-blue-100">
              {[
                { icon: <Shield className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />, text: 'Certified network engineers' },
                { icon: <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />, text: 'Fast turnaround — most installs within 3 days' },
                { icon: <Phone className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />, text: 'Dedicated after-sales support' },
                { icon: <CheckCircle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />, text: 'No hidden costs — fixed-price quotes' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">{item.icon}{item.text}</li>
              ))}
            </ul>
          </div>

          {/* Direct call */}
          <a href={`tel:${brand.phone.replace(/\s/g, '')}`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 hover:border-[#003d7a] text-gray-700 hover:text-[#003d7a] font-semibold rounded-2xl transition-all text-sm">
            <Phone className="w-4 h-4" /> {brand.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
