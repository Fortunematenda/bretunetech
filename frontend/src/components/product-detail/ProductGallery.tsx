'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Tag, ArrowLeft, Share2, Heart, Expand, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const touchStartX = useRef<number | null>(null);

  const images = product.images || [];
  const hasImages = images.length > 0 && images[0]?.url;
  const selectedUrl = images[selectedImage]?.url;

  const goPrev = () => {
    if (images.length < 2) return;
    setSelectedImage((i) => (i - 1 + images.length) % images.length);
  };
  const goNext = () => {
    if (images.length < 2) return;
    setSelectedImage((i) => (i + 1) % images.length);
  };

  const discountPct = product.originalPrice && product.sellingPrice && product.originalPrice > product.sellingPrice
    ? Math.round(((product.originalPrice - product.sellingPrice) / product.sellingPrice) * 100)
    : null;
  const badge = product.tags?.[0]?.tag || (product.condition === 'REFURBISHED' ? 'Refurbished' : null);

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

      {/* Main image — full-bleed on mobile (Takealot), bordered card on desktop */}
      <div className="relative flex-1 order-1 lg:order-2">
        <div
          className="relative flex w-full cursor-pointer items-center justify-center overflow-hidden bg-white aspect-square max-h-[85vw] lg:aspect-auto lg:h-[450px] lg:max-h-none lg:rounded-xl lg:border lg:border-slate-200"
          onClick={() => openLightbox(selectedImage)}
          onTouchStart={(e) => {
            touchStartX.current = e.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current == null || images.length < 2) return;
            const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(delta) < 40) return;
            if (delta > 0) goPrev();
            else goNext();
          }}
        >
          {hasImages && selectedUrl ? (
            <div className="relative flex h-full w-full items-center justify-center p-4 lg:p-4">
              <Image
                src={selectedUrl}
                alt={images[selectedImage]?.altText || product.name}
                width={800}
                height={600}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="max-h-full max-w-full object-contain"
                priority
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-8">
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#003d7a]/10 to-orange-400/10">
                <Tag className="h-10 w-10 text-slate-400" />
              </div>
              <span className="px-4 text-center text-sm text-slate-500">{product.name}</span>
            </div>
          )}

          {/* Badge */}
          {discountPct ? (
            <span className="absolute left-3 top-14 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-sm lg:left-4 lg:top-4">
              {discountPct}% OFF
            </span>
          ) : badge ? (
            <span className="absolute left-3 top-14 z-10 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-sm lg:left-4 lg:top-4">
              {badge}
            </span>
          ) : null}

          {/* Mobile top bar: back + share + wishlist */}
          <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-3 pt-3 lg:hidden">
            <Link
              href={returnUrl}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 shadow-md backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (navigator.share) {
                    void navigator.share({ title: product.name, url: window.location.href });
                  }
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 shadow-md backdrop-blur-sm"
              >
                <Share2 className="h-4 w-4 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist();
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-md backdrop-blur-sm transition-colors ${
                  isInWishlist ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white/90'
                }`}
              >
                <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current text-red-500' : 'text-slate-700'}`} />
              </button>
            </div>
          </div>

          {/* Expand hint on desktop */}
          <div className="absolute bottom-4 right-4 z-20 hidden items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1.5 text-[11px] font-medium text-white lg:flex">
            <Expand className="h-3.5 w-3.5" />
            Click to expand
          </div>

          {/* Mobile dots + counter — Takealot style */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Image ${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(i);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      i === selectedImage ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
              <span className="rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-medium text-white">
                {selectedImage + 1}/{images.length}
              </span>
            </div>
          )}
        </div>
      </div>

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
