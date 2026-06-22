'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('bt_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('bt_visitor_id', id);
  }
  return id;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('bt_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('bt_session_id', id);
  }
  return id;
}

function getProductIdFromUrl(pathname: string): string | undefined {
  // Match /products/[slug] pattern - we'll pass the slug, backend can resolve
  const match = pathname.match(/^\/products\/([^/]+)$/);
  if (match) {
    // Store the product ID from the page data attribute if available
    const el = document.querySelector('[data-product-id]');
    if (el) return el.getAttribute('data-product-id') || undefined;
  }
  return undefined;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  let deviceType = 'desktop';
  if (/Mobile|Android|iPhone/i.test(ua)) deviceType = 'mobile';
  else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet';

  return { browser, deviceType, userAgent: ua };
}

// Queue for batching requests
let trackQueue: any[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

function flushQueue() {
  if (trackQueue.length === 0) return;
  const items = [...trackQueue];
  trackQueue = [];

  // Send each item (could batch in future)
  items.forEach(item => {
    fetch(`${API_BASE}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
      keepalive: true,
    }).catch(() => {});
  });
}

function queueTrack(data: any) {
  trackQueue.push(data);
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flushQueue, 1000); // debounce 1 second
}

export function PageTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>('');

  useEffect(() => {
    // Don't track admin pages
    if (pathname?.startsWith('/admin')) return;

    // Avoid duplicate tracking on same path in same render cycle
    const trackKey = `${pathname}-${Date.now()}`;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname || '';

    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    if (!visitorId || !sessionId) return;

    // Small delay to allow page to fully render and get product ID
    const timer = setTimeout(() => {
      const productId = getProductIdFromUrl(pathname || '');
      const deviceInfo = getDeviceInfo();

      queueTrack({
        visitorId,
        sessionId,
        pageUrl: pathname || '/',
        pageTitle: document.title,
        referrer: document.referrer || undefined,
        productId: productId || undefined,
        browser: deviceInfo.browser,
        deviceType: deviceInfo.deviceType,
        userAgent: deviceInfo.userAgent,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
