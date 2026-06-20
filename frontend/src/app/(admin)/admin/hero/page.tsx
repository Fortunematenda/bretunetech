'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, Plus, Trash2, Eye, EyeOff, Settings, Palette, Wifi, Sparkles, Network, ArrowRight, Upload } from 'lucide-react';
import { getHeroSettings, updateHeroSettings, resetHeroSettings, uploadHeroImage, HeroSettings } from '@/lib/hero-api';
import PremiumHero from '@/components/sections/PremiumHero';

export default function HeroSettingsPage() {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'visual' | 'nodes' | 'lines' | 'particles' | 'wifi' | 'animation'>('content');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getHeroSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load hero settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateHeroSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset to default settings?')) return;
    try {
      const data = await resetHeroSettings();
      setSettings(data);
      alert('Settings reset to defaults!');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      alert('Failed to reset settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return <div className="p-8">Failed to load settings</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Hero Section Settings</h1>
          <p className="text-sm text-slate-400">Customize the premium enterprise hero banner</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {previewMode ? (
        <div className="w-full">
          <PremiumHero />
        </div>
      ) : (
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-2">
            <button
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                activeTab === 'content' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              Content
            </button>
          <button
            onClick={() => setActiveTab('visual')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
              activeTab === 'visual' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            Visual
          </button>
          <button
            onClick={() => setActiveTab('nodes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
              activeTab === 'nodes' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Network className="w-4 h-4" />
            Nodes
          </button>
          <button
            onClick={() => setActiveTab('lines')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
              activeTab === 'lines' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            Connections
          </button>
          <button
            onClick={() => setActiveTab('particles')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
              activeTab === 'particles' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Particles
          </button>
          <button
            onClick={() => setActiveTab('wifi')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
              activeTab === 'wifi' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Wifi className="w-4 h-4" />
            WiFi Signals
          </button>
          <button
            onClick={() => setActiveTab('animation')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
              activeTab === 'animation' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Animation
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-73px)]">
          {activeTab === 'content' && <ContentTab settings={settings} setSettings={setSettings} uploading={uploading} setUploading={setUploading} />}
          {activeTab === 'visual' && <VisualTab settings={settings} setSettings={setSettings} uploading={uploading} setUploading={setUploading} />}
          {activeTab === 'nodes' && <NodesTab settings={settings} setSettings={setSettings} />}
          {activeTab === 'lines' && <LinesTab settings={settings} setSettings={setSettings} />}
          {activeTab === 'particles' && <ParticlesTab settings={settings} setSettings={setSettings} />}
          {activeTab === 'wifi' && <WifiTab settings={settings} setSettings={setSettings} />}
          {activeTab === 'animation' && <AnimationTab settings={settings} setSettings={setSettings} />}
        </div>
      </div>
      )}
    </div>
  );
}

/* ── Content Tab ─────────────────────────────────────────────── */
function ContentTab({ settings, setSettings, uploading, setUploading }: { 
  settings: HeroSettings; 
  setSettings: (s: HeroSettings) => void; 
  uploading: boolean; 
  setUploading: (u: boolean) => void; 
}) {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadHeroImage(file);
      setSettings({ ...settings, contentImageUrl: result.url });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Badge</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="w-32 text-sm text-slate-400">Visible</label>
            <button
              onClick={() => setSettings({ ...settings, badge: { ...settings.badge, visible: !settings.badge.visible } })}
              className={`w-12 h-6 rounded-full transition-colors ${settings.badge.visible ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.badge.visible ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Badge Text</label>
            <input
              type="text"
              value={settings.badge.text}
              onChange={(e) => setSettings({ ...settings, badge: { ...settings.badge, text: e.target.value } })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Horizontal Position</label>
            <select
              value={settings.badge.position?.horizontal || 'center'}
              onChange={(e) => setSettings({ 
                ...settings, 
                badge: { 
                  ...settings.badge, 
                  position: { 
                    horizontal: e.target.value as 'left' | 'center' | 'right',
                    vertical: settings.badge.position?.vertical || 'center'
                  } 
                } 
              })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Headline</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Main Headline</label>
            <input
              type="text"
              value={settings.headline}
              onChange={(e) => setSettings({ ...settings, headline: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Highlighted Text (Orange)</label>
            <input
              type="text"
              value={settings.headlineHighlight}
              onChange={(e) => setSettings({ ...settings, headlineHighlight: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Highlight Position</label>
            <select
              value={settings.headlineHighlightPosition?.horizontal || 'center'}
              onChange={(e) => setSettings({ 
                ...settings, 
                headlineHighlightPosition: { 
                  horizontal: e.target.value as 'left' | 'center' | 'right',
                  vertical: settings.headlineHighlightPosition?.vertical || 'center'
                } 
              })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Subheadline</h2>
        <textarea
          value={settings.subheadline}
          onChange={(e) => setSettings({ ...settings, subheadline: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Content Image</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Upload Image</label>
            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors border border-slate-700">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Choose File'}
                </div>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Or Enter Image URL</label>
            <input
              type="text"
              value={settings.contentImageUrl || ''}
              onChange={(e) => setSettings({ ...settings, contentImageUrl: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              placeholder="https://example.com/content-image.jpg"
            />
          </div>
          {settings.contentImageUrl && (
            <div
              className="h-32 rounded-lg border border-slate-700 bg-cover bg-center"
              style={{ backgroundImage: `url(${settings.contentImageUrl})` }}
            />
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Content Image Position</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Horizontal</label>
            <select
              value={settings.contentImagePosition?.horizontal || 'center'}
              onChange={(e) => setSettings({ 
                ...settings, 
                contentImagePosition: { 
                  horizontal: e.target.value as 'left' | 'center' | 'right',
                  vertical: settings.contentImagePosition?.vertical || 'center'
                } 
              })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Vertical</label>
            <select
              value={settings.contentImagePosition?.vertical || 'center'}
              onChange={(e) => setSettings({ 
                ...settings, 
                contentImagePosition: { 
                  horizontal: settings.contentImagePosition?.horizontal || 'center',
                  vertical: e.target.value as 'top' | 'center' | 'bottom' 
                } 
              })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Headline Position</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Horizontal</label>
            <select
              value={settings.headlinePosition?.horizontal || 'center'}
              onChange={(e) => setSettings({ 
                ...settings, 
                headlinePosition: { 
                  horizontal: e.target.value as 'left' | 'center' | 'right',
                  vertical: settings.headlinePosition?.vertical || 'center'
                } 
              })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Vertical</label>
            <select
              value={settings.headlinePosition?.vertical || 'center'}
              onChange={(e) => setSettings({ 
                ...settings, 
                headlinePosition: { 
                  horizontal: settings.headlinePosition?.horizontal || 'center',
                  vertical: e.target.value as 'top' | 'center' | 'bottom' 
                } 
              })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Subheadline Position</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Horizontal</label>
            <select
              value={settings.subheadlinePosition?.horizontal || 'center'}
              onChange={(e) => setSettings({ 
                ...settings, 
                subheadlinePosition: { 
                  horizontal: e.target.value as 'left' | 'center' | 'right',
                  vertical: settings.subheadlinePosition?.vertical || 'center'
                } 
              })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Vertical</label>
            <select
              value={settings.subheadlinePosition?.vertical || 'center'}
              onChange={(e) => setSettings({ 
                ...settings, 
                subheadlinePosition: { 
                  horizontal: settings.subheadlinePosition?.horizontal || 'center',
                  vertical: e.target.value as 'top' | 'center' | 'bottom' 
                } 
              })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">CTA Buttons</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Horizontal Position</label>
            <select
              value={settings.ctaButtonsPosition?.horizontal || 'center'}
              onChange={(e) => setSettings({ 
                ...settings, 
                ctaButtonsPosition: { 
                  horizontal: e.target.value as 'left' | 'center' | 'right',
                  vertical: settings.ctaButtonsPosition?.vertical || 'center'
                } 
              })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          {settings.ctaButtons.map((cta, i) => (
            <div key={i} className="flex gap-3 items-start bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={cta.text}
                  onChange={(e) => {
                    const newButtons = [...settings.ctaButtons];
                    newButtons[i] = { ...cta, text: e.target.value };
                    setSettings({ ...settings, ctaButtons: newButtons });
                  }}
                  placeholder="Button text"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  value={cta.link}
                  onChange={(e) => {
                    const newButtons = [...settings.ctaButtons];
                    newButtons[i] = { ...cta, link: e.target.value };
                    setSettings({ ...settings, ctaButtons: newButtons });
                  }}
                  placeholder="Link (e.g., /products)"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <select
                  value={cta.style}
                  onChange={(e) => {
                    const newButtons = [...settings.ctaButtons];
                    newButtons[i] = { ...cta, style: e.target.value as 'primary' | 'secondary' };
                    setSettings({ ...settings, ctaButtons: newButtons });
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="primary">Primary (Orange)</option>
                  <option value="secondary">Secondary (White/Transparent)</option>
                </select>
              </div>
              <button
                onClick={() => {
                  const newButtons = settings.ctaButtons.filter((_, idx) => idx !== i);
                  setSettings({ ...settings, ctaButtons: newButtons });
                }}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {settings.ctaButtons.length < 3 && (
            <button
              onClick={() => setSettings({ ...settings, ctaButtons: [...settings.ctaButtons, { text: '', link: '', style: 'primary' }] })}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Button
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Trust Indicators</h2>
        <div className="space-y-3">
          {settings.trustIndicators.map((indicator, i) => (
            <div key={i} className="flex gap-3 items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
              <button
                onClick={() => {
                  const newIndicators = [...settings.trustIndicators];
                  newIndicators[i] = { ...indicator, visible: !indicator.visible };
                  setSettings({ ...settings, trustIndicators: newIndicators });
                }}
                className={`w-10 h-6 rounded-full transition-colors ${indicator.visible ? 'bg-green-600' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${indicator.visible ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <input
                type="text"
                value={indicator.text}
                onChange={(e) => {
                  const newIndicators = [...settings.trustIndicators];
                  newIndicators[i] = { ...indicator, text: e.target.value };
                  setSettings({ ...settings, trustIndicators: newIndicators });
                }}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Visual Tab ──────────────────────────────────────────────── */
function VisualTab({ settings, setSettings, uploading, setUploading }: { 
  settings: HeroSettings; 
  setSettings: (s: HeroSettings) => void; 
  uploading: boolean; 
  setUploading: (u: boolean) => void; 
}) {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadHeroImage(file);
      setSettings({ ...settings, backgroundImageUrl: result.url });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Background Color</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Solid Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.backgroundColor || '#001a3d'}
                onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.backgroundColor || ''}
                onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                placeholder="#001a3d"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Background Image</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Upload Image</label>
            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors border border-slate-700">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Choose File'}
                </div>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Or Enter Image URL</label>
            <input
              type="text"
              value={settings.backgroundImageUrl || ''}
              onChange={(e) => setSettings({ ...settings, backgroundImageUrl: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          {settings.backgroundImageUrl && (
            <div
              className="h-24 rounded-lg border border-slate-700"
              style={{ 
                backgroundImage: `url(${settings.backgroundImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Background Gradient (Fallback)</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">CSS Gradient</label>
            <input
              type="text"
              value={settings.backgroundGradient}
              onChange={(e) => setSettings({ ...settings, backgroundGradient: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div
            className="h-24 rounded-lg border border-slate-700"
            style={{ background: settings.backgroundGradient }}
          />
          <div className="grid grid-cols-3 gap-2">
            {[
              'linear-gradient(135deg, #001a3d 0%, #003d7a 50%, #002244 100%)',
              'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              'linear-gradient(135deg, #0c4a6e 0%, #075985 100%)',
              'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
              'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
            ].map((grad) => (
              <button
                key={grad}
                onClick={() => setSettings({ ...settings, backgroundGradient: grad })}
                className="h-16 rounded-lg border-2 border-transparent hover:border-blue-500 transition-colors"
                style={{ background: grad }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Height</h2>
        <input
          type="text"
          value={settings.height || 'clamp(400px, 50vh, 600px)'}
          onChange={(e) => setSettings({ ...settings, height: e.target.value })}
          className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500"
          placeholder="clamp(400px, 50vh, 600px)"
        />
      </div>
    </div>
  );
}

/* ── Nodes Tab ───────────────────────────────────────────────── */
function NodesTab({ settings, setSettings }: { settings: HeroSettings; setSettings: (s: HeroSettings) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Network Nodes</h2>
          <button
            onClick={() => setSettings({ ...settings, nodes: [...settings.nodes, { x: 50, y: 50, size: '16px', delay: 0, color: '#003d7a' }] })}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Node
          </button>
        </div>
        <div className="space-y-3">
          {settings.nodes.map((node, i) => (
            <div key={i} className="flex gap-3 items-start bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">X Position (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={node.x}
                    onChange={(e) => {
                      const newNodes = [...settings.nodes];
                      newNodes[i] = { ...node, x: Number(e.target.value) };
                      setSettings({ ...settings, nodes: newNodes });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Y Position (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={node.y}
                    onChange={(e) => {
                      const newNodes = [...settings.nodes];
                      newNodes[i] = { ...node, y: Number(e.target.value) };
                      setSettings({ ...settings, nodes: newNodes });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Size</label>
                  <input
                    type="text"
                    value={node.size}
                    onChange={(e) => {
                      const newNodes = [...settings.nodes];
                      newNodes[i] = { ...node, size: e.target.value };
                      setSettings({ ...settings, nodes: newNodes });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Delay (s)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={node.delay}
                    onChange={(e) => {
                      const newNodes = [...settings.nodes];
                      newNodes[i] = { ...node, delay: Number(e.target.value) };
                      setSettings({ ...settings, nodes: newNodes });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={node.color}
                      onChange={(e) => {
                        const newNodes = [...settings.nodes];
                        newNodes[i] = { ...node, color: e.target.value };
                        setSettings({ ...settings, nodes: newNodes });
                      }}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={node.color}
                      onChange={(e) => {
                        const newNodes = [...settings.nodes];
                        newNodes[i] = { ...node, color: e.target.value };
                        setSettings({ ...settings, nodes: newNodes });
                      }}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const newNodes = settings.nodes.filter((_, idx) => idx !== i);
                  setSettings({ ...settings, nodes: newNodes });
                }}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Lines Tab ───────────────────────────────────────────────── */
function LinesTab({ settings, setSettings }: { settings: HeroSettings; setSettings: (s: HeroSettings) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Connection Lines</h2>
          <button
            onClick={() => setSettings({ ...settings, connectionLines: [...settings.connectionLines, { x1: 10, y1: 20, x2: 50, y2: 50, delay: 0 }] })}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Line
          </button>
        </div>
        <div className="space-y-3">
          {settings.connectionLines.map((line, i) => (
            <div key={i} className="flex gap-3 items-start bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">X1 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={line.x1}
                    onChange={(e) => {
                      const newLines = [...settings.connectionLines];
                      newLines[i] = { ...line, x1: Number(e.target.value) };
                      setSettings({ ...settings, connectionLines: newLines });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Y1 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={line.y1}
                    onChange={(e) => {
                      const newLines = [...settings.connectionLines];
                      newLines[i] = { ...line, y1: Number(e.target.value) };
                      setSettings({ ...settings, connectionLines: newLines });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">X2 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={line.x2}
                    onChange={(e) => {
                      const newLines = [...settings.connectionLines];
                      newLines[i] = { ...line, x2: Number(e.target.value) };
                      setSettings({ ...settings, connectionLines: newLines });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Y2 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={line.y2}
                    onChange={(e) => {
                      const newLines = [...settings.connectionLines];
                      newLines[i] = { ...line, y2: Number(e.target.value) };
                      setSettings({ ...settings, connectionLines: newLines });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Delay (s)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={line.delay}
                    onChange={(e) => {
                      const newLines = [...settings.connectionLines];
                      newLines[i] = { ...line, delay: Number(e.target.value) };
                      setSettings({ ...settings, connectionLines: newLines });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  const newLines = settings.connectionLines.filter((_, idx) => idx !== i);
                  setSettings({ ...settings, connectionLines: newLines });
                }}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Particles Tab ────────────────────────────────────────────── */
function ParticlesTab({ settings, setSettings }: { settings: HeroSettings; setSettings: (s: HeroSettings) => void }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Particle Configuration</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Count</label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.particleConfig.count}
              onChange={(e) => setSettings({ ...settings, particleConfig: { ...settings.particleConfig, count: Number(e.target.value) } })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Speed</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.particleConfig.speed}
              onChange={(e) => setSettings({ ...settings, particleConfig: { ...settings.particleConfig, speed: Number(e.target.value) } })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Min Size (px)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.particleConfig.sizeMin}
              onChange={(e) => setSettings({ ...settings, particleConfig: { ...settings.particleConfig, sizeMin: Number(e.target.value) } })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Max Size (px)</label>
            <input
              type="number"
              min="1"
              max="20"
              value={settings.particleConfig.sizeMax}
              onChange={(e) => setSettings({ ...settings, particleConfig: { ...settings.particleConfig, sizeMax: Number(e.target.value) } })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── WiFi Tab ─────────────────────────────────────────────────── */
function WifiTab({ settings, setSettings }: { settings: HeroSettings; setSettings: (s: HeroSettings) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">WiFi Signals</h2>
          <button
            onClick={() => setSettings({ ...settings, wifiSignals: [...settings.wifiSignals, { x: 50, y: 50, delay: 0 }] })}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Signal
          </button>
        </div>
        <div className="space-y-3">
          {settings.wifiSignals.map((signal, i) => (
            <div key={i} className="flex gap-3 items-start bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">X Position (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={signal.x}
                    onChange={(e) => {
                      const newSignals = [...settings.wifiSignals];
                      newSignals[i] = { ...signal, x: Number(e.target.value) };
                      setSettings({ ...settings, wifiSignals: newSignals });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Y Position (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={signal.y}
                    onChange={(e) => {
                      const newSignals = [...settings.wifiSignals];
                      newSignals[i] = { ...signal, y: Number(e.target.value) };
                      setSettings({ ...settings, wifiSignals: newSignals });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Delay (s)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={signal.delay}
                    onChange={(e) => {
                      const newSignals = [...settings.wifiSignals];
                      newSignals[i] = { ...signal, delay: Number(e.target.value) };
                      setSettings({ ...settings, wifiSignals: newSignals });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  const newSignals = settings.wifiSignals.filter((_, idx) => idx !== i);
                  setSettings({ ...settings, wifiSignals: newSignals });
                }}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Animation Tab ───────────────────────────────────────────── */
function AnimationTab({ settings, setSettings }: { settings: HeroSettings; setSettings: (s: HeroSettings) => void }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-semibold mb-4">Animation Speeds (seconds)</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Node Animation Duration</label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={settings.animationSpeed.nodeDuration}
              onChange={(e) => setSettings({ ...settings, animationSpeed: { ...settings.animationSpeed, nodeDuration: Number(e.target.value) } })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Line Animation Duration</label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={settings.animationSpeed.lineDuration}
              onChange={(e) => setSettings({ ...settings, animationSpeed: { ...settings.animationSpeed, lineDuration: Number(e.target.value) } })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">WiFi Animation Duration</label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={settings.animationSpeed.wifiDuration}
              onChange={(e) => setSettings({ ...settings, animationSpeed: { ...settings.animationSpeed, wifiDuration: Number(e.target.value) } })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Particle Animation Duration</label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={settings.animationSpeed.particleDuration}
              onChange={(e) => setSettings({ ...settings, animationSpeed: { ...settings.animationSpeed, particleDuration: Number(e.target.value) } })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
