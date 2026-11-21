import { DEFAULT_API_URL } from '@/lib/config';
import { useAuthStore } from '@/store/auth-store';

const BASE = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

function adminFetch(path: string, init: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${BASE}/newsletter${path}`, { ...init, headers });
}

export type EmailBlock =
  | { type: 'hero'; headline: string; subhead?: string }
  | { type: 'richtext'; html: string }
  | { type: 'products'; productSlugs: string[] }
  | { type: 'category'; categorySlug: string; limit?: number }
  | { type: 'services'; slugs?: string[] }
  | { type: 'cta'; label: string; href: string };

export type Campaign = {
  id: string;
  title: string;
  subject: string;
  previewText?: string;
  fromName: string;
  fromEmail: string;
  audience: { consentOnly: boolean; activity?: string; interests?: string[] };
  status: string;
  blocks: EmailBlock[];
  monthKey?: string | null;
  scheduledAt?: string | null;
  sentAt?: string | null;
};

export const newsletterPublicApi = {
  subscribe(body: {
    email: string;
    firstName?: string;
    interests?: string[];
    marketingConsent: boolean;
    source?: string;
  }) {
    return fetch(`${BASE}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Subscription failed');
      return data;
    });
  },
  unsubscribe(body: { token?: string; subscriberId?: string }) {
    return fetch(`${BASE}/newsletter/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },
  confirm(token: string) {
    return fetch(`${BASE}/newsletter/confirm?token=${encodeURIComponent(token)}`);
  },
};

export const newsletterAdminApi = {
  dashboard: () => adminFetch('/admin/dashboard').then((r) => r.json()),
  listCampaigns: () => adminFetch('/admin/campaigns').then((r) => r.json()),
  getCampaign: (id: string) => adminFetch(`/admin/campaigns/${id}`).then((r) => r.json()),
  createCampaign: (body: Partial<Campaign>) =>
    adminFetch('/admin/campaigns', { method: 'POST', body: JSON.stringify(body) }).then((r) => r.json()),
  updateCampaign: (id: string, body: Partial<Campaign>) =>
    adminFetch(`/admin/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then((r) => r.json()),
  duplicate: (id: string) => adminFetch(`/admin/campaigns/${id}/duplicate`, { method: 'POST' }).then((r) => r.json()),
  submit: (id: string) => adminFetch(`/admin/campaigns/${id}/submit`, { method: 'POST' }).then((r) => r.json()),
  approve: (id: string) => adminFetch(`/admin/campaigns/${id}/approve`, { method: 'POST' }).then((r) => r.json()),
  testSend: (id: string, email: string) =>
    adminFetch(`/admin/campaigns/${id}/test-send`, { method: 'POST', body: JSON.stringify({ email }) }).then((r) => r.json()),
  start: (id: string) => adminFetch(`/admin/campaigns/${id}/start`, { method: 'POST' }).then((r) => r.json()),
  subscribers: (params: Record<string, string>) => {
    const q = new URLSearchParams(params);
    return adminFetch(`/admin/subscribers?${q}`).then((r) => r.json());
  },
  schedule: () => adminFetch('/admin/schedule').then((r) => r.json()),
  updateSchedule: (body: { enabled: boolean; dayOfMonth: number; hour: number; timeZone: string }) =>
    adminFetch('/admin/schedule', { method: 'PUT', body: JSON.stringify(body) }).then((r) => r.json()),
};