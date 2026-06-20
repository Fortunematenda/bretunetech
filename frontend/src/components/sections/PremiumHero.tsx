'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { getHeroSettings, HeroSettings } from '@/lib/hero-api';

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

/* ── Main Premium Hero Component ───────────────────────────────── */
const PremiumHero: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -50]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const y3 = useTransform(scrollY, [0, 500], [0, -150]);

  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 });
  const springY2 = useSpring(y2, { stiffness: 100, damping: 30 });
  const springY3 = useSpring(y3, { stiffness: 100, damping: 30 });

  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHeroSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Generate particles based on settings
  const particles = settings
    ? Array.from({ length: settings.particleConfig.count }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        size: `${Math.random() * (settings.particleConfig.sizeMax - settings.particleConfig.sizeMin) + settings.particleConfig.sizeMin}px`,
      }))
    : [];

  if (loading || !settings) {
    return (
      <div className="relative w-full overflow-hidden" style={{ height: 'clamp(600px, 70vh, 800px)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#001a3d] via-[#003d7a] to-[#002244]" />
      </div>
    );
  }

  return (
    <motion.div
      style={{ y: springY1, height: settings.height || 'clamp(600px, 70vh, 800px)' }}
      className="relative w-full overflow-hidden"
    >
      {/* Background - image or gradient */}
      {settings.backgroundImageUrl ? (
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `url(${settings.backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: settings.backgroundGradient }} />
      )}

      {/* Parallax layer 1 - Background nodes */}
      <motion.div style={{ y: springY3 }} className="absolute inset-0">
        {settings.nodes.slice(0, 4).map((node, i) => (
          <NetworkNode key={i} {...node} />
        ))}
      </motion.div>

      {/* Parallax layer 2 - Mid nodes */}
      <motion.div style={{ y: springY2 }} className="absolute inset-0">
        {settings.nodes.slice(4, 8).map((node, i) => (
          <NetworkNode key={i + 4} {...node} />
        ))}
      </motion.div>

      {/* Connection lines */}
      <motion.div style={{ y: springY2 }} className="absolute inset-0">
        {settings.connectionLines.map((conn, i) => (
          <ConnectionLine key={i} {...conn} />
        ))}
      </motion.div>

      {/* WiFi signals */}
      <motion.div style={{ y: springY1 }} className="absolute inset-0">
        {settings.wifiSignals.map((signal, i) => (
          <WiFiSignal key={i} {...signal} />
        ))}
      </motion.div>

      {/* Glowing particles */}
      <motion.div style={{ y: springY3 }} className="absolute inset-0">
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
      </motion.div>

      {/* Main content */}
      <motion.div
        style={{ y: springY1 }}
        className="relative z-10 flex flex-col items-center justify-center h-full px-2 sm:px-4 md:px-6 lg:px-8 text-center w-full overflow-visible py-4"
      >
        {/* Enterprise badge */}
        {settings.badge.visible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-2 sm:mb-3 w-full flex justify-center overflow-visible"
          >
            <span className="px-2 py-1 sm:px-4 sm:py-1.5 rounded-lg bg-orange-500/20 text-orange-400 text-[8px] sm:text-xs font-semibold uppercase text-center leading-tight break-normal max-w-[90vw]">
              {settings.badge.text}
            </span>
          </motion.div>
        )}

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-2 sm:mb-3 leading-tight px-2 sm:px-0 break-words"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
          {settings.headline}
          <br className="hidden sm:block" />
          <span className="text-orange-400">{settings.headlineHighlight}</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-300 mb-4 sm:mb-5 max-w-full sm:max-w-2xl px-3 sm:px-0 break-words"
          style={{ textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}
        >
          {settings.subheadline}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-2 sm:gap-3 px-2 sm:px-0 w-full sm:w-auto"
        >
          {settings.ctaButtons.map((cta, i) => (
            <Link
              key={i}
              href={cta.link}
              className={`px-4 py-2 sm:px-6 sm:py-2.5 font-semibold rounded-lg transition-all text-xs sm:text-sm ${
                cta.style === 'primary'
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-orange-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm'
              }`}
            >
              {cta.text}
            </Link>
          ))}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-3 sm:gap-4 text-gray-400 text-[9px] sm:text-[10px] md:text-xs px-2 sm:px-0"
        >
          {settings.trustIndicators.filter(t => t.visible).map((indicator, i) => (
            <div key={i} className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-400" />
              <span className="whitespace-nowrap">{indicator.text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PremiumHero;
