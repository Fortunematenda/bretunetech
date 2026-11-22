'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { newsletterAdminApi, type NewsletterTemplate } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);

  const load = useCallback(async () => {
    try {
      const t = await newsletterAdminApi.listTemplates();
      setTemplates(t.templates || []);
    } catch (e: any) {
      appToast.error(e.message || 'Failed to load templates');
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

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader
        title="Templates"
        description="Editable layouts. Using one copies it into a new draft."
      />
      {templates.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-gray-50 px-4 py-6 text-sm text-gray-500">
          No templates yet. On the server run <code>npm run newsletter:seed-templates</code>.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <div key={t.id} className="flex flex-col rounded-xl border bg-white p-4 shadow-sm">
              <h3 className="font-medium text-gray-900">{t.name}</h3>
              <p className="mt-1 flex-1 text-xs text-gray-500">{t.description || t.subject}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/admin/newsletters/templates/${t.id}`}>
                  <Button type="button" size="sm" variant="outline"><Pencil className="mr-1 size-3.5" /> Edit</Button>
                </Link>
                <Button type="button" size="sm" onClick={() => useTemplate(t.id, t.title)}>Use for campaign</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}