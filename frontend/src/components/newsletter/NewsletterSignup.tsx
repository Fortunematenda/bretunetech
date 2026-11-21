'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { newsletterPublicApi } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';

const CONSENT_LABEL =
  'I agree to receive marketing emails from Bretune Technologies (Pty) Ltd about products, services and offers. I can unsubscribe at any time.';

export default function NewsletterSignup({ source = 'website-footer' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      appToast.error('Please tick the marketing consent box to subscribe.');
      return;
    }
    setLoading(true);
    try {
      const res = await newsletterPublicApi.subscribe({
        email,
        marketingConsent: true,
        source,
      });
      appToast.success(
        res.requiresConfirmation
          ? 'Check your inbox to confirm your subscription.'
          : 'You are subscribed to BretuneTech updates.',
      );
      setEmail('');
      setConsent(false);
    } catch (err: any) {
      appToast.error(err.message || 'Could not subscribe');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-xl border border-primary-foreground/20 bg-primary-foreground/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-foreground">
        <Mail className="size-4" aria-hidden />
        Newsletter
      </div>
      <p className="mb-3 text-xs text-primary-foreground/70">
        Monthly product highlights, networking tips and service updates. No spam — unsubscribe anytime.
      </p>
      <label className="sr-only" htmlFor="newsletter-email">Email address</label>
      <input
        id="newsletter-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.co.za"
        className="mb-3 w-full rounded-lg border border-primary-foreground/25 bg-white px-3 py-2 text-sm text-gray-900"
      />
      <label className="mb-3 flex gap-2 text-left text-xs text-primary-foreground/80">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded border-gray-300"
        />
        <span>{CONSENT_LABEL}</span>
      </label>
      <Button type="submit" disabled={loading} className="w-full bg-white text-primary hover:bg-white/90">
        {loading ? 'Submitting…' : 'Subscribe'}
      </Button>
    </form>
  );
}