'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Sparkles, Upload, X, Download } from 'lucide-react';
import Link from 'next/link';
import { createMarketingAd, uploadMarketingAdImage, type TemplateType, type ExportFormat } from '@/lib/marketing-ads-api';
import AdPreview from '@/components/marketing-ads/AdPreview';
import html2canvas from 'html2canvas';

export default function NewMarketingAdPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState<TemplateType>('powder_splash');
  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [brand, setBrand] = useState('');
  const [headline, setHeadline] = useState('');
  const [subheading, setSubheading] = useState('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('facebook_post');

  const handleDownload = async () => {
    if (!previewRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#000000',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${exportFormat}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download:', error);
      alert('Failed to download image');
    } finally {
      setDownloading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadMarketingAdImage(file);
      setProductImage(result.url);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      title,
      template,
      product: {
        productName,
        productImage,
        price,
        salePrice,
        brand,
      },
      headline,
      subheading,
      exportFormat,
    };
    console.log('Submitting data:', data);
    try {
      await createMarketingAd(data);
      router.push('/admin/marketing-ads');
    } catch (error) {
      console.error('Failed to create marketing ad:', error);
      alert('Failed to create marketing ad');
    } finally {
      setLoading(false);
    }
  };

  const templateLabels: Record<TemplateType, string> = {
    powder_splash: 'Powder Splash',
    neon_tech: 'Neon Tech',
    modern_gradient: 'Modern Gradient',
    premium_showcase: 'Premium Showcase',
    hero_banner: 'Hero Banner',
  };

  const exportFormatLabels: Record<ExportFormat, string> = {
    facebook_post: 'Facebook Post (1080x1080)',
    facebook_cover: 'Facebook Cover (1640x624)',
    instagram_post: 'Instagram Post (1080x1080)',
    instagram_story: 'Instagram Story (1080x1920)',
    website_hero: 'Website Hero (1920x1080)',
    whatsapp_promo: 'WhatsApp Promo (1200x1200)',
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/admin/marketing-ads"
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketing Ads
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">Create New Marketing Ad</h1>
        <p className="text-slate-400">Design a promotional advertisement for social media</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Ad Settings */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Ad Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Summer Sale 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Template</label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value as TemplateType)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {Object.entries(templateLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Export Format</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {Object.entries(exportFormatLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h2 className="text-lg font-semibold text-white mb-4">Product Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Mesh WiFi Router"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Product Image</label>
                  <div className="space-y-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:border-blue-500 transition-colors">
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </div>
                    </label>
                    {productImage && (
                      <div className="relative">
                        <img
                          src={productImage}
                          alt="Product preview"
                          className="w-full h-32 object-cover rounded-lg border border-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setProductImage('')}
                          className="absolute top-2 right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Price</label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="R1 425.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Sale Price</label>
                    <input
                      type="text"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="R1 125.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., TP-Link"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="space-y-6">
            {/* Marketing Content */}
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h2 className="text-lg font-semibold text-white mb-4">Marketing Content</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Eliminate Dead WiFi Areas In Your Home"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Subheading</label>
                  <textarea
                    value={subheading}
                    onChange={(e) => setSubheading(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="e.g., Seamless Mesh WiFi Coverage For Every Room"
                  />
                </div>
              </div>
            </div>

            {/* AI Generation */}
            <div className="bg-gradient-to-r from-violet-900/20 to-blue-900/20 rounded-lg p-6 border border-violet-800/50">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-white">AI Marketing Generator</h2>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Let AI generate marketing copy based on your product information
              </p>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Generate Marketing Copy
              </button>
            </div>

            {/* Preview */}
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Preview</h2>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {downloading ? 'Downloading...' : 'Download'}
                </button>
              </div>
              <div ref={previewRef}>
                <AdPreview
                  template={template}
                  productName={productName}
                  productImage={productImage}
                  price={price}
                  salePrice={salePrice}
                  brand={brand}
                  headline={headline}
                  subheading={subheading}
                  exportFormat={exportFormat}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/admin/marketing-ads"
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Ad'}
          </button>
        </div>
      </form>
    </div>
  );
}
