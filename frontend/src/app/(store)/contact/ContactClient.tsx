'use client';

import { useState } from 'react';
import { Mail, Phone, Clock3, Send, CheckCircle, Loader2, MessageCircle, Globe, Building2 } from 'lucide-react';
import { brand } from '@/lib/brand';
import { COMPANY } from '@/lib/company';
import { LinkedinIcon, FacebookIcon } from '@/components/ui/SocialIcons';
import { trackGenerateLead, trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';
import { useForm, zodResolver, z } from '@/lib/form';
import { appToast } from '@/lib/toast';
import { iconSize } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  message: z.string().trim().min(10, 'Please provide a bit more detail (10+ characters)'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactClient() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to submit enquiry');
      }

      setIsSuccess(true);
      trackGenerateLead('contact');
      reset();
      appToast.success('Enquiry submitted successfully');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      appToast.error(message);
    }
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-8 sm:px-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Building2 className={`${iconSize.md} text-primary`} aria-hidden="true" /> {COMPANY.legalName}
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Globe className={`${iconSize.md} text-primary`} aria-hidden="true" /> {COMPANY.website}
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className={`${iconSize.md} text-primary`} aria-hidden="true" />
              <a href={`mailto:${COMPANY.email}`} className="hover:text-primary">
                {COMPANY.email}
              </a>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className={`${iconSize.md} text-primary`} aria-hidden="true" />
              <a
                href={`tel:${brand.phone.replace(/\s/g, '')}`}
                onClick={() => trackPhoneClick('contact_page')}
                className="hover:text-primary"
              >
                {brand.phone}
              </a>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MessageCircle className={`${iconSize.md} text-emerald-600`} aria-hidden="true" />
              <span>WhatsApp available below</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock3 className={`${iconSize.md} text-primary`} aria-hidden="true" /> Mon – Fri, 08:00 – 17:30
            </div>

            <Separator />

            <Button asChild className="h-11 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500">
              <a
                href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent('Hi BretuneTech, I have a question.')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('contact_page')}
              >
                <MessageCircle className={iconSize.md} aria-hidden="true" /> Chat on WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>

        {isSuccess ? (
          <Card className="border-emerald-200 bg-emerald-50/60 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <CheckCircle className="mb-4 size-16 text-emerald-600" aria-hidden="true" />
              <h2 className="mb-2 text-xl font-bold text-foreground">Enquiry Submitted!</h2>
              <p className="mb-6 text-muted-foreground">
                Thank you for your enquiry. Our team will review your request and get back to you at{' '}
                <strong className="text-emerald-700">{brand.email}</strong> shortly.
              </p>
              <Button type="button" onClick={() => setIsSuccess(false)} className="rounded-xl">
                Send Another Enquiry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Request Service Callback</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" placeholder="Full Name" className="h-10 rounded-xl" {...register('name')} aria-invalid={!!errors.name} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" placeholder="Company" className="h-10 rounded-xl" {...register('company')} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    className="h-10 rounded-xl"
                    {...register('email')}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="Phone Number" className="h-10 rounded-xl" {...register('phone')} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your network requirements..."
                    className="min-h-32 rounded-xl"
                    {...register('message')}
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                </div>

                <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl">
                  {isSubmitting ? (
                    <>
                      <Loader2 className={`${iconSize.md} animate-spin`} aria-hidden="true" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className={iconSize.md} aria-hidden="true" />
                      Submit Enquiry
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-12 border-t border-border pt-12">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">Follow BretuneTech Online</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Connect with us for product updates, industry news, promotions, and technology insights from our expert team.
          </p>
        </div>

        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
          <a
            href="https://www.linkedin.com/company/bretunetech"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 transition-all hover:border-blue-400 hover:shadow-lg"
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-blue-600 transition-all group-hover:scale-110 group-hover:bg-blue-700">
              <LinkedinIcon className="size-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground">LinkedIn</h3>
            <p className="text-center text-sm text-muted-foreground">
              Connect with us for professional networking, industry insights, and company updates
            </p>
            <span className="text-sm font-semibold text-blue-600">Follow Us →</span>
          </a>

          <a
            href="https://www.facebook.com/bretunetech"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-4 rounded-2xl border border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 transition-all hover:border-blue-500 hover:shadow-lg"
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-blue-700 transition-all group-hover:scale-110 group-hover:bg-blue-800">
              <FacebookIcon className="size-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Facebook</h3>
            <p className="text-center text-sm text-muted-foreground">
              Follow us for product launches, special promotions, and technology news
            </p>
            <span className="text-sm font-semibold text-blue-700">Follow Us →</span>
          </a>
        </div>
      </div>
    </div>
  );
}
