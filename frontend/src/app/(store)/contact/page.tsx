import { Mail } from 'lucide-react';
import ContactClient from './ContactClient';

export default function ContactPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-4xl px-4 pt-8 sm:px-6">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            <Mail className="size-4" aria-hidden="true" /> Contact Us
          </div>
          <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
            Let&apos;s plan your network upgrade
          </h1>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Tell us about your site, goals, and timeline. Our team will get back with a scoped recommendation and quote.
            BretuneTech serves Cape Town and businesses across South Africa.
          </p>
        </div>
      </div>
      <ContactClient />
    </>
  );
}
