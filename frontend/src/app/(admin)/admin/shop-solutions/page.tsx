'use client';

import { useEffect, useState } from 'react';
import {
  Plus, Trash2, Save, RefreshCw, GripVertical, Eye, EyeOff,
} from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { appToast } from '@/lib/toast';
import { useAdminConfirm } from '@/components/admin/useAdminConfirm';
import {
  DEFAULT_SHOP_SOLUTIONS,
  fetchShopSolutionsAdmin,
  resetShopSolutionsAdmin,
  saveShopSolutionsAdmin,
  type ShopSolutionColor,
  type ShopSolutionIcon,
  type ShopSolutionItem,
  type ShopSolutionsSettings,
} from '@/lib/solutions';

const ICON_OPTIONS: ShopSolutionIcon[] = [
  'wifi', 'camera', 'zap', 'network', 'printer', 'monitor',
  'router', 'shield', 'antenna', 'cable', 'server', 'radio',
];

const COLOR_OPTIONS: ShopSolutionColor[] = [
  'bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-cyan-500',
  'bg-pink-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500',
  'bg-indigo-500', 'bg-teal-500', 'bg-slate-600',
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function newItem(sortOrder: number): ShopSolutionItem {
  return {
    id: `sol-${Date.now()}`,
    title: 'New solution',
    slug: `new-solution-${sortOrder + 1}`,
    desc: '',
    icon: 'wifi',
    color: 'bg-blue-500',
    enabled: true,
    sortOrder,
  };
}

export default function ShopSolutionsAdminPage() {
  const { token } = useAuthStore();
  const { confirm, dialog } = useAdminConfirm();
  const [settings, setSettings] = useState<ShopSolutionsSettings>(DEFAULT_SHOP_SOLUTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchShopSolutionsAdmin(token);
      setSettings(data);
    } catch (e: any) {
      appToast.error(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const updateItem = (index: number, patch: Partial<ShopSolutionItem>) => {
    setSettings((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], ...patch };
      return { ...prev, items };
    });
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    setSettings((prev) => {
      const items = [...prev.items];
      const next = index + dir;
      if (next < 0 || next >= items.length) return prev;
      const tmp = items[index];
      items[index] = items[next];
      items[next] = tmp;
      return {
        ...prev,
        items: items.map((item, i) => ({ ...item, sortOrder: i })),
      };
    });
  };

  const addItem = () => {
    setSettings((prev) => ({
      ...prev,
      items: [...prev.items, newItem(prev.items.length)],
    }));
  };

  const removeItem = async (index: number) => {
    const ok = await confirm({
      title: 'Remove card?',
      description: `Remove “${settings.items[index]?.title}” from Shop by Solution.`,
      confirmLabel: 'Remove',
      variant: 'danger',
    });
    if (!ok) return;
    setSettings((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index).map((item, i) => ({ ...item, sortOrder: i })),
    }));
  };

  const handleSave = async () => {
    if (!token) return;
    const slugs = settings.items.map((i) => i.slug);
    if (new Set(slugs).size !== slugs.length) {
      appToast.error('Each card needs a unique category slug');
      return;
    }
    setSaving(true);
    try {
      const saved = await saveShopSolutionsAdmin(token, {
        ...settings,
        items: settings.items.map((item, i) => ({
          ...item,
          id: item.id || item.slug,
          slug: slugify(item.slug) || `solution-${i + 1}`,
          sortOrder: i,
        })),
      });
      setSettings(saved);
      appToast.success('Shop by Solution saved');
    } catch (e: any) {
      appToast.error(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!token) return;
    const ok = await confirm({
      title: 'Reset to defaults?',
      description: 'This replaces your Shop by Solution cards with the built-in defaults.',
      confirmLabel: 'Reset',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      const data = await resetShopSolutionsAdmin(token);
      setSettings(data);
      appToast.success('Reset to defaults');
    } catch (e: any) {
      appToast.error(e?.message || 'Reset failed');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <RefreshCw className="size-6 animate-spin text-[#003d7a]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dialog}
      <AdminPageHeader
        title="Shop by Solution"
        description="Edit the homepage solution cards. Slugs should match category slugs used on /products."
        actions={
          <>
            <Button type="button" variant="outline" onClick={handleReset}>
              <RefreshCw className="size-4" /> Reset
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              <Save className="size-4" /> {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <label className="block text-xs font-medium text-gray-500">
          Section title
          <input
            value={settings.sectionTitle}
            onChange={(e) => setSettings((s) => ({ ...s, sectionTitle: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-gray-500">
          Section subtitle
          <input
            value={settings.sectionSubtitle}
            onChange={(e) => setSettings((s) => ({ ...s, sectionSubtitle: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{settings.items.length} cards</p>
        <Button type="button" variant="outline" onClick={addItem}>
          <Plus className="size-4" /> Add card
        </Button>
      </div>

      <div className="space-y-3">
        {settings.items.map((item, index) => (
          <div
            key={item.id}
            className={`rounded-xl border bg-white p-4 ${item.enabled ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-70'}`}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <GripVertical className="size-4 text-gray-400" />
                Card {index + 1}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                  Up
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => moveItem(index, 1)} disabled={index === settings.items.length - 1}>
                  Down
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateItem(index, { enabled: !item.enabled })}
                >
                  {item.enabled ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  {item.enabled ? 'Visible' : 'Hidden'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-700"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="text-xs text-gray-500 md:col-span-2">
                Title
                <input
                  value={item.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    updateItem(index, {
                      title,
                      ...(item.slug === slugify(item.title) || !item.slug
                        ? { slug: slugify(title) }
                        : {}),
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-gray-500">
                Category slug
                <input
                  value={item.slug}
                  onChange={(e) => updateItem(index, { slug: slugify(e.target.value) || e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm"
                  placeholder="networking"
                />
              </label>
              <label className="text-xs text-gray-500 md:col-span-2 xl:col-span-1">
                Short description
                <input
                  value={item.desc}
                  onChange={(e) => updateItem(index, { desc: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-gray-500">
                Icon
                <select
                  value={item.icon}
                  onChange={(e) => updateItem(index, { icon: e.target.value as ShopSolutionIcon })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-gray-500">
                Colour
                <select
                  value={item.color}
                  onChange={(e) => updateItem(index, { color: e.target.value as ShopSolutionColor })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color} value={color}>{color.replace('bg-', '')}</option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <div className={`flex h-10 w-full items-center justify-center rounded-lg ${item.color} text-xs font-semibold text-white`}>
                  Preview
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
