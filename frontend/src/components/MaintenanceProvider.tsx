'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isBot } from '@/lib/is-bot';

interface MaintenanceData {
  maintenanceMode: boolean;
  message: string;
}

const POLL_INTERVAL = 15000; // Check every 15 seconds

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const wasMaintenanceRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isAdminRoute = pathname?.startsWith('/admin') || pathname === '/admin-login';

  const checkMaintenance = useCallback(async () => {
    try {
      const response = await fetch('/api/maintenance-status');
      const data: MaintenanceData = await response.json();

      if (data.maintenanceMode) {
        wasMaintenanceRef.current = true;
        if (pathname !== '/maintenance' && !isAdminRoute) {
          router.push('/maintenance');
        }
      } else {
        if (wasMaintenanceRef.current && pathname === '/maintenance') {
          router.push('/');
        }
        wasMaintenanceRef.current = false;
      }
    } catch {
      // If check fails, allow normal operation
    }
  }, [pathname, router, isAdminRoute]);

  useEffect(() => {
    // Client-only: never gate SSR/hydration on this check
    if (isAdminRoute || isBot()) {
      return;
    }

    void checkMaintenance();
    intervalRef.current = setInterval(() => {
      void checkMaintenance();
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pathname, isAdminRoute, checkMaintenance]);

  // Always render the same tree on server and first client paint.
  // Maintenance redirects happen after mount via the effect above.
  return <>{children}</>;
}
