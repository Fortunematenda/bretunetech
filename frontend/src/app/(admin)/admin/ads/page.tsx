'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, RefreshCw, Edit2, X, Check, Trash2, Eye, EyeOff, Upload, ArrowRight, Wifi, Camera, Code, Shield, Phone, Zap, Server, Sparkles, Search } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

/* ── Product picker for hero slides ─────────────────────────── */
function SlideProductPicker({ selected, onChange }: {
  selected: Array<{ id: string; name: string; image: string; slug: string }>;
  onChange: (products: Array<{ id: string; name: string; image: string; slug: string }>) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSearching(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/products?search=${encodeURIComponent(query)}&limit=8`)
        .then(r => r.ok ? r.json() : {} as any)
        .then((d: any) => setResults((d.products || d.data || [])))
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 300);
  }, [query]);

  const add = (p: any) => {
    if (selected.length >= 3) return;
    if (selected.find(s => s.id === p.id)) return;
    onChange([...selected, { id: p.id, name: p.name, image: p.images?.[0]?.url || '', slug: p.slug }]);
    setQuery('');
    setResults([]);
  };

  const remove = (id: string) => onChange(selected.filter(s => s.id !== id));

  return (
    <div className="space-y-2">
      {/* Selected products */}
      {selected.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {selected.map((p, i) => (
            <div key={p.id} className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-2 py-1 border border-slate-700">
              {p.image && <img src={p.image} alt={p.name} className="w-7 h-7 rounded object-contain bg-white/5" />}
              <span className="text-[11px] text-white max-w-[100px] truncate">{p.name}</span>
              <span className="text-[9px] text-slate-500 font-bold">#{i+1}</span>
              <button type="button" onClick={() => remove(p.id)} className="text-slate-500 hover:text-red-400 ml-0.5"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}
      {/* Search input */}
      {selected.length < 3 && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search products to pin..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-6 pr-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-violet-500"
          />
          {searching && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500">…</span>}
        </div>
      )}
      {/* Results dropdown */}
      {results.length > 0 && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
          {results.map(p => {
            const alreadyAdded = !!selected.find(s => s.id === p.id);
            return (
              <button
                key={p.id}
                type="button"
                disabled={alreadyAdded || selected.length >= 3}
                onClick={() => add(p)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-slate-800 transition-colors ${
                  alreadyAdded ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                {p.images?.[0]?.url
                  ? <img src={p.images[0].url} alt={p.name} className="w-8 h-8 rounded object-contain bg-white/5 shrink-0" />
                  : <div className="w-8 h-8 rounded bg-slate-700 shrink-0" />}
                <div className="min-w-0">
                  <p className="text-xs text-white truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-500">{p.sellingPrice ? `R${p.sellingPrice}` : ''}</p>
                </div>
                {alreadyAdded && <Check className="w-3 h-3 text-green-400 ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
      {selected.length >= 3 && <p className="text-[10px] text-slate-600">Max 3 products selected. Remove one to swap.</p>}
    </div>
  );
}

const GRADIENT_PRESETS = [
  { label: 'Blue',     value: 'linear-gradient(135deg, #1a56db 0%, #1e3a8a 100%)' },
  { label: 'Ocean',    value: 'linear-gradient(135deg, #003d7a 0%, #001629 100%)' },
  { label: 'Sky',      value: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)' },
  { label: 'Teal',     value: 'linear-gradient(135deg, #0891b2 0%, #155e75 100%)' },
  { label: 'Emerald',  value: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)' },
  { label: 'Forest',   value: 'linear-gradient(135deg, #16a34a 0%, #065f46 100%)' },
  { label: 'Amber',    value: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)' },
  { label: 'Fire',     value: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' },
  { label: 'Rose',     value: 'linear-gradient(135deg, #be123c 0%, #9f1239 100%)' },
  { label: 'Pink',     value: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)' },
  { label: 'Violet',   value: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' },
  { label: 'Midnight', value: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' },
  { label: 'Sunset',   value: 'linear-gradient(135deg, #f97316 0%, #9333ea 100%)' },
  { label: 'Slate',    value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
  { label: 'Charcoal', value: 'linear-gradient(135deg, #374151 0%, #111827 100%)' },
  { label: 'Gold',     value: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)' },
  { label: 'Cyan',     value: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)' },
  { label: 'Indigo',   value: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)' },
];

const DIRECTIONS = [
  { label: '→',  value: 'to right' },
  { label: '↓',  value: 'to bottom' },
  { label: '↗',  value: '135deg' },
  { label: '↘',  value: '45deg' },
  { label: '↙',  value: 'to bottom left' },
  { label: '↖',  value: 'to top left' },
];

function GradientPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parse = (v: string) => {
    const dirMatch = v.match(/linear-gradient\(\s*([^,]+?)\s*,/);
    const colorsMatch = v.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g);
    return {
      dir: dirMatch?.[1]?.trim() || '135deg',
      from: colorsMatch?.[0] || '#003d7a',
      to: colorsMatch?.[1] || '#001629',
    };
  };

  const parsed = parse(value);
  const [dir, setDir] = useState(parsed.dir);
  const [from, setFrom] = useState(parsed.from);
  const [to, setTo] = useState(parsed.to);

  /* Re-sync when the value prop changes from outside (e.g. switching slides) */
  useEffect(() => {
    const p = parse(value);
    setDir(p.dir);
    setFrom(p.from);
    setTo(p.to);
  }, [value]);

  const build = (d: string, f: string, t: string) => `linear-gradient(${d}, ${f} 0%, ${t} 100%)`;

  const applyDir = (d: string) => { setDir(d); onChange(build(d, from, to)); };
  const applyFrom = (f: string) => { setFrom(f); onChange(build(dir, f, to)); };
  const applyTo = (t: string) => { setTo(t); onChange(build(dir, from, t)); };
  const applyPreset = (v: string) => {
    const p = parse(v);
    setDir(p.dir); setFrom(p.from); setTo(p.to);
    onChange(v);
  };

  const preview = build(dir, from, to);

  return (
    <div className="space-y-3">
      {/* Presets */}
      <div className="grid grid-cols-6 gap-1.5">
        {GRADIENT_PRESETS.map((p) => (
          <button key={p.label} type="button" title={p.label}
            onClick={() => applyPreset(p.value)}
            className={`h-8 rounded-lg border-2 transition-all ${
              value === p.value ? 'border-violet-400 scale-105' : 'border-transparent hover:border-white/30'
            }`}
            style={{ background: p.value }}
          />
        ))}
      </div>
      {/* Custom builder */}
      <div className="bg-slate-900 rounded-lg p-3 space-y-3">
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Custom</p>
        {/* Direction */}
        <div className="flex gap-1.5 flex-wrap">
          {DIRECTIONS.map((d) => (
            <button key={d.value} type="button"
              onClick={() => applyDir(d.value)}
              className={`w-8 h-8 rounded text-sm font-bold transition-colors ${
                dir === d.value ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}>
              {d.label}
            </button>
          ))}
        </div>
        {/* Color stops */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 flex-1">
            <input type="color" value={from.startsWith('#') ? from : '#003d7a'}
              onChange={(e) => applyFrom(e.target.value)}
              className="h-8 w-10 bg-slate-950 border border-slate-800 rounded cursor-pointer shrink-0" />
            <input type="text" value={from}
              onChange={(e) => applyFrom(e.target.value)}
              className="flex-1 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-violet-500 min-w-0" />
          </div>
          <span className="text-slate-600 text-xs shrink-0">→</span>
          <div className="flex items-center gap-1.5 flex-1">
            <input type="color" value={to.startsWith('#') ? to : '#001629'}
              onChange={(e) => applyTo(e.target.value)}
              className="h-8 w-10 bg-slate-950 border border-slate-800 rounded cursor-pointer shrink-0" />
            <input type="text" value={to}
              onChange={(e) => applyTo(e.target.value)}
              className="flex-1 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-violet-500 min-w-0" />
          </div>
        </div>
        {/* Live preview */}
        <div className="h-10 rounded-lg border border-slate-700" style={{ background: preview }} />
      </div>
    </div>
  );
}

