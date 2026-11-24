import { DEFAULT_API_URL } from '@/lib/config';
import { useAuthStore } from '@/store/auth-store';

const BASE = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

function adminFetch(path: string, init: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${BASE}/newsletter${path}`, { ...init, headers });
}

async function adminJson<T = any>(path: string, init?: RequestInit): Promise<T> {
  const r = await adminFetch(path, init);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || data.message || `Request failed (${r.status})`);
  return data as T;
}

export type EmailBlock =
  | { type: 'eyebrow'; text: string }
  | { type: 'hero'; headline: string; subhead?: string; imageUrl?: string }
  | { type: 'richtext'; html: string }
  | { type: 'features'; items: { imageUrl: string; title: string; text: string }[] }
  | { type: 'products'; productSlugs: string[] }
  | { type: 'category'; categorySlug: string; limit?: number }
  | { type: 'services'; slugs?: string[] }
  | { type: 'cta'; label: string; href: string; sublabel?: string }
  | { type: 'divider' }
  | { type: 'spacer'; height?: number }
  | { type: 'contact'; phone?: string; email?: string; address?: string; hours?: string }
  | { type: 'offer'; headline: string; detail: string; code?: string; expiresAt?: string }
  | { type: 'project'; title: string; summary: string; imageUrl?: string; href?: string };

export const HOLIDAY_NEWSLETTER_BLOCKS: EmailBlock[] = [
  { type: 'eyebrow', text: 'DECEMBER 2026 NEWSLETTER' },
  {
    type: 'hero',
    headline: 'Keep Your Home & Business Connected This Holiday Season',
    subhead:
      'Discover reliable CCTV, Wi-Fi and networking solutions to help protect your property and keep you connected.',
  },
  {
    type: 'features',
    items: [
      {
        imageUrl: '/assets/hero/camera.png',
        title: 'CCTV Security',
        text: 'Protect your property with professional installations.',
      },
      {
        imageUrl: '/assets/hero/networking.png',
        title: 'Better Wi-Fi',
        text: 'Improve coverage throughout your home or business.',
      },
    ],
  },
  { type: 'cta', label: 'Explore Products & Services', href: '/', sublabel: 'www.bretunetech.com' },
];

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
  cancelledAt?: string | null;
  scheduledAtLocal?: string | null;
  sentAtLocal?: string | null;
  cancelledAtLocal?: string | null;
  approvedAtLocal?: string | null;
  timeZone?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NewsletterTemplate = {
  id: string;
  slug: string;
  name: string;
  description: string;
  title: string;
  subject: string;
  previewText: string;
  audience?: { consentOnly: boolean; activity?: string; interests?: string[] };
  blocks: EmailBlock[];
  updatedAt?: string;
};

export type NewsletterDashboard = {
  subscribers: {
    total?: number;
    active: number;
    eligible?: number;
    pending: number;
    requiresConsentReview?: number;
    unsubscribed: number;
    suppressed: number;
  };
  campaigns: { total: number; sent: number; scheduled?: number };
  identity: { fromName: string; fromEmail: string; provider: string };
  delivery: {
    accepted: number;
    delivered: number;
    failed: number;
    ambiguous?: number;
    bounces: number;
    complaints: number;
    unsubscribes: number;
    deliveryRate?: number | null;
    acceptedNote?: string;
    deliveredNote?: string;
  };
  engagement: {
    opens: number;
    clicks: number;
    openRate: number;
    clickRate: number;
    openRateNote?: string;
  };
  recentCampaigns?: Campaign[];
  performance?: Array<{
    id: string;
    title: string;
    sentAt?: string | null;
    accepted: number;
    delivered: number;
    uniqueOpens: number;
  }>;
  sendingEnabled: boolean;
  workerEnabled: boolean;
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
  dashboard: () => adminJson<NewsletterDashboard>('/admin/dashboard'),
  listCampaigns: () => adminJson<{ campaigns: Campaign[] }>('/admin/campaigns'),
  listTemplates: () => adminJson<{ templates: NewsletterTemplate[] }>('/admin/templates'),
  getTemplate: (id: string) => adminJson<NewsletterTemplate>(`/admin/templates/${id}`),
  updateTemplate: (id: string, body: Partial<NewsletterTemplate>) =>
    adminJson(`/admin/templates/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  createCampaignFromTemplate: (templateId: string, body?: { title?: string; monthKey?: string }) =>
    adminJson(`/admin/templates/${templateId}/campaign`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),
  getCampaign: (id: string) => adminJson<Campaign>(`/admin/campaigns/${id}`),
  createCampaign: (body: Partial<Campaign>) =>
    adminJson('/admin/campaigns', { method: 'POST', body: JSON.stringify(body) }),
  updateCampaign: (id: string, body: Partial<Campaign>) =>
    adminJson(`/admin/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCampaign: (id: string) => adminJson(`/admin/campaigns/${id}`, { method: 'DELETE' }),
  duplicate: (id: string) => adminJson(`/admin/campaigns/${id}/duplicate`, { method: 'POST' }),
  submit: (id: string) => adminJson(`/admin/campaigns/${id}/submit`, { method: 'POST' }),
  approve: (id: string) => adminJson(`/admin/campaigns/${id}/approve`, { method: 'POST' }),
  testSend: (id: string, email: string) =>
    adminJson(`/admin/campaigns/${id}/test-send`, { method: 'POST', body: JSON.stringify({ email }) }),
  start: (id: string) => adminJson(`/admin/campaigns/${id}/start`, { method: 'POST' }),
  scheduleCampaign: (id: string, scheduledAt: string) =>
    adminJson(`/admin/campaigns/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledAt }),
    }),
  cancelCampaign: (id: string) => adminJson(`/admin/campaigns/${id}/cancel`, { method: 'POST' }),
  audiencePreview: (id: string) =>
    adminJson<{
      eligibleCount: number;
      legacyExcluded: number;
      suppressedCount: number;
      sample: Array<{ id: string; email: string; source: string }>;
      timeZone: string;
    }>(`/admin/campaigns/${id}/audience-preview`),
  campaignAnalytics: (id: string, params?: { from?: string; to?: string }) => {
    const q = new URLSearchParams();
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    const qs = q.toString();
    return adminJson(`/admin/campaigns/${id}/analytics${qs ? `?${qs}` : ''}`);
  },
  async campaignAnalyticsCsv(id: string, params?: { from?: string; to?: string }) {
    const q = new URLSearchParams();
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    const qs = q.toString();
    const r = await adminFetch(`/admin/campaigns/${id}/analytics.csv${qs ? `?${qs}` : ''}`);
    if (!r.ok) throw new Error('Could not export analytics CSV');
    return r.text();
  },
  subscribers: async (params: Record<string, string>) => {
    const q = new URLSearchParams(params);
    return adminJson(`/admin/subscribers?${q}`);
  },
  async exportSubscribersCsv(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params);
    const r = await adminFetch(`/admin/subscribers/export.csv?${q}`);
    if (!r.ok) throw new Error('Could not export subscribers');
    return r.text();
  },
  importSubscribers: (rows: Array<{
    email: string;
    firstName?: string;
    interests?: string[];
    consentAt: string;
    source: string;
  }>) => adminJson('/admin/subscribers/import', { method: 'POST', body: JSON.stringify({ rows }) }),
  consentAudit: () => adminJson('/admin/consent-audit'),
  schedule: () => adminJson('/admin/schedule'),
  updateSchedule: (body: { enabled: boolean; dayOfMonth: number; hour: number; timeZone: string }) =>
    adminJson('/admin/schedule', { method: 'PUT', body: JSON.stringify(body) }),
};
