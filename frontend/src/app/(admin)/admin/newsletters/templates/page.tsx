'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Sparkles } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { newsletterAdminApi, type NewsletterTemplate } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [preview, setPreview] = useState<NewsletterTemplate | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const t = await newsletterAdminApi.listTemplates();
      setTemplates(t.templates || []);
    } catch (e: any) {
      appToast.error(e.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function useTemplate(id: string, title?: string) {
    try {
      const c = await newsletterAdminApi.createCampaignFromTemplate(id, title ? { title } : undefined);
      window.location.href = `/admin/newsletters/campaigns/${c.id}`;
    } catch (e: any) {
      appToast.error(e.message || 'Could not create campaign');
    }
  }

  async function openPreview(id: string) {
    try {
      const t = await newsletterAdminApi.getTemplate(id);
      setPreview(t);
      setPreviewId(id);
    } catch (e: any) {
      appToast.error(e.message || 'Could not load template');
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader
        title="Template library"
        description="Reusable BretuneTech layouts. Using a template creates a new draft campaign — it never sends automatically."
      />
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border bg-gray-100" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-gray-50 px-4 py-6 text-sm text-gray-500">
          No templates yet. On the server run <code>npm run newsletter:seed-templates</code> after deploying the new seeds.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <div key={t.id} className="flex flex-col rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-medium text-gray-900">{t.name}</h3>
                <Sparkles className="size-4 shrink-0 text-[#003d7a]" />
              </div>
              <p className="text-xs font-medium text-gray-700">{t.subject}</p>
              <p className="mt-1 flex-1 text-xs text-gray-500">{t.description || t.previewText}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => openPreview(t.id)}>
                  <Eye className="mr-1 size-3.5" /> Preview
                </Button>
                <Link href={`/admin/newsletters/templates/${t.id}`}>
                  <Button type="button" size="sm" variant="outline">
                    <Pencil className="mr-1 size-3.5" /> Edit
                  </Button>
                </Link>
                <Button type="button" size="sm" onClick={() => useTemplate(t.id, t.title)}>
                  Use for campaign
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && previewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setPreview(null)}>
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">{preview.name}</h3>
            <p className="text-sm text-gray-500">{preview.subject}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              {(preview.blocks || []).map((b, i) => (
                <li key={i} className="rounded border bg-gray-50 px-3 py-2">
                  <span className="text-xs font-semibold uppercase text-gray-500">{b.type}</span>
                  {'headline' in b && b.headline ? <div className="font-medium">{b.headline}</div> : null}
                  {'text' in b && b.text ? <div>{b.text}</div> : null}
                  {'title' in b && typeof (b as any).title === 'string' ? <div>{(b as any).title}</div> : null}
                  {'label' in b && b.label ? <div>CTA: {b.label}</div> : null}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setPreview(null)}>
                Close
              </Button>
              <Button type="button" onClick={() => useTemplate(previewId, preview.title)}>
                Use for campaign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
