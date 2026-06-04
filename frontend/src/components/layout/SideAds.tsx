'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Ad {
  href: string;
  label: string;
  title: string;
  subtitle: string;
  cta: string;
  from: string;
  to: string;
  border: string;
  ctaBg: string;
  labelColor: string;
  subtitleColor: string;
  image?: string;
}

const leftAds: Ad[] = [
  {
    href: '/products?category=power-solutions',
    label: 'Flash Sale',
    title: '30% OFF',
    subtitle: 'Power Solutions',
    cta: 'Shop Now →',
    from: 'from-orange-500',
    to: 'to-orange-600',
    border: 'border-orange-200',
    ctaBg: 'bg-white/20',
    labelColor: 'text-orange-100',
    subtitleColor: 'text-orange-100',
    image: '/assets/hero/inverter.png',
  },
  {
    href: '/products?category=internet-networking',
    label: 'New Arrivals',
    title: 'MikroTik & Ubiquiti',
    subtitle: 'Latest Stock',
    cta: 'Browse →',
    from: 'from-[#003d7a]',
    to: 'to-blue-700',
    border: 'border-blue-200',
    ctaBg: 'bg-white/20',
    labelColor: 'text-blue-200',
    subtitleColor: 'text-blue-200',
    image: '/assets/hero/networking.png',
  },
  {
    href: '/bundles',
    label: 'Bundle Deals',
    title: 'Save More',
    subtitle: 'Kits & Packages',
    cta: 'View Bundles →',
    from: 'from-green-600',
    to: 'to-green-700',
    border: 'border-green-200',
    ctaBg: 'bg-white/20',
    labelColor: 'text-green-100',
    subtitleColor: 'text-green-100',
  },
];

const rightAds: Ad[] = [
  {
    href: '/contact',
    label: 'Custom Solution',
    title: 'Need a Custom Install?',
    subtitle: 'Design & Install',
    cta: 'Get Free Quote →',
    from: 'from-[#002855]',
    to: 'to-[#003d7a]',
    border: 'border-blue-900',
    ctaBg: 'bg-orange-500',
    labelColor: 'text-orange-300',
    subtitleColor: 'text-blue-200',
    image: '/assets/hero/installation.png',
  },
  {
    href: '/products?category=cameras',
    label: 'CCTV Systems',
    title: 'Security Cameras',
    subtitle: 'IP & Analog',
    cta: 'Browse →',
    from: 'from-purple-600',
    to: 'to-purple-700',
    border: 'border-purple-200',
    ctaBg: 'bg-white/20',
    labelColor: 'text-purple-200',
    subtitleColor: 'text-purple-200',
    image: '/assets/hero/camera.png',
  },
  {
    href: '/products',
    label: 'Free Delivery',
    title: 'Orders Over R2 000',
    subtitle: 'Nationwide',
    cta: 'Shop Now →',
    from: 'from-cyan-600',
    to: 'to-cyan-700',
    border: 'border-cyan-200',
    ctaBg: 'bg-white/20',
    labelColor: 'text-cyan-100',
    subtitleColor: 'text-cyan-100',
  },
];

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
        block rounded-xl overflow-hidden border ${ad.border}
        bg-gradient-to-b ${ad.from} ${ad.to}
        text-white text-center
        hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}
        ${pulse ? 'scale-[1.04] shadow-lg brightness-110' : ''}
      `}
      style={{ transitionProperty: 'opacity, transform, box-shadow, filter' }}
    >
      {ad.image && (
        <div className="relative w-full h-28 overflow-hidden">
          <Image
            src={ad.image}
            alt={ad.title}
            fill
            sizes="180px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${ad.from} opacity-40`} />
        </div>
      )}
      <div className={`px-3 ${ad.image ? 'py-3' : 'py-6'}`}>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${ad.labelColor}`}>
          {ad.label}
        </p>
        <p className="text-sm font-bold leading-tight">{ad.title}</p>
        <p className={`text-[10px] mt-1 font-medium ${ad.subtitleColor}`}>{ad.subtitle}</p>
        <p className={`text-[10px] mt-2 ${ad.ctaBg} rounded px-2 py-1 inline-block font-bold`}>
          {ad.cta}
        </p>
      </div>
    </a>
  );
}

export function LeftSideAds() {
  return (
    <aside className="hidden xl:flex flex-col gap-4 w-[180px] shrink-0 p-4 pt-5">
      {leftAds.map((ad, i) => (
        <AdBanner key={ad.label} ad={ad} delay={i * 200} />
      ))}
    </aside>
  );
}

export function RightSideAds() {
  return (
    <aside className="hidden xl:flex flex-col gap-4 w-[180px] shrink-0 p-4 pt-5">
      {rightAds.map((ad, i) => (
        <AdBanner key={ad.label} ad={ad} delay={300 + i * 200} />
      ))}
    </aside>
  );
}
