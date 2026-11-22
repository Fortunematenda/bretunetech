'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { EmailBlock } from '@/lib/newsletter-api';

export type NewsletterEditorFields = {
  name?: string;
  description?: string;
  title: string;
  subject: string;
  previewText: string;
  blocks: EmailBlock[];
};

type Props = {
  value: NewsletterEditorFields;
  onChange: (next: NewsletterEditorFields) => void;
  showTemplateMeta?: boolean;
};

function patchBlock(blocks: EmailBlock[], index: number, patch: Partial<EmailBlock>): EmailBlock[] {
  return blocks.map((b, i) => (i === index ? ({ ...b, ...patch } as EmailBlock) : b));
}

export default function NewsletterContentEditor({ value, onChange, showTemplateMeta }: Props) {
  const [showJson, setShowJson] = useState(false);
  const { blocks } = value;

  function setBlocks(next: EmailBlock[]) {
    onChange({ ...value, blocks: next });
  }

  return (
    <div className="space-y-4">
      {showTemplateMeta && (
        <>
          <label className="block text-sm font-medium">Template name</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={value.name || ''}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
          />
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="min-h-[72px] w-full rounded-lg border px-3 py-2 text-sm"
            value={value.description || ''}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
          />
        </>
      )}

      <label className="block text-sm font-medium">Campaign title</label>
      <input
        className="w-full rounded-lg border px-3 py-2 text-sm"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
      />
      <label className="block text-sm font-medium">Subject</label>
      <input
        className="w-full rounded-lg border px-3 py-2 text-sm"
        value={value.subject}
        onChange={(e) => onChange({ ...value, subject: e.target.value })}
      />
      <label className="block text-sm font-medium">Preview text</label>
      <input
        className="w-full rounded-lg border px-3 py-2 text-sm"
        value={value.previewText || ''}
        onChange={(e) => onChange({ ...value, previewText: e.target.value })}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Content blocks</h3>
        <Button type="button" size="sm" variant="ghost" onClick={() => setShowJson((v) => !v)}>
          {showJson ? 'Visual editor' : 'Advanced JSON'}
        </Button>
      </div>

      {showJson ? (
        <textarea
          className="min-h-[280px] w-full rounded-lg border p-3 font-mono text-xs"
          value={JSON.stringify(blocks, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value) as EmailBlock[];
              setBlocks(parsed);
            } catch {
              /* keep typing */
            }
          }}
        />
      ) : (
        <MetadataBlocksEditor blocks={blocks} onBlocksChange={setBlocks} />
      )}
    </div>
  );
}

function BlockActions({
  index,
  total,
  onMove,
  onRemove,
}: {
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-1">
      <Button type="button" size="sm" variant="outline" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        ↑
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={index >= total - 1} onClick={() => onMove(index, index + 1)}>
        ↓
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={onRemove}>
        Remove
      </Button>
    </div>
  );
}

