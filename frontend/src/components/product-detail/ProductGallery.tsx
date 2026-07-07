'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Tag, ArrowLeft, Share2, Heart, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ProductGalleryProps {
  product: {
    id: string;
    name: string;
    slug: string;
    images: { url: string; altText?: string }[];
    originalPrice?: number;
    sellingPrice: number;
    condition: string;
    tags?: { tag: string }[];
  };
  returnUrl: string;
  isInWishlist: boolean;
  onToggleWishlist: () => void;
}

const THUMBNAIL_LABELS = ['Front', 'Back', 'Side', 'Detail', 'Accessory', 'Other'];

export default function ProductGallery({
  product,
  returnUrl,
  isInWishlist,
  onToggleWishlist,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const images = product.images || [];
  const hasImages = images.length > 0 && images[0]?.url;
  const selectedUrl = images[selectedImage]?.url;

  const discountPct = product.originalPrice && product.sellingPrice && product.originalPrice > product.sellingPrice
    ? Math.round(((product.originalPrice - product.sellingPrice) / product.sellingPrice) * 100)
    : null;
  const badge = product.tags?.[0]?.tag || (product.condition === 'REFURBISHED' ? 'Refurbished' : null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const openLightbox = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!hasImages) return;
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
      {/* Vertical thumbnails — desktop */}
      {images.length > 1 && (
        <div className="hidden lg:flex flex-col gap-2.5 order-2 lg:order-1 lg:w-[72px] shrink-0 overflow-y-auto max-h-[420px] scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all bg-white w-[72px] h-[72px] ${
                selectedImage === i
                  ? 'border-[#003d7a] ring-1 ring-[#003d7a]/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="relative w-full h-full">
                {img.url ? (
                  <Image
                    src={img.url}
                    alt={img.altText || `${product.name} ${THUMBNAIL_LABELS[i] || 'image'}`}
                    fill
                    sizes="72px"
                    className="object-contain object-center p-1"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 order-1 lg:order-2">
        <div
          className="bg-white border border-slate-200 rounded-xl w-full relative overflow-hidden cursor-zoom-in flex items-center justify-center group h-[350px] lg:h-[450px]"
          onClick={() => openLightbox(selectedImage)}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          {hasImages && selectedUrl ? (
            <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-4">
              <Image
                src={selectedUrl}
                alt={images[selectedImage]?.altText || product.name}
                width={800}
                height={600}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain max-w-full max-h-full transition-transform duration-300"
                priority
                unoptimized
              />
              {/* Zoom overlay on desktop hover */}
              <div
                className="hidden lg:block absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  backgroundImage: `url(${selectedUrl})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: '220%',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8">
              <div className="w-20 h-20 mb-3 bg-gradient-to-br from-[#003d7a]/10 to-orange-400/10 rounded-2xl flex items-center justify-center">
                <Tag className="w-10 h-10 text-slate-400" />
              </div>
              <span className="text-sm text-slate-500 text-center px-4">{product.name}</span>
            </div>
          )}

          {/* Badge */}
          {discountPct ? (
            <span className="absolute top-3 left-3 sm:top-4 sm:left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm z-10">
              {discountPct}% OFF
            </span>
          ) : badge ? (
            <span className="absolute top-3 left-3 sm:top-4 sm:left-4 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full shadow-sm z-10">
              {badge}
            </span>
          ) : null}

          {/* Mobile top bar: back + share + wishlist */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-3 sm:hidden z-20">
            <Link
              href={returnUrl}
              className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); if (navigator.share) { navigator.share({ title: product.name, url: window.location.href }); } }}
                className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-slate-200"
              >
                <Share2 className="w-4 h-4 text-slate-700" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleWishlist(); }}
                className={`w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border transition-colors ${
                  isInWishlist ? 'bg-red-50 border-red-200' : 'bg-white/90 border-slate-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'text-red-500 fill-current' : 'text-slate-700'}`} />
              </button>
            </div>
          </div>

          {/* Zoom hint on desktop */}
          <div className="hidden lg:flex absolute bottom-4 right-4 items-center gap-1.5 px-2.5 py-1.5 bg-black/50 text-white text-[11px] font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <ZoomIn className="w-3.5 h-3.5" />
            Click to expand
          </div>

          {/* Mobile image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2 sm:hidden z-20">
              <span className="bg-black/50 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
                {selectedImage + 1} / {images.length}
              </span>
              <button
                onClick={(e) => openLightbox(selectedImage, e)}
                className="w-7 h-7 bg-black/50 rounded-full flex items-center justify-center"
              >
                <ZoomIn className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal thumbnails — mobile/tablet */}
      {images.length > 1 && (
        <div className="flex lg:hidden gap-2 overflow-x-auto pb-1 scrollbar-hide order-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all bg-white ${
                selectedImage === i
                  ? 'border-[#003d7a] ring-1 ring-[#003d7a]/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                {!img.url.startsWith('/images/') ? (
                  <Image
                    src={img.url}
                    alt={img.altText || `${product.name} ${THUMBNAIL_LABELS[i] || 'image'}`}
                    fill
                    sizes="80px"
                    className="object-contain object-center p-1"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && hasImages && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 z-10 text-white bg-slate-800 hover:bg-slate-700 rounded-full p-2.5 transition-colors shadow-xl border border-white/20"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
          >
            <X className="w-6 h-6" />
          </button>

          {images.length > 1 && (
            <button
              className="absolute left-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + images.length) % images.length); }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <Image
            src={images[lightboxIndex]?.url}
            alt={images[lightboxIndex]?.altText || product.name}
            width={1200}
            height={1200}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              className="absolute right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % images.length); }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-colors ${i === lightboxIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                />
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
