/**
 * Lightweight GA4 helpers. No-ops when NEXT_PUBLIC_GA_MEASUREMENT_ID is unset
 * (gtag is not loaded).
 */

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined | null>
) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

export function trackGenerateLead(formName: string) {
  trackEvent('generate_lead', { form_name: formName });
}

export function trackWhatsAppClick(location: string) {
  trackEvent('contact', { method: 'whatsapp', location });
}

export function trackPhoneClick(location: string) {
  trackEvent('contact', { method: 'phone', location });
}

export function trackPurchase(params: {
  transactionId: string;
  value: number;
  currency?: string;
  paymentMethod?: string;
  itemCount?: number;
}) {
  trackEvent('purchase', {
    transaction_id: params.transactionId,
    value: Number(params.value.toFixed(2)),
    currency: params.currency || 'ZAR',
    payment_type: params.paymentMethod,
    items_count: params.itemCount,
  });
}