function MetadataBlocksEditor({
  blocks,
  onBlocksChange,
}: {
  blocks: EmailBlock[];
  onBlocksChange: (b: EmailBlock[]) => void;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onBlocksChange(next);
  };

  const remove = (i: number) => onBlocksChange(blocks.filter((_, j) => j !== i));

  return (
    <div className="space-y-3">
      {blocks.map((b, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{b.type}</span>
            <BlockActions index={i} total={blocks.length} onMove={move} onRemove={() => remove(i)} />
          </div>
          {b.type === 'hero' && (
            <div className="space-y-2">
              <input
                className="w-full rounded border px-2 py-1.5 text-sm"
                placeholder="Headline"
                value={b.headline}
                onChange={(e) => onBlocksChange(patchBlock(blocks, i, { headline: e.target.value }))}
              />
              <input
                className="w-full rounded border px-2 py-1.5 text-sm"
                placeholder="Subhead (optional)"
                value={b.subhead || ''}
                onChange={(e) => onBlocksChange(patchBlock(blocks, i, { subhead: e.target.value }))}
              />
            </div>
          )}
          {b.type === 'richtext' && (
            <textarea
              className="min-h-[100px] w-full rounded border px-2 py-1.5 font-mono text-xs"
              value={b.html}
              onChange={(e) => onBlocksChange(patchBlock(blocks, i, { html: e.target.value }))}
            />
          )}
          {b.type === 'category' && (
            <div className="flex flex-wrap gap-2">
              <input
                className="min-w-[140px] flex-1 rounded border px-2 py-1.5 text-sm"
                placeholder="Category slug"
                value={b.categorySlug}
                onChange={(e) => onBlocksChange(patchBlock(blocks, i, { categorySlug: e.target.value }))}
              />
              <input
                type="number"
                className="w-24 rounded border px-2 py-1.5 text-sm"
                placeholder="Limit"
                value={b.limit ?? 4}
                onChange={(e) => onBlocksChange(patchBlock(blocks, i, { limit: Number(e.target.value) || 4 }))}
              />
            </div>
          )}
          {b.type === 'products' && (
            <input
              className="w-full rounded border px-2 py-1.5 text-sm"
              placeholder="Product slugs, comma-separated"
              value={(b.productSlugs || []).join(', ')}
              onChange={(e) =>
                onBlocksChange(
                  patchBlock(blocks, i, {
                    productSlugs: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }),
                )
              }
            />
          )}
          {b.type === 'services' && (
            <input
              className="w-full rounded border px-2 py-1.5 text-sm"
              placeholder="Service slugs, comma-separated"
              value={(b.slugs || []).join(', ')}
              onChange={(e) =>
                onBlocksChange(
                  patchBlock(blocks, i, {
                    slugs: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }),
                )
              }
            />
          )}
          {b.type === 'cta' && (
            <div className="flex flex-wrap gap-2">
              <input
                className="min-w-[120px] flex-1 rounded border px-2 py-1.5 text-sm"
                placeholder="Button label"
                value={b.label}
                onChange={(e) => onBlocksChange(patchBlock(blocks, i, { label: e.target.value }))}
              />
              <input
                className="min-w-[140px] flex-1 rounded border px-2 py-1.5 text-sm"
                placeholder="Link path or URL"
                value={b.href}
                onChange={(e) => onBlocksChange(patchBlock(blocks, i, { href: e.target.value }))}
              />
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => onBlocksChange([...blocks, { type: 'hero', headline: 'Headline', subhead: '' }])}>
          + Hero
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onBlocksChange([...blocks, { type: 'richtext', html: '<p>New paragraph</p>' }])}>
          + Text
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onBlocksChange([...blocks, { type: 'category', categorySlug: 'networking', limit: 4 }])}>
          + Category
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onBlocksChange([...blocks, { type: 'products', productSlugs: [] }])}>
          + Products
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onBlocksChange([...blocks, { type: 'services', slugs: [] }])}>
          + Services
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onBlocksChange([...blocks, { type: 'cta', label: 'Shop now', href: '/products' }])}>
          + CTA
        </Button>
      </div>
    </div>
  );
}

export function NewsletterEmailPreview({
  blocks,
  preview,
  onPreviewChange,
}: {
  blocks: EmailBlock[];
  preview: 'desktop' | 'mobile';
  onPreviewChange: (p: 'desktop' | 'mobile') => void;
}) {
  return (
    <div>
      <div className="mb-2 flex gap-2">
        <Button size="sm" variant={preview === 'desktop' ? 'default' : 'outline'} onClick={() => onPreviewChange('desktop')}>
          Desktop
        </Button>
        <Button size="sm" variant={preview === 'mobile' ? 'default' : 'outline'} onClick={() => onPreviewChange('mobile')}>
          Mobile
        </Button>
      </div>
      <div
        className={`mx-auto overflow-hidden rounded-xl border bg-slate-100 p-4 ${preview === 'mobile' ? 'max-w-[390px]' : 'max-w-full'}`}
      >
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-2 text-center font-bold text-[#003d7a]">BretuneTech</div>
          {blocks.map((b, i) => (
            <div key={i} className="mb-3 text-sm text-gray-700">
              {b.type === 'hero' && (
                <div className="rounded-lg bg-[#003d7a] p-4 text-center text-white">
                  <div className="font-semibold">{b.headline}</div>
                  {b.subhead && <div className="text-xs opacity-90">{b.subhead}</div>}
                </div>
              )}
              {b.type === 'richtext' && <div dangerouslySetInnerHTML={{ __html: b.html }} />}
              {b.type === 'category' && <p>Products from category: {b.categorySlug}</p>}
              {b.type === 'products' && (
                <p>Featured products: {(b.productSlugs || []).length ? b.productSlugs.join(', ') : '(add slugs)'}</p>
              )}
              {b.type === 'services' && <p>Services: {(b.slugs || []).join(', ') || '(add slugs)'}</p>}
              {b.type === 'cta' && (
                <div className="text-center">
                  <span className="inline-block rounded bg-sky-500 px-4 py-2 text-white">{b.label}</span>
                </div>
              )}
            </div>
          ))}
          <p className="mt-4 text-center text-[10px] text-gray-400">Unsubscribe link in sent emails</p>
        </div>
      </div>
    </div>
  );
}