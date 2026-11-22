'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import NewsletterContentEditor, { NewsletterEmailPreview } from '@/components/admin/newsletter/NewsletterContentEditor';
import { newsletterAdminApi, type EmailBlock, type NewsletterTemplate } from '@/lib/newsletter-api';
import { appToast } from '@/lib/toast';

export default function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [template, setTemplate] = useState<NewsletterTemplate | null>(null);
  const [preview, setPreview] = useState<'desktop' | 'mobile'>('desktop');

  const load = useCallback(async () => {
    const t = await newsletterAdminApi.getTemplate(id);
    setTemplate(t);
  }, [id]);

  useEffect(() => {
    load().catch((e) => appToast.error(e.message));
  }, [load]);

  async function save() {
    if (!template) return;
    try {
      await newsletterAdminApi.updateTemplate(id, {
        name: template.name,
        description: template.description,
        title: template.title,
        subject: template.subject,
        previewText: template.previewText,
        blocks: template.blocks,
      });
      appToast.success('Template saved');
    } catch (e: any) {
      appToast.error(e.message);
    }
  }

  async function createCampaign() {
    try {
      const c = await newsletterAdminApi.createCampaignFromTemplate(id, { title: template?.title });
      window.location.href = `/admin/newsletters/campaigns/${c.id}`;
    } catch (e: any) {
      appToast.error(e.message || 'Could not create campaign');
    }
  }

  if (!template) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  const blocks = (template.blocks || []) as EmailBlock[];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader
        title={template.name}
        description={`Slug: ${template.slug} — edits here do not change sent campaigns until you create a new draft from this template.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/newsletters" className="text-sm text-[#003d7a] underline">
              ← Back
            </Link>
            <Button size="sm" variant="outline" onClick={save}>
              Save template
            </Button>
            <Button size="sm" onClick={createCampaign}>
              Create campaign from template
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <NewsletterContentEditor
          showTemplateMeta
          value={{
            name: template.name,
            description: template.description,
            title: template.title,
            subject: template.subject,
            previewText: template.previewText || '',
            blocks,
          }}
          onChange={(v) =>
            setTemplate({
              ...template,
              name: v.name ?? template.name,
              description: v.description ?? template.description,
              title: v.title,
              subject: v.subject,
              previewText: v.previewText,
              blocks: v.blocks,
            })
          }
        />
        <NewsletterEmailPreview blocks={blocks} preview={preview} onPreviewChange={setPreview} />
      </div>
    </div>
  );
}