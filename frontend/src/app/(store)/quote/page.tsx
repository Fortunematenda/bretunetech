'use client';

import { useState } from 'react';
import {
  Wifi, Cable, Camera, Router, Headset, Wrench,
  MessageCircle, Send, CheckCircle, Loader2, Zap, Shield, Phone,
} from 'lucide-react';
import { brand, serviceCatalog } from '@/lib/brand';
import { trackGenerateLead, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { useForm, zodResolver, z } from '@/lib/form';
import { appToast } from '@/lib/toast';
import { iconSize } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  'wifi-installations': "Hi BretuneTech! I'd like a quote for a Wi-Fi installation.",
  'fibre-installations': "Hi BretuneTech! I'd like a quote for a fibre installation.",
  'cctv-setup': "Hi BretuneTech! I'd like a quote for a CCTV setup.",
  'mikrotik-configuration': "Hi BretuneTech! I'd like a quote for MikroTik configuration.",
  'remote-support': "Hi BretuneTech! I need remote support assistance.",
  'network-troubleshooting': "Hi BretuneTech! I need help with network troubleshooting.",
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

const quoteSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  budget: z.string().optional(),
  urgency: z.string().optional(),
  message: z.string().trim().min(10, 'Please provide a bit more detail (10+ characters)'),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

export default function QuotePage() {
  const [selectedService, setSelectedService] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      budget: '',
      urgency: '',
      message: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!selectedService) {
      appToast.error('Please select a service.');
      return;
    }

    const serviceLabel = serviceCatalog.find((s) => s.slug === selectedService)?.name || selectedService;
    const message = `Service: ${serviceLabel}\nBudget: ${values.budget || 'Not specified'}\nUrgency: ${values.urgency || 'Not specified'}\n\n${values.message}`;

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          company: values.company,
          service: serviceLabel,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to submit');

      setSubmittedName(values.name);
      setSubmittedEmail(values.email);
      setIsSuccess(true);
      trackGenerateLead('quote');
      appToast.success('Quote request sent');
      reset();
    } catch (err: unknown) {
      const messageText = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      appToast.error(messageText);
    }
  });

  const waLink = (slug: string) =>
    `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(serviceWhatsApp[slug] || "Hi BretuneTech! I'd like to get a quote.")}`;

  if (isSuccess) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
        <Card className="shadow-sm">
          <CardContent className="p-10">
            <CheckCircle className="mx-auto mb-5 size-16 text-emerald-500" aria-hidden="true" />
            <h1 className="mb-2 text-2xl font-bold text-foreground">Quote Request Sent!</h1>
            <p className="mb-2 text-muted-foreground">
              Thank you, <strong>{submittedName}</strong>. We&apos;ve received your request and will get back to you at{' '}
              <strong>{submittedEmail}</strong> within 24 hours.
            </p>
            <p className="mb-8 text-sm text-muted-foreground">
              Need a faster response? Chat with us on WhatsApp right now.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500">
                <a
                  href={waLink(selectedService)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('quote_success')}
                >
                  <MessageCircle className={iconSize.md} aria-hidden="true" /> Chat on WhatsApp
                </a>
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-11 rounded-xl"
                onClick={() => {
                  setIsSuccess(false);
                  setSelectedService('');
                }}
              >
                Submit Another Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-semibold text-primary">
          <Zap className={iconSize.md} aria-hidden="true" /> Free Quote — No Obligation
        </div>
        <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">Get a Quote</h1>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
          Tell us what you need. We&apos;ll scope it, price it, and get back to you within one business day.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  1
                </span>
                Select a Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {serviceCatalog.map((svc) => {
                  const Icon = serviceIcons[svc.slug] ?? Wifi;
                  const active = selectedService === svc.slug;
                  return (
                    <button
                      key={svc.slug}
                      type="button"
                      onClick={() => setSelectedService(svc.slug)}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center text-xs font-medium transition-all ${
                        active
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-primary/5'
                      }`}
                    >
                      <Icon className={`${iconSize.lg} ${active ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden="true" />
                      {svc.name}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  2
                </span>
                Your Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="quote-name">Full Name *</Label>
                    <Input id="quote-name" placeholder="Full Name" className="h-10 rounded-xl" {...register('name')} aria-invalid={!!errors.name} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="quote-company">Company</Label>
                    <Input id="quote-company" placeholder="Company / Organisation" className="h-10 rounded-xl" {...register('company')} />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="quote-email">Email *</Label>
                    <Input id="quote-email" type="email" placeholder="Email Address" className="h-10 rounded-xl" {...register('email')} aria-invalid={!!errors.email} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="quote-phone">Phone</Label>
                    <Input id="quote-phone" type="tel" placeholder="Phone / WhatsApp Number" className="h-10 rounded-xl" {...register('phone')} />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="quote-budget">Budget</Label>
                    <select id="quote-budget" className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" {...register('budget')}>
                      <option value="">Budget Range (optional)</option>
                      {budgetOptions.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="quote-urgency">Timeline</Label>
                    <select id="quote-urgency" className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" {...register('urgency')}>
                      <option value="">Timeline / Urgency (optional)</option>
                      {urgencyOptions.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="quote-message">Requirements *</Label>
                  <Textarea
                    id="quote-message"
                    placeholder="Describe your requirements — site size, number of users, existing equipment, specific issues..."
                    className="min-h-28 rounded-xl"
                    {...register('message')}
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                </div>

                <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl">
                  {isSubmitting ? (
                    <>
                      <Loader2 className={`${iconSize.md} animate-spin`} aria-hidden="true" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className={iconSize.md} aria-hidden="true" /> Submit Quote Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Prefer to chat?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-xs text-muted-foreground">
                Message us on WhatsApp and we&apos;ll respond within the hour.
              </p>
              <Button asChild className="h-10 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500">
                <a
                  href={
                    selectedService
                      ? waLink(selectedService)
                      : `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent("Hi BretuneTech! I'd like to get a quote.")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className={iconSize.md} aria-hidden="true" />
                  {selectedService
                    ? `WhatsApp — ${serviceCatalog.find((s) => s.slug === selectedService)?.name}`
                    : 'Chat on WhatsApp'}
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Quick WhatsApp Enquiry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {serviceCatalog.map((svc) => {
                const Icon = serviceIcons[svc.slug] ?? Wifi;
                return (
                  <a
                    key={svc.slug}
                    href={waLink(svc.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition-all hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    <Icon className={`${iconSize.md} shrink-0 text-muted-foreground group-hover:text-emerald-600`} aria-hidden="true" />
                    <span className="text-xs font-medium text-foreground group-hover:text-emerald-700">{svc.name}</span>
                    <MessageCircle className={`${iconSize.sm} ml-auto shrink-0 text-muted-foreground group-hover:text-emerald-500`} aria-hidden="true" />
                  </a>
                );
              })}
            </CardContent>
          </Card>

          <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
            <h3 className="mb-3 text-sm font-bold">Why BretuneTech?</h3>
            <ul className="space-y-2.5 text-xs text-primary-foreground/80">
              {[
                { icon: Shield, text: 'Certified network engineers' },
                { icon: Zap, text: 'Fast turnaround — most installs within 3 days' },
                { icon: Phone, text: 'Dedicated after-sales support' },
                { icon: CheckCircle, text: 'No hidden costs — fixed-price quotes' },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-2">
                  <item.icon className={`${iconSize.sm} mt-0.5 shrink-0 text-orange-300`} aria-hidden="true" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <Button asChild variant="outline" className="h-11 w-full rounded-2xl">
            <a
              href={`tel:${brand.phone.replace(/\s/g, '')}`}
              onClick={() => trackPhoneClick('quote_page')}
            >
              <Phone className={iconSize.md} aria-hidden="true" /> {brand.phone}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
