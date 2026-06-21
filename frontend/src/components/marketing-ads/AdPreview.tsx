'use client';

import { useMemo, forwardRef } from 'react';
import { type TemplateType, type ExportFormat } from '@/lib/marketing-ads-api';

interface AdPreviewProps {
  template: TemplateType;
  productName: string;
  productImage?: string;
  price?: string;
  salePrice?: string;
  brand?: string;
  headline: string;
  subheading?: string;
  exportFormat: ExportFormat;
}

const exportDimensions: Record<ExportFormat, { width: number; height: number }> = {
  facebook_post: { width: 1080, height: 1080 },
  facebook_cover: { width: 1640, height: 624 },
  instagram_post: { width: 1080, height: 1080 },
  instagram_story: { width: 1080, height: 1920 },
  website_hero: { width: 1920, height: 1080 },
  whatsapp_promo: { width: 1200, height: 1200 },
};

export default function AdPreview({
  template,
  productName,
  productImage,
  price,
  salePrice,
  brand,
  headline,
  subheading,
  exportFormat,
}: AdPreviewProps) {
  const dimensions = exportDimensions[exportFormat];
  const scale = 0.3; // Scale down for preview

  const backgroundStyle = useMemo(() => {
    switch (template) {
      case 'powder_splash':
        return {
          background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
        };
      case 'neon_tech':
        return {
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        };
      case 'modern_gradient':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        };
      case 'premium_showcase':
        return {
          background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        };
      case 'hero_banner':
        return {
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        };
      default:
        return {
          background: '#000000',
        };
    }
  }, [template]);

  const textColor = '#ffffff';
  const subtextColor = 'rgba(255, 255, 255, 0.9)';
  const priceColor = '#fb923c';
  const brandColor = 'rgba(255, 255, 255, 0.8)';

  const discount = useMemo(() => {
    if (!price || !salePrice) return null;
    const priceNum = parseFloat(price.replace(/[^0-9.]/g, ''));
    const saleNum = parseFloat(salePrice.replace(/[^0-9.]/g, ''));
    if (!priceNum || !saleNum) return null;
    return Math.round(((priceNum - saleNum) / priceNum) * 100);
  }, [price, salePrice]);

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          position: 'relative',
          margin: '0 auto',
          overflow: 'hidden',
          borderRadius: '8px',
          width: dimensions.width * scale,
          height: dimensions.height * scale,
          ...backgroundStyle,
        }}
      >
        {/* Product Image */}
        {productImage && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
            <img
              src={productImage}
              alt={productName}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.25))' }}
            />
          </div>
        )}

        {/* Content Overlay */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%, rgba(0,0,0,0.6) 100%)' }}>
          {/* Top - Brand */}
          {brand && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: brandColor, fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {brand}
              </span>
            </div>
          )}

          {/* Middle - Headline */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 style={{ color: textColor, fontSize: `${24 * scale}px`, fontWeight: 700, lineHeight: 1.2 }}>
              {headline}
            </h2>
            {subheading && (
              <p style={{ color: subtextColor, fontSize: `${14 * scale}px`, lineHeight: 1.4 }}>
                {subheading}
              </p>
            )}
          </div>

          {/* Bottom - Pricing */}
          {(price || salePrice) && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {salePrice && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ color: priceColor, fontSize: `${28 * scale}px`, fontWeight: 700 }}>
                    {salePrice}
                  </span>
                  {discount && (
                    <span style={{ backgroundColor: '#f97316', color: '#ffffff', fontSize: '12px', padding: '4px 8px', borderRadius: '9999px' }}>
                      -{discount}%
                    </span>
                  )}
                </div>
              )}
              {price && (
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: `${16 * scale}px`, textDecoration: 'line-through' }}>
                  Was {price}
                </div>
              )}
            </div>
          )}
        </div>

        {/* BretuneTech Branding */}
        <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'linear-gradient(to bottom right, #8b5cf6, #6d28d9)' }} />
          <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>BretuneTech</span>
        </div>
      </div>

      {/* Format Label */}
      <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
        {exportFormat.replace('_', ' ').toUpperCase()} ({dimensions.width}x{dimensions.height})
      </div>
    </div>
  );
}
