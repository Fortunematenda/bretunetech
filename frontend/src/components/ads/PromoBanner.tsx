'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X, Wifi, Camera, Code, Shield, Phone, CheckCircle2, Zap, Server, ArrowRight, Sparkles } from 'lucide-react';

const slides = [
  {
    id: 'connect',
    bg: 'bg-[#003d7a]',
    title: 'Stay Connected. Stay Ahead.',
    subtitle: 'Fast, reliable internet for what matters most',
    cta: 'Get Connected',
    href: '/products?category=internet-networking',
    features: [
      { icon: Zap, label: 'Lightning Fast', desc: 'Up to 100Mbps' },
      { icon: Shield, label: 'Secure', desc: 'Protected network' },
      { icon: Server, label: 'Reliable', desc: '99.9% uptime' },
    ],
  },
  {
    id: 'services',
    bg: 'bg-[#003d7a]',
    title: 'Smart Solutions',
    subtitle: 'Professional services for your home & business',
    services: [
      { icon: Wifi, title: 'WiFi Setup', desc: 'Full coverage installation' },
      { icon: Camera, title: 'CCTV Systems', desc: '24/7 surveillance' },
      { icon: Code, title: 'Software Dev', desc: 'Custom solutions' },
    ],
    cta: 'View Services',
    href: '/services',
  },
  {
    id: 'promo',
    bg: 'bg-orange-500',
    badge: 'Limited Time Offer',
    title: '15/10 Mbps WiFi Package',
    price: 'R550',
    period: '/month',
    extras: [
      { label: 'Installation', value: 'R950 once-off' },
      { label: 'Speed', value: '15 Down / 10 Up' },
      { label: 'Support', value: '24/7 Included' },
    ],
    cta: 'Claim This Offer',
    href: '/services',
  },
  {
    id: 'contact',
    bg: 'bg-[#003d7a]',
    title: 'Ready to Get Started?',
    subtitle: 'Call or WhatsApp us today',
    phone: '061 268 5933',
    cta: 'Call Now',
    href: 'tel:0612685933',
  },
];

export default function PromoBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 4);
    }, 8000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goTo = (index: number) => setCurrentIndex(index);
  const next = () => setCurrentIndex((prev) => (prev + 1) % 4);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + 4) % 4);

  if (!isVisible) return null;

  const slide = slides[currentIndex];

  return (
    <div 
      className="relative w-full pointer-events-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Banner */}
      <div className={`relative ${slide.bg} rounded-2xl overflow-hidden shadow-2xl`}>
        <div className="px-6 py-6 md:px-10 md:py-8">
          {/* Slide 1: Connect */}
          {slide.id === 'connect' && (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {slide.title}
                </h2>
                <p className="text-blue-100 text-sm mb-4">{slide.subtitle}</p>
                <Link href={slide.href} className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full text-sm transition-all shadow-lg">
                  {slide.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex gap-3">
                {slide.features?.map((feature, idx) => (
                  <div key={idx} className="text-center bg-black/20 rounded-lg p-3 min-w-[85px] border border-white/10">
                    <feature.icon className="w-5 h-5 text-orange-400 mx-auto mb-1.5" />
                    <p className="text-white text-xs font-semibold">{feature.label}</p>
                    <p className="text-blue-200 text-[10px]">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 2: Services */}
          {slide.id === 'services' && (
            <div>
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white mb-1">{slide.title}</h2>
                <p className="text-blue-100 text-sm">{slide.subtitle}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {slide.services?.map((service, idx) => (
                  <div key={idx} className="bg-black/20 rounded-lg p-3 text-center hover:bg-black/30 transition-colors cursor-pointer group border border-white/10">
                    <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <service.icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-white text-xs font-bold mb-0.5">{service.title}</h3>
                    <p className="text-blue-200 text-[10px]">{service.desc}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link href={slide.href} className="inline-flex items-center gap-2 px-5 py-2 bg-white hover:bg-gray-100 text-[#003d7a] font-semibold rounded-full text-sm transition-colors">
                  {slide.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Slide 3: Promo */}
          {slide.id === 'promo' && (
            <div className="flex flex-col md:flex-row items-center gap-5">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full mb-2 border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span className="text-white text-xs font-semibold">{slide.badge}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{slide.title}</h2>
                <div className="flex flex-wrap gap-2">
                  {slide.extras?.map((extra, idx) => (
                    <div key={idx} className="bg-black/20 rounded-lg px-2.5 py-1 border border-white/10">
                      <p className="text-orange-200 text-[10px]">{extra.label}</p>
                      <p className="text-white text-xs font-semibold">{extra.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="mb-2">
                  <span className="text-4xl font-bold text-white">{slide.price}</span>
                  <span className="text-white/80 text-sm">{slide.period}</span>
                </div>
                <Link href={slide.href} className="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-100 text-orange-600 font-bold rounded-full text-sm transition-colors shadow-lg">
                  {slide.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Slide 4: Contact */}
          {slide.id === 'contact' && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-5">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{slide.title}</h2>
                <p className="text-blue-100 text-sm">{slide.subtitle}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-black/20 rounded-xl px-4 py-3 border border-white/10">
                  <div className="w-11 h-11 bg-orange-500 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{slide.phone}</p>
                    <p className="text-blue-200 text-xs">Tap to call</p>
                  </div>
                </div>
                <Link href={slide.href} className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full text-sm transition-all shadow-lg">
                  {slide.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <button
          type="button"
          onClick={prevSlide}
          className="p-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shadow-sm"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
        </button>
        
        {[0, 1, 2, 3].map((idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => goTo(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === currentIndex ? 'bg-[#003d7a] w-5' : 'bg-gray-300 w-1.5 hover:bg-gray-400'
            }`}
          />
        ))}
        
        <button
          type="button"
          onClick={next}
          className="p-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shadow-sm"
        >
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
