'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { getHeroSettings, HeroSettings } from '@/lib/hero-api';

/* Must match backend default in hero.service.ts — mismatch caused stretch-on-refresh */
const DEFAULT_HERO_HEIGHT = 'clamp(280px, 35vh, 400px)';
const HERO_HEIGHT_CACHE_KEY = 'bretunetech-hero-height';

function resolveHeight(settings?: HeroSettings | null): string {
  const h = settings?.height?.trim();
  return h || DEFAULT_HERO_HEIGHT;
}

function writeCachedHeroHeight(height: string) {
  try {
    localStorage.setItem(HERO_HEIGHT_CACHE_KEY, height);
  } catch {
    /* ignore */
  }
}

/* ── Networking Node Component ───────────────────────────────── */
interface NodeProps {
  x: number;
  y: number;
  size: string;
  delay: number;
  color: string;
}

const NetworkNode: React.FC<NodeProps> = ({ x, y, size, delay, color }) => {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${color}, ${color}40)`,
        boxShadow: `0 0 20px ${color}60, 0 0 40px ${color}30`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0.8, 1, 0.8],
        opacity: [0.6, 1, 0.6],
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

/* ── Connection Line Component ───────────────────────────────── */
interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ x1, y1, x2, y2, delay }) => {
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  return (
    <motion.div
      className="absolute origin-left"
      style={{
        left: `${x1}%`,
        top: `${y1}%`,
        width: `${length}%`,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #003d7a80, transparent)',
        transform: `rotate(${angle}deg)`,
      }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{
        scaleX: [0, 1, 0],
        opacity: [0, 0.6, 0],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

/* ── WiFi Signal Component ───────────────────────────────── */
const WiFiSignal: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1.5, 2],
        opacity: [0.8, 0.4, 0],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    >
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-orange-500/30"
          style={{
            width: `${i * 30}px`,
            height: `${i * 30}px`,
            left: `-${i * 15}px`,
            top: `-${i * 15}px`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1, 0] }}
          transition={{
            duration: 2,
            delay: delay + i * 0.2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </motion.div>
  );
};

/* ── Glowing Particle Component ───────────────────────────────── */
const Particle: React.FC<{ x: number; y: number; delay: number; size: string }> = ({ x, y, delay, size }) => {
  return (
    <motion.div
      className="absolute rounded-full bg-orange-400"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        boxShadow: '0 0 10px #f97316, 0 0 20px #f97316',
      }}
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 0],
        y: [0, -50, -100],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
};

interface PremiumHeroProps {
  /** Server-fetched settings — eliminates height flash on refresh */
  initialSettings?: HeroSettings | null;
}

/* ── Main Premium Hero Component ───────────────────────────────── */
const PremiumHero: React.FC<PremiumHeroProps> = ({ initialSettings = null }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -50]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const y3 = useTransform(scrollY, [0, 500], [0, -150]);

  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 });
  const springY2 = useSpring(y2, { stiffness: 100, damping: 30 });
  const springY3 = useSpring(y3, { stiffness: 100, damping: 30 });

  const initialHeight = resolveHeight(initialSettings);
  const [settings, setSettings] = useState<HeroSettings | null>(initialSettings);
  // Lock height from first paint — never change it after mount (prevents stretch → snap)
  const [heroHeight] = useState(initialHeight);
  // Particles use Math.random — generate only on client after mount to avoid hydration mismatch
  const [particles, setParticles] = useState<
    { x: number; y: number; delay: number; size: string }[]
  >([]);

  useEffect(() => {
    writeCachedHeroHeight(heroHeight);

    // If SSR already provided settings, only refresh content in background (height stays locked)
    getHeroSettings()
      .then((data) => {
        setSettings(data);
        writeCachedHeroHeight(resolveHeight(data));
      })
      .catch(() => {});
  }, [heroHeight]);

  useEffect(() => {
    if (!settings?.particleConfig) {
      setParticles([]);
      return;
    }
    const { count, sizeMin, sizeMax } = settings.particleConfig;
    setParticles(
      Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        size: `${Math.random() * (sizeMax - sizeMin) + sizeMin}px`,
      }))
    );
  }, [settings?.particleConfig]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: heroHeight, minHeight: heroHeight, maxHeight: heroHeight }}
    >
      {!settings ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#001a3d] via-[#003d7a] to-[#002244]" />
      ) : (
        <>
          {settings.backgroundColor ? (
            <div className="absolute inset-0" style={{ backgroundColor: settings.backgroundColor }} />
          ) : settings.backgroundImageUrl ? (
            <Image
              src={settings.backgroundImageUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0" style={{ background: settings.backgroundGradient }} />
          )}

          <motion.div style={{ y: springY3 }} className="absolute inset-0">
            {settings.nodes.slice(0, 4).map((node, i) => (
              <NetworkNode key={i} {...node} />
            ))}
          </motion.div>

          <motion.div style={{ y: springY2 }} className="absolute inset-0">
            {settings.nodes.slice(4, 8).map((node, i) => (
              <NetworkNode key={i + 4} {...node} />
            ))}
          </motion.div>

          <motion.div style={{ y: springY2 }} className="absolute inset-0">
            {settings.connectionLines.map((conn, i) => (
              <ConnectionLine key={i} {...conn} />
            ))}
          </motion.div>

          <motion.div style={{ y: springY1 }} className="absolute inset-0">
            {settings.wifiSignals.map((signal, i) => (
              <WiFiSignal key={i} {...signal} />
            ))}
          </motion.div>

          <motion.div style={{ y: springY3 }} className="absolute inset-0">
            {particles.map((p, i) => (
              <Particle key={i} {...p} />
            ))}
          </motion.div>

          <motion.div
            style={{ y: springY1 }}
            className="relative z-10 flex h-full w-full flex-col overflow-hidden px-2 py-4 sm:px-4 md:px-6 lg:px-8"
          >
            {settings.badge.visible && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`mb-2 w-full sm:mb-3 flex ${
                  settings.badge.position?.horizontal === 'left'
                    ? 'justify-start text-left'
                    : settings.badge.position?.horizontal === 'right'
                      ? 'justify-end text-right'
                      : 'justify-center text-center'
                }`}
              >
                <span className="max-w-[90vw] break-normal rounded-lg bg-orange-500/20 px-2 py-1 text-center text-[8px] font-semibold uppercase leading-tight text-orange-400 sm:px-4 sm:py-1.5 sm:text-xs">
                  {settings.badge.text}
                </span>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`mb-2 w-full sm:mb-3 flex ${
                settings.headlinePosition?.horizontal === 'left'
                  ? 'justify-start text-left'
                  : settings.headlinePosition?.horizontal === 'right'
                    ? 'justify-end text-right'
                    : 'justify-center text-center'
              }`}
            >
              <h1
                className="break-words px-2 text-base font-bold leading-tight text-white sm:px-0 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
              >
                {settings.headline}
                <br className="hidden sm:block" />
                <span className="text-orange-400">{settings.headlineHighlight}</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className={`mb-4 w-full sm:mb-5 flex ${
                settings.subheadlinePosition?.horizontal === 'left'
                  ? 'justify-start text-left'
                  : settings.subheadlinePosition?.horizontal === 'right'
                    ? 'justify-end text-right'
                    : 'justify-center text-center'
              }`}
            >
              <p
                className="max-w-full break-words px-3 text-[10px] text-gray-300 sm:max-w-2xl sm:px-0 sm:text-xs md:text-sm lg:text-base"
                style={{ textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}
              >
                {settings.subheadline}
              </p>
            </motion.div>

            {settings.contentImageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className={`mb-4 w-full sm:mb-5 flex ${
                  settings.contentImagePosition?.horizontal === 'left'
                    ? 'justify-start'
                    : settings.contentImagePosition?.horizontal === 'right'
                      ? 'justify-end'
                      : 'justify-center'
                }`}
              >
                <Image
                  src={settings.contentImageUrl}
                  alt=""
                  width={640}
                  height={256}
                  className="max-h-48 w-auto max-w-full rounded-lg object-contain sm:max-h-64"
                  // Only one LCP candidate: prefer background when present
                  priority={!settings.backgroundImageUrl}
                  loading={settings.backgroundImageUrl ? 'lazy' : undefined}
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className={`flex w-full flex-col items-center gap-2 px-2 sm:w-auto sm:flex-row sm:gap-3 sm:px-0 ${
                settings.ctaButtonsPosition?.horizontal === 'left'
                  ? 'justify-start sm:justify-start'
                  : settings.ctaButtonsPosition?.horizontal === 'right'
                    ? 'justify-end sm:justify-end'
                    : 'justify-center sm:justify-center'
              }`}
            >
              {settings.ctaButtons.map((cta, i) => (
                <Link
                  key={i}
                  href={cta.link}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all sm:px-6 sm:py-2.5 sm:text-sm ${
                    cta.style === 'primary'
                      ? 'bg-orange-500 text-white shadow-lg hover:bg-orange-600 hover:shadow-orange-500/30'
                      : 'border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
                  }`}
                >
                  {cta.text}
                </Link>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-4 flex flex-wrap justify-center gap-3 px-2 text-[9px] text-gray-400 sm:mt-6 sm:gap-4 sm:px-0 sm:text-[10px] md:text-xs"
            >
              {settings.trustIndicators
                .filter((t) => t.visible)
                .map((indicator, i) => (
                  <div key={i} className="flex items-center gap-1 sm:gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-green-400 sm:h-1.5 sm:w-1.5" />
                    <span className="whitespace-nowrap">{indicator.text}</span>
                  </div>
                ))}
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default PremiumHero;
