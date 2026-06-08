'use client';

import { useState, useEffect } from 'react';

const slides: any[] = [];

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
