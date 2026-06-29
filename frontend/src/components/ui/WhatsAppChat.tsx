'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MessageCircle, X, Wifi, Cable, Camera, Router, Headset, Wrench, FileText, GripVertical } from 'lucide-react';
import { brand, serviceCatalog } from '@/lib/brand';

const serviceIcons: Record<string, any> = {
  'wifi-installations': Wifi,
  'fibre-installations': Cable,
  'cctv-setup': Camera,
  'mikrotik-configuration': Router,
  'remote-support': Headset,
  'network-troubleshooting': Wrench,
};

const serviceMessages: Record<string, string> = {
  'wifi-installations': "Hi Bretunetech! I'd like a quote for a Wi-Fi installation.",
  'fibre-installations': "Hi Bretunetech! I'd like a quote for a fibre installation.",
  'cctv-setup': "Hi Bretunetech! I'd like a quote for a CCTV setup.",
  'mikrotik-configuration': "Hi Bretunetech! I'd like a quote for MikroTik configuration.",
  'remote-support': "Hi Bretunetech! I need remote support assistance.",
  'network-troubleshooting': "Hi Bretunetech! I need help with network troubleshooting.",
};

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  /* drag position for the floating button — null means use CSS default */
  const [btnPos, setBtnPos] = useState<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const dragStart = useRef<{ px: number; py: number; bx: number; by: number } | null>(null);
  const moved = useRef(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  /* ── helpers to clamp within viewport ── */
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const startDrag = useCallback((clientX: number, clientY: number) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    dragging.current = true;
    moved.current = false;
    dragStart.current = {
      px: clientX, py: clientY,
      bx: rect.left, by: rect.top,
    };
  }, []);

  const onDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragging.current || !dragStart.current) return;
    const dx = clientX - dragStart.current.px;
    const dy = clientY - dragStart.current.py;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved.current = true;
    const btnW = 56, btnH = 56;
    const newX = clamp(dragStart.current.bx + dx, 8, window.innerWidth - btnW - 8);
    const newY = clamp(dragStart.current.by + dy, 8, window.innerHeight - btnH - 80); // 80 = bottom nav
    setBtnPos({ x: newX, y: newY });
  }, []);

  const endDrag = useCallback(() => {
    dragging.current = false;
    dragStart.current = null;
  }, []);

  /* listen for external open trigger (e.g. mobile SA Support badge) */
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-whatsapp-chat', handler);
    return () => window.removeEventListener('open-whatsapp-chat', handler);
  }, []);

  /* mouse events */
  useEffect(() => {
    const onMove = (e: MouseEvent) => onDragMove(e.clientX, e.clientY);
    const onUp = () => endDrag();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [onDragMove, endDrag]);

  /* touch events */
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    onDragMove(t.clientX, t.clientY);
  };
  const onTouchEnd = () => {
    endDrag();
    if (!moved.current) setIsOpen(true); /* tap = open */
  };

  const btnStyle = btnPos
    ? { left: btnPos.x, top: btnPos.y, bottom: 'auto', right: 'auto' }
    : { bottom: '5rem', right: '1rem' }; /* default: above bottom nav on mobile */

  return (
    <>
      {/* ── Draggable floating button — desktop only ── */}
      {!isOpen && (
        <button
          ref={btnRef}
          onMouseDown={(e) => { startDrag(e.clientX, e.clientY); }}
          onClick={() => { if (!moved.current) setIsOpen(true); }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ position: 'fixed', ...btnStyle, zIndex: 900 }}
          className="hidden md:flex w-14 h-14 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-lg shadow-green-600/30 items-center justify-center select-none touch-none"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7 pointer-events-none" />
        </button>
      )}

      {/* ── Chat window ── */}
      {isOpen && (
        <div
          className="fixed z-[900] w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          style={{ bottom: '5.5rem', right: '1rem' }}
        >
          {/* Header — drag handle */}
          <div className="bg-green-600 px-4 py-3 flex items-center justify-between cursor-grab select-none">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Bretunetech</p>
                <p className="text-green-100 text-xs">Reply within 1 hour</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-white/50" />
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body — scrollable so it doesn't overflow small screens */}
          <div className="p-4 bg-gray-50 space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <p className="text-gray-700 text-sm">Hi! 👋 What can we help you with today?</p>
            </div>

            <a
              href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent('Hi Bretunetech! I have a question.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full px-3 py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" /> General Enquiry
            </a>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">Quick Quote by Service</p>
              {serviceCatalog.map((svc) => {
                const Icon = serviceIcons[svc.slug] ?? Wifi;
                return (
                  <a
                    key={svc.slug}
                    href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(serviceMessages[svc.slug] || 'Hi Bretunetech!')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0 group"
                  >
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-green-600 shrink-0" />
                    <span className="text-xs text-gray-700 group-hover:text-green-700">{svc.name}</span>
                    <MessageCircle className="w-3 h-3 text-gray-300 group-hover:text-green-500 ml-auto shrink-0" />
                  </a>
                );
              })}
            </div>

            <Link
              href="/quote"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-[#003d7a] hover:bg-[#0056b3] text-white font-semibold rounded-xl transition-colors text-sm"
            >
              <FileText className="w-4 h-4" /> Submit a Quote Request
            </Link>
          </div>

          <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 text-center">
            <p className="text-gray-400 text-xs">Powered by WhatsApp · {brand.phone}</p>
          </div>
        </div>
      )}
    </>
  );
}