function AdPreview({ ad }: { ad: any }) {
  const isSide = ad.type === 'side-left' || ad.type === 'side-right';
  const isHero = ad.type === 'hero';
  const bgStyle = ad.backgroundColor
    ? { background: ad.backgroundColor }
    : { backgroundColor: '#003d7a' };

  /* ── Side ad preview (matches SideAds.tsx AdBanner exactly) ── */
  if (isSide) {
    return (
      <div className="max-w-[220px] mx-auto">
        <p className="text-[10px] text-slate-500 text-center mb-2 uppercase tracking-wider">Side Ad Preview (220px wide)</p>
        <div className="rounded-xl overflow-hidden border border-white/20 text-white text-center shadow-xl">
          {ad.imageUrl && (
            <div className="relative w-full h-36 overflow-hidden">
              <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover object-center" />
            </div>
          )}
          <div className={`px-3 ${ad.imageUrl ? 'py-3' : 'py-6'}`} style={bgStyle}>
            {ad.badge && (
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
                style={{ color: ad.subtitleColor || 'rgba(255,255,255,0.9)' }}>
                {ad.badge}
              </p>
            )}
            <p className="text-sm font-bold leading-tight" style={{ color: ad.textColor || '#ffffff' }}>
              {ad.title}
            </p>
            <p className="text-[10px] mt-1 font-medium" style={{ color: ad.descriptionColor || 'rgba(255,255,255,0.8)' }}>
              {ad.subtitle}
            </p>
            {(ad.price || ad.phone) && (
              <div className="mt-2 space-y-0.5">
                {ad.price && (
                  <p className="text-base font-extrabold" style={{ color: ad.textColor || '#ffffff' }}>
                    {ad.price}{ad.period && <span className="text-[10px] font-normal opacity-70 ml-1">{ad.period}</span>}
                  </p>
                )}
                {ad.phone && <p className="text-[11px] font-semibold" style={{ color: ad.textColor || 'rgba(255,255,255,0.9)' }}>{ad.phone}</p>}
              </div>
            )}
            {ad.cta && (
              <p className="text-[10px] mt-2 rounded px-2 py-1 inline-block font-bold"
                style={{ backgroundColor: ad.ctaBgColor || 'rgba(255,255,255,0.2)', color: ad.ctaTextColor || '#ffffff' }}>
                {ad.cta}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Hero banner preview ── */
  if (isHero) {
    const heroBgImage = ad.imageUrl || '';
    const outerStyle: React.CSSProperties = heroBgImage
      ? { backgroundImage: `url(${heroBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : bgStyle;
    const slides: any[] = ad.heroSlides || [];
    const slide = slides[0];
    const cardAccent = ad.cardAccentColor || ad.ctaBgColor || '#f97316';
    return (
      <div>
        <p className="text-[10px] text-slate-500 text-center mb-2 uppercase tracking-wider">Hero Banner Preview</p>
        <div className="relative rounded-xl overflow-hidden" style={{ ...outerStyle, minHeight: '160px' }}>
          {heroBgImage && <div className="absolute inset-0 bg-black/55" />}
          {!heroBgImage && !ad.backgroundColor && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#001629] via-[#002347] to-[#001020]" />
          )}
          <div className="relative z-10 p-5 flex gap-4">
            {/* Left text */}
            <div className="flex-1 space-y-2">
              {ad.badge && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase"
                  style={{ backgroundColor: ad.eyebrowBgColor || 'rgba(249,115,22,0.1)', color: ad.eyebrowTextColor || '#fb923c', borderColor: ad.eyebrowBorderColor || 'rgba(249,115,22,0.4)' }}>
                  <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: ad.eyebrowTextColor || '#fb923c' }} />
                  {ad.badge}
                </div>
              )}
              <div>
                <p className="text-base font-extrabold leading-tight" style={{ color: ad.textColor || '#ffffff' }}>{ad.heroTitle || ad.title}</p>
                <p className="text-sm font-extrabold" style={{ color: ad.subtitleColor || cardAccent }}>{ad.heroSubtitle || ad.subtitle}</p>
              </div>
              <div className="flex gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-[10px] font-bold"
                  style={{ backgroundColor: ad.ctaBgColor || '#f97316', color: ad.ctaTextColor || '#ffffff' }}>
                  {ad.heroCtaText || 'Shop Now'}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-[10px] font-semibold border"
                  style={{ backgroundColor: ad.secondaryBgColor || 'rgba(255,255,255,0.1)', color: ad.secondaryTextColor || '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
                  {ad.heroQuoteText || 'Get a Quote'}
                </span>
              </div>
            </div>
            {/* Right slide card */}
            {slide && (
              <div className="w-32 rounded-xl overflow-hidden flex flex-col shrink-0"
                style={{ backgroundColor: ad.cardBgColor || 'rgba(255,255,255,0.05)', border: `1px solid ${ad.cardBorderColor || 'rgba(255,255,255,0.1)'}` }}>
                <div className="h-1 w-full" style={{ background: cardAccent }} />
                <div className="p-2 text-center flex flex-col items-center gap-1">
                  {slide.badge && (
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full border"
                      style={{ backgroundColor: ad.slideBadgeBgColor || `${cardAccent}33`, color: ad.slideBadgeTextColor || cardAccent, borderColor: ad.slideBadgeBorderColor || `${cardAccent}55` }}>
                      {slide.badge}
                    </span>
                  )}
                  {slide.image && <img src={slide.image} className="w-12 h-12 object-contain" alt={slide.name} />}
                  <p className="text-[9px] font-bold leading-tight" style={{ color: ad.cardNameColor || '#ffffff' }}>{slide.name}</p>
                  {slide.price && <p className="text-[9px] font-semibold" style={{ color: ad.cardPriceColor || cardAccent }}>From {slide.price}</p>}
                  {slide.link && (
                    <span className="text-[8px] px-2 py-0.5 rounded font-semibold"
                      style={{ backgroundColor: ad.cardBtnBgColor || cardAccent, color: ad.cardBtnTextColor || '#ffffff' }}>
                      View
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Generic ad preview ── */
  const iconMap: any = { Wifi, Camera, Code, Shield, Phone, Zap, Server };
  const features = ad.features || [];
  const services = ad.services || [];
  const extras = ad.extras || [];
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl">
      {ad.imageUrl && (
        <div className="relative h-40 w-full">
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="px-6 py-5" style={bgStyle}>
        {ad.badge && (
          <div className="inline-flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full mb-3 border border-white/20">
            <Sparkles className="w-3 h-3" style={{ color: ad.subtitleColor || '#fde047' }} />
            <span className="text-xs font-semibold" style={{ color: ad.textColor || '#ffffff' }}>{ad.badge}</span>
          </div>
        )}
        <h2 className="text-xl font-bold mb-1" style={{ color: ad.textColor || '#ffffff' }}>{ad.title}</h2>
        {ad.subtitle && <p className="text-sm mb-3" style={{ color: ad.descriptionColor || 'rgba(255,255,255,0.8)' }}>{ad.subtitle}</p>}
        {ad.type === 'contact' && ad.phone && (
          <div className="flex items-center gap-3 bg-black/20 rounded-xl px-4 py-3 border border-white/10 mt-3 w-fit">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: ad.ctaBgColor || '#f97316' }}>
              <Phone className="w-4 h-4" style={{ color: ad.ctaTextColor || '#ffffff' }} />
            </div>
            <div>
              <p className="font-bold" style={{ color: ad.textColor || '#ffffff' }}>{ad.phone}</p>
              <p className="text-xs opacity-70" style={{ color: ad.textColor || '#ffffff' }}>Tap to call</p>
            </div>
          </div>
        )}
        {ad.type === 'connect' && features.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {features.map((f: any, i: number) => {
              const Icon = iconMap[f.icon] || Zap;
              return (
                <div key={i} className="text-center bg-black/20 rounded-lg p-2 min-w-[75px] border border-white/10">
                  <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: ad.ctaBgColor || '#fb923c' }} />
                  <p className="text-xs font-semibold" style={{ color: ad.textColor || '#ffffff' }}>{f.label}</p>
                </div>
              );
            })}
          </div>
        )}
        {ad.type === 'promo' && ad.price && (
          <p className="text-2xl font-bold mt-2" style={{ color: ad.textColor || '#ffffff' }}>
            {ad.price}{ad.period && <span className="text-sm opacity-70 ml-1">{ad.period}</span>}
          </p>
        )}
        {ad.cta && (
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 px-5 py-2 font-semibold rounded-full text-sm"
              style={{ backgroundColor: ad.ctaBgColor || '#ffffff', color: ad.ctaTextColor || '#111827' }}>
              {ad.cta} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminAdsPage() {
  const { token } = useAuthStore();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    badge: '',
    backgroundColor: '#003d7a',
    type: 'connect',
    position: 'left',
    cta: '',
    href: '',
    price: '',
    period: '',
    phone: '',
    imageUrl: '',
    sortOrder: 0,
    isActive: true,
    heroTitle: '',
    heroSubtitle: '',
    heroSlides: '',
    heroCtaText: '',
    heroCtaLink: '',
    heroQuoteText: '',
    heroQuoteLink: '',
    textColor: '',
    subtitleColor: '',
    descriptionColor: '',
    ctaBgColor: '',
    ctaTextColor: '',
    secondaryBgColor: '',
    secondaryTextColor: '',
    cardBgColor: '',
    cardAccentColor: '',
    cardNameColor: '',
    cardPriceColor: '',
    cardBtnBgColor: '',
    cardBtnTextColor: '',
    cardBorderColor: '',
    eyebrowBgColor: '',
    eyebrowTextColor: '',
    eyebrowBorderColor: '',
    slideBadgeBgColor: '',
    slideBadgeTextColor: '',
    slideBadgeBorderColor: '',
    heroTemplate: 'split',
  });
  const [heroSlidesArray, setHeroSlidesArray] = useState<any[]>([]);
  const [heroExtras, setHeroExtras] = useState<{ label: string }[]>([]);
  const [heroBgType, setHeroBgType] = useState<'default' | 'color' | 'gradient' | 'image'>('default');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const fetchAds = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/ads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAds(data.ads || []);
    } catch { setAds([]); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  const openAdd = () => {
    setEditItem(null);
    setForm({
      title: '',
      subtitle: '',
      badge: '',
      backgroundColor: '#003d7a',
      type: 'connect',
      position: 'left',
      cta: '',
      href: '',
      price: '',
      period: '',
      phone: '',
      imageUrl: '',
      sortOrder: 0,
      isActive: true,
      heroTitle: '',
      heroSubtitle: '',
      heroSlides: '',
      heroCtaText: '',
      heroCtaLink: '',
      heroQuoteText: '',
      heroQuoteLink: '',
      textColor: '',
      subtitleColor: '',
      descriptionColor: '',
      ctaBgColor: '',
      ctaTextColor: '',
      secondaryBgColor: '',
      secondaryTextColor: '',
      cardBgColor: '',
      cardAccentColor: '',
      cardNameColor: '',
      cardPriceColor: '',
      cardBtnBgColor: '',
      cardBtnTextColor: '',
      cardBorderColor: '',
      eyebrowBgColor: '',
      eyebrowTextColor: '',
      eyebrowBorderColor: '',
      slideBadgeBgColor: '',
      slideBadgeTextColor: '',
      slideBadgeBorderColor: '',
      heroTemplate: 'split',
    });
    setHeroSlidesArray([]);
    setHeroExtras([]);
    setHeroBgType('default');
    setImageFile(null);
    setImagePreview('');
    setError('');
    setShowForm(true);
  };

  const openEdit = (ad: any) => {
    setEditItem(ad);
    setForm({
      title: ad.title,
      subtitle: ad.subtitle || '',
      badge: ad.badge || '',
      backgroundColor: ad.backgroundColor,
      type: ad.type,
      position: ad.type === 'side-left' ? 'left' : ad.type === 'side-right' ? 'right' : 'left',
      cta: ad.cta || '',
      href: ad.href || '',
      price: ad.price || '',
      period: ad.period || '',
      phone: ad.phone || '',
      imageUrl: ad.imageUrl || '',
      sortOrder: ad.sortOrder,
      isActive: ad.isActive,
      heroTitle: ad.heroTitle || '',
      heroSubtitle: ad.heroSubtitle || '',
      heroSlides: '',
      heroCtaText: ad.heroCtaText || '',
      heroCtaLink: ad.heroCtaLink || '',
      heroQuoteText: ad.heroQuoteText || '',
      heroQuoteLink: ad.heroQuoteLink || '',
      textColor: ad.textColor || '',
      subtitleColor: ad.subtitleColor || '',
      descriptionColor: ad.descriptionColor || '',
      ctaBgColor: ad.ctaBgColor || '',
      ctaTextColor: ad.ctaTextColor || '',
      secondaryBgColor: ad.secondaryBgColor || '',
      secondaryTextColor: ad.secondaryTextColor || '',
      cardBgColor: ad.cardBgColor || '',
      cardAccentColor: ad.cardAccentColor || '',
      cardNameColor: ad.cardNameColor || '',
      cardPriceColor: ad.cardPriceColor || '',
      cardBtnBgColor: ad.cardBtnBgColor || '',
      cardBtnTextColor: ad.cardBtnTextColor || '',
      cardBorderColor: ad.cardBorderColor || '',
      eyebrowBgColor: ad.eyebrowBgColor || '',
      eyebrowTextColor: ad.eyebrowTextColor || '',
      eyebrowBorderColor: ad.eyebrowBorderColor || '',
      slideBadgeBgColor: ad.slideBadgeBgColor || '',
      slideBadgeTextColor: ad.slideBadgeTextColor || '',
      slideBadgeBorderColor: ad.slideBadgeBorderColor || '',
      heroTemplate: ad.heroTemplate || 'split',
    });
    setHeroSlidesArray(ad.heroSlides || []);
    setHeroExtras(ad.extras || []);
    const bg = ad.backgroundColor || '';
    setHeroBgType(!bg ? 'default' : bg.startsWith('linear-gradient') || bg.startsWith('radial-gradient') ? 'gradient' : ad.imageUrl ? 'image' : 'color');
    setImageFile(null);
    setImagePreview(ad.imageUrl || '');
    setError('');
    setShowForm(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!token) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/ads/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      /* Use functional updater to avoid stale closure */
      setForm((prev) => ({ ...prev, imageUrl: data.url }));
      setImagePreview(data.url);
    } catch (e: any) {
      setError(e.message || 'Failed to upload image');
      setImagePreview('');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      /* Show a local preview while uploading, but don't set form.imageUrl yet */
      setImagePreview(URL.createObjectURL(file));
      handleImageUpload(file);
    }
  };

  const handleSave = async () => {
    if (!token || !form.title.trim()) return;
    setBusy(true); setError('');
    try {
      const payload: any = {
        ...form,
        title: form.title.trim(),
        sortOrder: Number(form.sortOrder),
      };

      // Combine type and position into the format expected by backend
      payload.type = form.position === 'left' ? 'side-left' : 'side-right';

      // Always send heroSlides and extras so deletions are persisted
      payload.heroSlides = heroSlidesArray;
      if (form.type === 'hero') payload.extras = heroExtras;

      // Remove empty string fields
      Object.keys(payload).forEach((key: string) => {
        if (payload[key] === '') {
          delete payload[key];
        }
      });

      const url = editItem
        ? `${process.env.NEXT_PUBLIC_API_URL || '/api'}/ads/${editItem.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || '/api'}/ads`;
      const method = editItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to save ad');
      }

      setShowForm(false);
      fetchAds();
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally { setBusy(false); }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this ad?')) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/ads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete ad');
      fetchAds();
    } catch (e: any) {
      alert(e.message || 'Failed to delete');
    }
  };

  const handleToggleActive = async (ad: any) => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/ads/${ad.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !ad.isActive }),
      });
      if (!response.ok) throw new Error('Failed to update ad');
      fetchAds();
    } catch (e: any) {
      alert(e.message || 'Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Ads Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">{ads.length} ads</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAds} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Ad
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-[#1a1d27] border border-slate-700 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editItem ? 'Edit Ad' : 'New Ad'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">

              {/* ── Ad Type selector (always visible) ── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Ad Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="connect">Connect</option>
                    <option value="promo">Promo</option>
                    <option value="sale">Sale</option>
                    <option value="services">Services</option>
                    <option value="contact">Contact</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Position</label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="left">Left Sidebar</option>
                    <option value="right">Right Sidebar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Internal Name *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Summer Sale"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* ── Sort & Active (always visible) ── */}
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-slate-300">Active</label>
                </div>
              </div>

              {/* ══════════════════════════════════════════════════
                  HERO BANNER — main text fields
              ══════════════════════════════════════════════════ */}
              {form.type === 'hero' && (
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Hero Title</label>
                    <input type="text" value={form.heroTitle}
                      onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                      placeholder="Main headline for hero banner"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Hero Subtitle</label>
                    <input type="text" value={form.heroSubtitle}
                      onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                      placeholder="Secondary text shown below title"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                    <input type="text" value={form.subtitle}
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      placeholder="Additional description text"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Shop Now Button Text</label>
                      <input type="text" value={form.heroCtaText}
                        onChange={(e) => setForm({ ...form, heroCtaText: e.target.value })}
                        placeholder="e.g. Shop Now"
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Get Quote Button Text</label>
                      <input type="text" value={form.heroQuoteText}
                        onChange={(e) => setForm({ ...form, heroQuoteText: e.target.value })}
                        placeholder="e.g. Get a Quote"
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 text-xs text-violet-300">
                    ℹ️ Hero Banner slides are managed via the <strong>Slides</strong> section below. Each slide has its own text, category, and background gradient.
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════
                  SIDEBAR / OTHER ADS — full field set
              ══════════════════════════════════════════════════ */}
              {form.type !== 'hero' && (
                <div className="space-y-4 pt-2 border-t border-slate-800">

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Headline</label>
                    <input type="text" value={form.subtitle}
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      placeholder="Short tagline shown on the ad"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Badge / Eyebrow</label>
                    <input type="text" value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      placeholder="e.g. Limited Offer"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">CTA Button Text</label>
                      <input type="text" value={form.cta}
                        onChange={(e) => setForm({ ...form, cta: e.target.value })}
                        placeholder="e.g. Shop Now"
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Link URL</label>
                      <input type="text" value={form.href}
                        onChange={(e) => setForm({ ...form, href: e.target.value })}
                        placeholder="/products?category=..."
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                    </div>
                  </div>

                  {(form.type === 'promo') && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Price</label>
                        <input type="text" value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          placeholder="e.g. R550"
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Period</label>
                        <input type="text" value={form.period}
                          onChange={(e) => setForm({ ...form, period: e.target.value })}
                          placeholder="e.g. /month"
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                      </div>
                    </div>
                  )}

                  {form.type === 'contact' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone Number</label>
                      <input type="text" value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="e.g. 061 268 5933"
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                    </div>
                  )}

                  {/* Image */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Image</label>
                    <div className="flex items-center gap-3">
                      <input type="file" id="imageUpload" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleImageChange} className="hidden" />
                      <label htmlFor="imageUpload"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-lg cursor-pointer border border-slate-700">
                        <Upload className="w-4 h-4" />
                        {uploadingImage ? 'Uploading…' : 'Upload'}
                      </label>
                      <input type="text" value={form.imageUrl}
                        onChange={(e) => { setForm({ ...form, imageUrl: e.target.value }); setImagePreview(e.target.value); }}
                        placeholder="or paste URL"
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                      {imagePreview && (
                        <button onClick={() => { setImageFile(null); setImagePreview(''); setForm({ ...form, imageUrl: '' }); }}
                          className="text-xs text-red-400 hover:text-red-300 shrink-0">Remove</button>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="mt-2 h-24 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                        <img src={imagePreview} alt="preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Background */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Background</label>
                    <div className="flex gap-2 mb-3">
                      {(['solid','gradient'] as const).map((t) => (
                        <button key={t} type="button"
                          onClick={() => {
                            if (t === 'solid') setForm({ ...form, backgroundColor: form.backgroundColor.startsWith('linear') || form.backgroundColor.startsWith('radial') ? '#003d7a' : form.backgroundColor });
                            if (t === 'gradient') setForm({ ...form, backgroundColor: 'linear-gradient(135deg, #003d7a 0%, #001629 100%)' });
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                            (t === 'gradient' && (form.backgroundColor.startsWith('linear') || form.backgroundColor.startsWith('radial'))) ||
                            (t === 'solid' && !form.backgroundColor.startsWith('linear') && !form.backgroundColor.startsWith('radial'))
                              ? 'bg-violet-600 border-violet-500 text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}>
                          {t === 'solid' ? 'Solid Color' : 'Gradient'}
                        </button>
                      ))}
                    </div>
                    {!(form.backgroundColor.startsWith('linear') || form.backgroundColor.startsWith('radial')) ? (
                      <div className="flex items-center gap-3">
                        <input type="color" value={form.backgroundColor.startsWith('#') ? form.backgroundColor : '#003d7a'}
                          onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                          className="h-10 w-16 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer" />
                        <input type="text" value={form.backgroundColor}
                          onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                          placeholder="#003d7a"
                          className="flex-1 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
                      </div>
                    ) : (
                      <GradientPicker value={form.backgroundColor} onChange={(v) => setForm({ ...form, backgroundColor: v })} />
                    )}
                  </div>

                  {/* Text & button colours */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Title Color', key: 'textColor', placeholder: '#ffffff' },
                      { label: 'Subtitle Color', key: 'descriptionColor', placeholder: 'rgba(255,255,255,0.8)' },
                      { label: 'Button Background', key: 'ctaBgColor', placeholder: 'rgba(255,255,255,0.2)' },
                      { label: 'Button Text', key: 'ctaTextColor', placeholder: '#ffffff' },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key}>
                        <p className="text-[10px] text-slate-500 mb-1">{label}</p>
                        <div className="flex items-center gap-2">
                          <input type="color" value={(form as any)[key] || '#ffffff'}
                            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            className="h-8 w-10 bg-slate-950 border border-slate-800 rounded cursor-pointer shrink-0" />
                          <input type="text" value={(form as any)[key]}
                            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            placeholder={placeholder}
                            className="flex-1 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-violet-500 min-w-0" />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* ── Hero Banner Slides Editor — only for type=hero ── */}
              {form.type === 'hero' && (
                <div className="pt-4 border-t border-slate-800 space-y-5">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    Hero Banner Slides
                    <span className="text-[10px] font-normal text-slate-500">Each slide = 1 panel in the rotating banner</span>
                  </h3>

                  {heroSlidesArray.map((slide: any, index: number) => {
                    const bg = slide.bg || 'linear-gradient(135deg, #1a56db 0%, #1e3a8a 100%)';
                    return (
                      <div key={index} className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                        {/* ── Mini live preview ── */}
                        <div className="relative h-20 flex items-center justify-between px-4 overflow-hidden" style={{ background: bg }}>
                          {/* left ghost products */}
                          <div className="flex gap-1 opacity-30">
                            {[0,1,2].map(i => <div key={i} className="w-10 h-10 rounded-lg bg-white/20" style={{ transform: `rotate(${[-8,0,6][i]}deg)` }} />)}
                          </div>
                          {/* centre text */}
                          <div className="flex-1 text-center px-2">
                            <p className="text-white/70 text-[10px] uppercase tracking-wider leading-none">{slide.promoLine1 || 'Line 1'}</p>
                            <p className="text-white font-black text-base leading-tight">{slide.promoLine2 || 'Line 2'}</p>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold text-white bg-white/25">{slide.promoTag || 'Tag'}</span>
                          </div>
                          {/* right ghost products */}
                          <div className="flex gap-1 opacity-30">
                            {[0,1,2].map(i => <div key={i} className="w-10 h-10 rounded-lg bg-white/20" style={{ transform: `rotate(${[8,0,-6][i]}deg)` }} />)}
                          </div>
                          {/* slide number */}
                          <div className="absolute top-1.5 left-2 text-[9px] font-bold text-white/50">Slide {index + 1}</div>
                        </div>

                        {/* ── Fields ── */}
                        <div className="p-3 space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-[10px] text-slate-500 mb-1">Promo Line 1 <span className="text-slate-700">(small text)</span></p>
                              <input type="text" placeholder="e.g. Shop Top"
                                value={slide.promoLine1 || ''}
                                onChange={(e) => setHeroSlidesArray(heroSlidesArray.map((s: any, i: number) => i === index ? { ...s, promoLine1: e.target.value } : s))}
                                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-violet-500" />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 mb-1">Promo Line 2 <span className="text-slate-700">(big headline)</span></p>
                              <input type="text" placeholder="e.g. Networking"
                                value={slide.promoLine2 || ''}
                                onChange={(e) => setHeroSlidesArray(heroSlidesArray.map((s: any, i: number) => i === index ? { ...s, promoLine2: e.target.value } : s))}
                                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-violet-500" />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 mb-1">Promo Tag <span className="text-slate-700">(pill badge)</span></p>
                              <input type="text" placeholder="e.g. Deals"
                                value={slide.promoTag || ''}
                                onChange={(e) => setHeroSlidesArray(heroSlidesArray.map((s: any, i: number) => i === index ? { ...s, promoTag: e.target.value } : s))}
                                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-violet-500" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[10px] text-slate-500 mb-1">CTA Button Text</p>
                              <input type="text" placeholder="Shop Now"
                                value={slide.cta || ''}
                                onChange={(e) => setHeroSlidesArray(heroSlidesArray.map((s: any, i: number) => i === index ? { ...s, cta: e.target.value } : s))}
                                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-violet-500" />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 mb-1">CTA Link</p>
                              <input type="text" placeholder="/products?category=..."
                                value={slide.ctaLink || ''}
                                onChange={(e) => setHeroSlidesArray(heroSlidesArray.map((s: any, i: number) => i === index ? { ...s, ctaLink: e.target.value } : s))}
                                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-violet-500" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Left side products */}
                            <div className="space-y-2">
                              <p className="text-[10px] text-slate-400 font-medium">⬅ Left Products <span className="text-slate-600 font-normal">(up to 3)</span></p>
                              <SlideProductPicker
                                selected={slide.pinnedProductsLeft || []}
                                onChange={(products) => setHeroSlidesArray(heroSlidesArray.map((s: any, i: number) =>
                                  i === index ? { ...s, pinnedProductsLeft: products } : s
                                ))}
                              />
                              {!(slide.pinnedProductsLeft?.length > 0) && (
                                <div>
                                  <p className="text-[10px] text-slate-600 mb-1">Or by category</p>
                                  <select
                                    value={slide.category || ''}
                                    onChange={(e) => setHeroSlidesArray(heroSlidesArray.map((s: any, i: number) => i === index ? { ...s, category: e.target.value } : s))}
                                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-violet-500"
                                  >
                                    <option value="">— category —</option>
                                    <option value="internet-networking">Internet & Networking</option>
                                    <option value="power-solutions">Power Solutions</option>
                                    <option value="cameras">CCTV & Cameras</option>
                                    <option value="computers">Computers & Laptops</option>
                                    <option value="accessories">Accessories</option>
                                    <option value="smart-home">Smart Home</option>
                                    <option value="printers">Printers</option>
                                    <option value="audio-visual">Audio / Visual</option>
                                  </select>
                                </div>
                              )}
                            </div>

                            {/* Right side products */}
                            <div className="space-y-2">
                              <p className="text-[10px] text-slate-400 font-medium">➡ Right Products <span className="text-slate-600 font-normal">(up to 3)</span></p>
                              <SlideProductPicker
                                selected={slide.pinnedProductsRight || []}
                                onChange={(products) => setHeroSlidesArray(heroSlidesArray.map((s: any, i: number) =>
                                  i === index ? { ...s, pinnedProductsRight: products } : s
                                ))}
                              />
                              {!(slide.pinnedProductsRight?.length > 0) && (
                                <div>
                                  <p className="text-[10px] text-slate-600 mb-1">Or by category</p>
                                  <select
                                    value={slide.categoryRight || slide.category || ''}
                                    onChange={(e) => setHeroSlidesArray(heroSlidesArray.map((s: any, i: number) => i === index ? { ...s, categoryRight: e.target.value } : s))}
                                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-violet-500"
                                  >
                                    <option value="">— category —</option>
                                    <option value="internet-networking">Internet & Networking</option>
                                    <option value="power-solutions">Power Solutions</option>
                                    <option value="cameras">CCTV & Cameras</option>
                                    <option value="computers">Computers & Laptops</option>
                                    <option value="accessories">Accessories</option>
                                    <option value="smart-home">Smart Home</option>
                                    <option value="printers">Printers</option>
                                    <option value="audio-visual">Audio / Visual</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] text-slate-500 mb-1.5">Background Gradient</p>
                            <GradientPicker
                              value={slide.bg || 'linear-gradient(135deg, #1a56db 0%, #1e3a8a 100%)'}
                              onChange={(v) => setHeroSlidesArray(heroSlidesArray.map((s: any, i: number) => i === index ? { ...s, bg: v } : s))}
                            />
                          </div>

                          <button type="button"
                            onClick={() => setHeroSlidesArray(heroSlidesArray.filter((_: any, i: number) => i !== index))}
                            className="text-xs text-red-400 hover:text-red-300 pt-1">
                            ✕ Remove slide
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button type="button"
                    onClick={() => setHeroSlidesArray([...heroSlidesArray, {
                      promoLine1: 'Shop Top',
                      promoLine2: 'New Arrivals',
                      promoTag: 'Deals',
                      cta: 'Shop Now',
                      ctaLink: '/products',
                      category: '',
                      bg: 'linear-gradient(135deg, #1a56db 0%, #1e3a8a 100%)',
                    }])}
                    className="w-full px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-xl border border-dashed border-slate-600 transition-colors">
                    + Add Slide
                  </button>

                  <p className="text-[10px] text-slate-600">
                    💡 The banner auto-rotates slides every 6s. Product images are pulled live from your store by category — no manual upload needed.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium">
                Cancel
              </button>
              <button onClick={() => setShowPreview(true)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg">
                Preview
              </button>
              <button onClick={handleSave} disabled={busy} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg disabled:opacity-50">
                {busy ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Ad Preview</h2>
                <p className="text-xs text-slate-500">Live preview with your current settings</p>
              </div>
              <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <AdPreview ad={{ ...form, heroSlides: heroSlidesArray, extras: heroExtras }} />
            </div>
          </div>
        </div>
      )}


      {/* Ads List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : ads.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No ads found. Create your first ad!</div>
      ) : (
        <div className="bg-[#1a1d27] border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Title</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Type</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Color</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Order</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{ad.title}</p>
                      {ad.subtitle && <p className="text-xs text-slate-500">{ad.subtitle}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-400 capitalize">{ad.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border border-slate-600" style={{ backgroundColor: ad.backgroundColor }} />
                      <span className="text-xs text-slate-500">{ad.backgroundColor}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-400">{ad.sortOrder}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(ad)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        ad.isActive ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ad.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(ad)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(ad.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
