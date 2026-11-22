'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { EmailBlock } from '@/lib/newsletter-api';

function htmlToPlain(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function productSlugFromInput(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/\/products\/(?!category\/)([^/?#]+)/i);
  if (!match) return trimmed;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function plainToHtml(text: string): string {
  const escape = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!paragraphs.length) return '<p></p>';
  return paragraphs.map((part) => `<p>${escape(part).replace(/\n/g, '<br>')}</p>`).join('');
}

const fieldClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#003d7a] focus:outline-none focus:ring-1 focus:ring-[#003d7a]';
const blockFieldClass =
  'w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#003d7a] focus:outline-none';

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
          <label className="block text-sm font-medium text-gray-800">Template name</label>
          <input
            className={fieldClass}
            value={value.name || ''}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
          />
          <label className="block text-sm font-medium text-gray-800">Description</label>
          <textarea
            className={`min-h-[72px] ${fieldClass}`}
            value={value.description || ''}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
          />
        </>
      )}

      <label className="block text-sm font-medium text-gray-800">Campaign title</label>
      <input
        className={fieldClass}
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
      />
      <label className="block text-sm font-medium text-gray-800">Subject</label>
      <input
        className={fieldClass}
        value={value.subject}
        onChange={(e) => onChange({ ...value, subject: e.target.value })}
      />
      <label className="block text-sm font-medium text-gray-800">Preview text</label>
      <input
        className={fieldClass}
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
          className={`min-h-[280px] font-mono text-xs ${fieldClass}`}
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
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{b.type === 'richtext' ? 'Text' : b.type}</span>
            <BlockActions index={i} total={blocks.length} onMove={move} onRemove={() => remove(i)} />
          </div>
          {b.type === 'eyebrow' && (
            <input
              className={blockFieldClass}
              placeholder="Eyebrow, e.g. DECEMBER 2026 NEWSLETTER"
              value={b.text}
              onChange={(e) => onBlocksChange(patchBlock(blocks, i, { text: e.target.value }))}
            />
          )}
          {b.type === 'hero' && (
            <div className="space-y-2">
              <input
                className={blockFieldClass}
                placeholder="Headline"
                value={b.headline}
                onChange={(e) => onBlocksChange(patchBlock(blocks, i, { headline: e.target.value }))}
              />
              <input
                className={blockFieldClass}
                placeholder="Subhead (optional)"
                value={b.subhead || ''}
                onChange={(e) => onBlocksChange(patchBlock(blocks, i, { subhead: e.target.value }))}
              />
            </div>
          )}
          {b.type === 'features' && (
            <div className="space-y-3">
              {b.items.map((item, itemIndex) => (
                <div key={itemIndex} className="space-y-2 rounded border border-white bg-white p-2">
                  <input
                    className={blockFieldClass}
                    placeholder="Image URL or /assets/..."
                    value={item.imageUrl}
                    onChange={(e) => {
                      const items = b.items.map((row, j) => (j === itemIndex ? { ...row, imageUrl: e.target.value } : row));
                      onBlocksChange(patchBlock(blocks, i, { items }));
                    }}
                  />
                  <input
                    className={blockFieldClass}
                    placeholder="Card title"
                    value={item.title}
                    onChange={(e) => {
                      const items = b.items.map((row, j) => (j === itemIndex ? { ...row, title: e.target.value } : row));
                      onBlocksChange(patchBlock(blocks, i, { items }));
                    }}
                  />
                  <input
                    className={blockFieldClass}
                    placeholder="Card text"
                    value={item.text}
                    onChange={(e) => {
                      const items = b.items.map((row, j) => (j === itemIndex ? { ...row, text: e.target.value } : row));
                      onBlocksChange(patchBlock(blocks, i, { items }));
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          {b.type === 'richtext' && (
            <textarea
              className={`min-h-[100px] ${blockFieldClass}`}
              placeholder="Write the paragraph. Blank lines start a new paragraph."
              value={htmlToPlain(b.html)}
              onChange={(e) => onBlocksChange(patchBlock(blocks, i, { html: plainToHtml(e.target.value) }))}
            />
          )}
          {b.type === 'category' && (
            <div className="flex flex-wrap gap-2">
              <input
                className={`min-w-[140px] flex-1 ${blockFieldClass}`}
                placeholder="Category slug"
                value={b.categorySlug}
                onChange={(e) => onBlocksChange(patchBlock(blocks, i, { categorySlug: e.target.value }))}
              />
              <input
                type="number"
                className={`w-24 ${blockFieldClass}`}
                placeholder="Limit"
                value={b.limit ?? 4}
                onChange={(e) => onBlocksChange(patchBlock(blocks, i, { limit: Number(e.target.value) || 4 }))}
              />
            </div>
          )}
          {b.type === 'products' && (
            <input
              className={blockFieldClass}
              placeholder="Paste a product link or slug. Separate several with commas."
              value={(b.productSlugs || []).join(', ')}
              onChange={(e) =>
                onBlocksChange(
                  patchBlock(blocks, i, {
                    productSlugs: e.target.value
                      .split(',')
                      .map(productSlugFromInput)
                      .filter(Boolean),
                  }),
                )
              }
            />
          )}
          {b.type === 'services' && (
            <input
              className={blockFieldClass}
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
                className={`min-w-[120px] flex-1 ${blockFieldClass}`}
                placeholder="Button label"
                value={b.label}
                onChange={(e) => onBlocksChange(patchBlock(blocks, i, { label: e.target.value }))}
              />
              <input
                className={`min-w-[140px] flex-1 ${blockFieldClass}`}
                placeholder="Link path or URL"
                value={b.href}
                onChange={(e) => onBlocksChange(patchBlock(blocks, i, { href: e.target.value }))}
              />
              <input
                className={`min-w-[140px] flex-1 ${blockFieldClass}`}
                placeholder="Optional line under the button"
                value={b.sublabel || ''}
                onChange={(e) => onBlocksChange(patchBlock(blocks, i, { sublabel: e.target.value }))}
              />
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => onBlocksChange([...blocks, { type: 'eyebrow', text: 'MONTHLY NEWSLETTER' }])}>
          + Eyebrow
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onBlocksChange([...blocks, { type: 'hero', headline: 'Headline', subhead: '' }])}>
          + Hero
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            onBlocksChange([
              ...blocks,
              {
                type: 'features',
                items: [
                  { imageUrl: '/assets/hero/camera.png', title: 'CCTV Security', text: 'Protect your property with professional installations.' },
                  { imageUrl: '/assets/hero/networking.png', title: 'Better Wi-Fi', text: 'Improve coverage throughout your home or business.' },
                ],
              },
            ])
          }
        >
          + Feature cards
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

function ProductPreviewCards({ slugs }: { slugs: string[] }) {
  const [products, setProducts] = useState<{ slug: string; name: string; price?: number; image?: string }[]>([]);

  useEffect(() => {
    const unique = [...new Set(slugs.map(productSlugFromInput).filter(Boolean))];
    if (!unique.length) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    Promise.all(
      unique.map(async (slug) => {
        try {
          const product = await productsApi.getBySlug(slug);
          const image = product.images?.[0]?.url || product.image || product.primaryImage;
          return {
            slug,
            name: product.displayName || product.name || slug,
            price: product.sellingPrice,
            image,
          };
        } catch {
          return { slug, name: slug };
        }
      }),
    ).then((rows) => {
      if (!cancelled) setProducts(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [slugs.join('|')]);

  if (!slugs.length) {
    return <p className="text-xs text-slate-500">Add a product link to show it here.</p>;
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <div key={product.slug} className="flex items-center gap-3 rounded-lg bg-white p-2">
          {product.image ? (
            <img src={product.image} alt="" className="h-16 w-16 rounded object-contain" />
          ) : (
            <div className="h-16 w-16 rounded bg-slate-200" />
          )}
          <div>
            <div className="font-semibold text-slate-900">{product.name}</div>
            {product.price != null && <div className="text-xs text-slate-500">{formatPrice(product.price)}</div>}
          </div>
        </div>
      ))}
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
        <div className="overflow-hidden rounded-lg bg-slate-50 shadow">
          <div className="bg-[#003d7a] px-4 py-3 text-center text-white">
            <div className="text-sm font-bold tracking-[0.16em]">BRETUNETECH</div>
            <div className="text-[10px] tracking-wide opacity-90">ENTERPRISE TECHNOLOGY. RELIABLE CONNECTIVITY.</div>
          </div>
          <div className="p-4">
          {blocks.map((b, i) => (
            <div key={i} className="mb-3 text-sm text-gray-700">
              {b.type === 'eyebrow' && (
                <p className="text-center text-[11px] font-semibold tracking-[0.14em] text-slate-500">{b.text}</p>
              )}
              {b.type === 'hero' && (
                <div className="text-center text-slate-900">
                  <div className="text-lg font-bold">{b.headline}</div>
                  {b.subhead && <div className="mt-1 text-xs text-slate-500">{b.subhead}</div>}
                </div>
              )}
              {b.type === 'features' && (
                <div className="grid grid-cols-2 gap-3">
                  {b.items.map((item) => (
                    <div key={item.title}>
                      <img src={item.imageUrl} alt="" className="h-28 w-full rounded-lg object-cover" />
                      <div className="mt-2 font-semibold text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.text}</div>
                    </div>
                  ))}
                </div>
              )}
              {b.type === 'richtext' && <div dangerouslySetInnerHTML={{ __html: b.html }} />}
              {b.type === 'category' && <p>Products from category: {b.categorySlug}</p>}
              {b.type === 'products' && <ProductPreviewCards slugs={b.productSlugs || []} />}
              {b.type === 'services' && <p>Services: {(b.slugs || []).join(', ') || '(add slugs)'}</p>}
              {b.type === 'cta' && (
                <div className="rounded-lg bg-[#003d7a] px-4 py-3 text-center text-white">
                  <div className="font-semibold">{b.label}</div>
                  {b.sublabel && <div className="text-xs opacity-90">{b.sublabel}</div>}
                </div>
              )}
            </div>
          ))}
          <p className="mt-4 text-center text-[10px] text-gray-400">
            BretuneTech • Cape Town, South Africa
            <br />
            You are receiving this because you subscribed to BretuneTech updates. Unsubscribe at any time.
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}