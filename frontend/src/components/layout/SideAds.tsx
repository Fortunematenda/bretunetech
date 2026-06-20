'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchActiveAds } from '@/lib/ads-cache';

interface Ad {
  href: string;
  label: string;
  title: string;
  subtitle: string;
  cta: string;
  backgroundColor: string;
  titleColor?: string;
  labelColor?: string;
  subtitleColor?: string;
  ctaBgColor?: string;
  ctaTextColor?: string;
  image?: string;
  price?: string;
  period?: string;
  phone?: string;
}

const defaultLeftAds: Ad[] = [];
const defaultRightAds: Ad[] = [];

function AdBanner({ ad, delay = 0 }: { ad: Ad; delay?: number }) {
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Initial pop-in with stagger
    const enterTimer = setTimeout(() => setVisible(true), delay);

    // Pulse every 4 seconds
    const pulseInterval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 4000 + delay);

    return () => {
      clearTimeout(enterTimer);
      clearInterval(pulseInterval);
    };
  }, [delay]);

  return (
    <a
      href={ad.href}
      className={`
        relative block rounded-xl overflow-hidden border border-white/20
        text-white text-center
        hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}
        ${pulse ? 'scale-[1.04] shadow-lg brightness-110' : ''}
      `}
      style={{ transitionProperty: 'opacity, transform, box-shadow, filter' }}
    >
      {/* Ad label badge */}
      <span className="absolute top-2 right-2 z-10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-black/50 text-white/70 border border-white/20 leading-none">
        Ad
      </span>
      {ad.image && (
        <div className="relative w-full h-36 overflow-hidden">
          <Image
            src={ad.image}
            alt={ad.title}
            fill
            sizes="220px"
            className="object-cover object-center transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}
      <div
        className={`px-3 ${ad.image ? 'py-3' : 'py-6'}`}
        style={{ background: ad.backgroundColor }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-1"
          style={{ color: ad.labelColor || 'rgba(255,255,255,0.9)' }}
        >
          {ad.label}
        </p>
        <p
          className="text-sm font-bold leading-tight"
          style={{ color: ad.titleColor || '#ffffff' }}
        >
          {ad.title}
        </p>
        <p
          className="text-[10px] mt-1 font-medium"
          style={{ color: ad.subtitleColor || 'rgba(255,255,255,0.8)' }}
        >
          {ad.subtitle}
        </p>
        {(ad.price || ad.phone) && (
          <div className="mt-2 space-y-0.5">
            {ad.price && (
              <p className="text-base font-extrabold" style={{ color: ad.titleColor || '#ffffff' }}>
                {ad.price}{ad.period && <span className="text-[10px] font-normal opacity-70 ml-1">{ad.period}</span>}
              </p>
            )}
            {ad.phone && (
              <p className="text-[11px] font-semibold" style={{ color: ad.titleColor || 'rgba(255,255,255,0.9)' }}>{ad.phone}</p>
            )}
          </div>
        )}
        {ad.cta && (
          <p
            className="text-[10px] mt-2 rounded px-2 py-1 inline-block font-bold"
            style={{
              backgroundColor: ad.ctaBgColor || 'rgba(255,255,255,0.2)',
              color: ad.ctaTextColor || '#ffffff',
            }}
          >
            {ad.cta}
          </p>
        )}
      </div>
    </a>
  );
}

export function LeftSideAds() {
  const [leftAds, setLeftAds] = useState<Ad[]>(defaultLeftAds);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveAds()
      .then((ads) => {
        const sideAds = ads.filter((ad: any) => ad.type === 'side-left');
        if (sideAds.length > 0) {
          setLeftAds(sideAds.map((ad: any) => ({
            href: ad.href || '/products',
            label: ad.badge || 'Promo',
            title: ad.title || 'Special Offer',
            subtitle: ad.subtitle || '',
            cta: ad.cta || '',
            backgroundColor: ad.backgroundColor || '#003d7a',
            titleColor: ad.textColor || '',
            labelColor: ad.subtitleColor || '',
            subtitleColor: ad.descriptionColor || '',
            ctaBgColor: ad.ctaBgColor || '',
            ctaTextColor: ad.ctaTextColor || '',
            image: ad.imageUrl,
            price: ad.price,
            period: ad.period,
            phone: ad.phone,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <aside className="hidden xl:flex flex-col gap-4 w-[220px] shrink-0 p-2 pt-5">
      {leftAds.map((ad, i) => (
        <AdBanner key={`${ad.label}-${i}`} ad={ad} delay={i * 200} />
      ))}
    </aside>
  );
}

export function RightSideAds() {
  const [rightAds, setRightAds] = useState<Ad[]>(defaultRightAds);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveAds()
      .then((ads) => {
        const sideAds = ads.filter((ad: any) => ad.type === 'side-right');
        if (sideAds.length > 0) {
          setRightAds(sideAds.map((ad: any) => ({
            href: ad.href || '/products',
            label: ad.badge || 'Promo',
            title: ad.title || 'Special Offer',
            subtitle: ad.subtitle || '',
            cta: ad.cta || '',
            backgroundColor: ad.backgroundColor || '#003d7a',
            titleColor: ad.textColor || '',
            labelColor: ad.subtitleColor || '',
            subtitleColor: ad.descriptionColor || '',
            ctaBgColor: ad.ctaBgColor || '',
            ctaTextColor: ad.ctaTextColor || '',
            image: ad.imageUrl,
            price: ad.price,
            period: ad.period,
            phone: ad.phone,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <aside className="hidden xl:flex flex-col gap-4 w-[220px] shrink-0 p-2 pt-5">
      {rightAds.map((ad, i) => (
        <AdBanner key={`${ad.label}-${i}`} ad={ad} delay={300 + i * 200} />
      ))}
    </aside>
  );
}
