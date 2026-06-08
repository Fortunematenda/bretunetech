'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wifi, Cable, Camera, Router, Headset, Wrench, CheckCircle, ArrowLeft, Loader2, CalendarDays, MapPin, User, Mail, Phone, Building2 } from 'lucide-react';
import { serviceCatalog } from '@/lib/brand';
import { bookingsApi } from '@/lib/api';

const SERVICE_TYPE_MAP: Record<string, string> = {
  'wifi-installations':      'WIFI_INSTALLATION',
  'fibre-installations':     'FIBRE_INSTALLATION',
  'cctv-setup':              'CCTV_SETUP',
  'mikrotik-configuration':  'MIKROTIK_CONFIGURATION',
  'remote-support':          'REMOTE_SUPPORT',
  'network-troubleshooting': 'NETWORK_TROUBLESHOOTING',
};

const SERVICE_ICONS: Record<string, any> = {
  'wifi-installations': Wifi,
  'fibre-installations': Cable,
  'cctv-setup': Camera,
  'mikrotik-configuration': Router,
  'remote-support': Headset,
  'network-troubleshooting': Wrench,
};

const PROVINCES = ['Western Cape','Gauteng','KwaZulu-Natal','Eastern Cape','Free State','Limpopo','Mpumalanga','Northern Cape','North West'];

function BookForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselected = searchParams.get('service') || '';

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    company: '',
    serviceType: preselected,
    address: '',
    city: '',
    province: '',
    postalCode: '',
    preferredDate: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.serviceType) { setError('Please select a service.'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        serviceType: SERVICE_TYPE_MAP[form.serviceType] || form.serviceType,
        preferredDate: form.preferredDate ? new Date(form.preferredDate).toISOString() : undefined,
      };
      const result = await bookingsApi.create(payload);
      setBookingRef(result.bookingNumber || result.id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Submitted!</h1>
        <p className="text-gray-500 mb-2">Your reference number is:</p>
        <p className="text-xl font-mono font-bold text-[#003d7a] mb-4">{bookingRef}</p>
        <p className="text-gray-500 text-sm mb-8">Our team will contact you within 1 business day to confirm your appointment.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/services" className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
            Back to Services
          </Link>
          <Link href="/" className="px-5 py-2.5 bg-[#003d7a] text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/services" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Services
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Book a Service</h1>
        <p className="text-gray-500 text-sm">Fill in your details and we'll confirm your appointment within 1 business day.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Service Required *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {serviceCatalog.map((svc) => {
              const Icon = SERVICE_ICONS[svc.slug] ?? Wifi;
              const active = form.serviceType === svc.slug;
              return (
                <button
                  key={svc.slug}
                  type="button"
                  onClick={() => set('serviceType', svc.slug)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                    active ? 'border-[#003d7a] bg-[#003d7a]/5 text-[#003d7a]' : 'border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{svc.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Contact Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input required value={form.customerName} onChange={(e) => set('customerName', e.target.value)}
                placeholder="John Smith" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003d7a]/20 focus:border-[#003d7a]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company <span className="text-gray-400">(optional)</span></label>
              <input value={form.company} onChange={(e) => set('company', e.target.value)}
                placeholder="Acme Corp" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003d7a]/20 focus:border-[#003d7a]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input required type="email" value={form.customerEmail} onChange={(e) => set('customerEmail', e.target.value)}
                placeholder="john@company.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003d7a]/20 focus:border-[#003d7a]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input required value={form.customerPhone} onChange={(e) => set('customerPhone', e.target.value)}
                placeholder="072 000 0000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003d7a]/20 focus:border-[#003d7a]" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Service Location</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
            <input required value={form.address} onChange={(e) => set('address', e.target.value)}
              placeholder="123 Main Street" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003d7a]/20 focus:border-[#003d7a]" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input required value={form.city} onChange={(e) => set('city', e.target.value)}
                placeholder="Cape Town" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003d7a]/20 focus:border-[#003d7a]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
              <select required value={form.province} onChange={(e) => set('province', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003d7a]/20 focus:border-[#003d7a] bg-white">
                <option value="">Select...</option>
                {PROVINCES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
              <input required value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)}
                placeholder="8001" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003d7a]/20 focus:border-[#003d7a]" />
            </div>
          </div>
        </div>

        {/* Preferred Date & Notes */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Scheduling</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date <span className="text-gray-400">(optional)</span></label>
            <input type="date" value={form.preferredDate} onChange={(e) => set('preferredDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003d7a]/20 focus:border-[#003d7a]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes <span className="text-gray-400">(optional)</span></label>
            <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Describe your setup, any access notes, or specific requirements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003d7a]/20 focus:border-[#003d7a] resize-none" />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#003d7a] hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><CalendarDays className="w-4 h-4" /> Book Service</>}
        </button>
      </form>
    </div>
  );
}

export default function BookServicePage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-gray-400">Loading...</div>}>
      <BookForm />
    </Suspense>
  );
}
