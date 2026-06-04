'use client';

import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    image: '/assets/hero/camera.png',
    title: 'CCTV & Security Solutions',
    subtitle: 'Professional surveillance systems for homes and businesses',
    badge: 'Secure Your Property',
  },
  {
    id: 2,
    image: '/assets/hero/networking.png',
    title: 'Enterprise Networking',
    subtitle: 'High-performance routers, switches & Wi-Fi for your business',
    badge: 'Business Solutions',
  },
  {
    id: 3,
    image: '/assets/hero/inverter.png',
    title: 'Power Backup Systems',
    subtitle: 'Reliable inverters, UPS & batteries to keep you powered',
    badge: '24/7 Power',
  },
  {
    id: 4,
    image: '/assets/hero/combined.png',
    title: 'Complete IT Solutions',
    subtitle: 'Everything you need for networking, power & security',
    badge: 'Trusted by 500+ Businesses',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, []);

  const slide = slides[current];

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Background Image */}
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          console.error('Hero image failed:', slide.image);
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}
