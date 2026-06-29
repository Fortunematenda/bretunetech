'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  const [isChecking, setIsChecking] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isAdminRoute = pathname?.startsWith('/admin') || pathname === '/admin-login';

  const checkMaintenance = useCallback(async () => {
    try {
      const response = await fetch('/api/maintenance-status');
      const data: MaintenanceData = await response.json();

      if (data.maintenanceMode) {
        if (!maintenanceMode) {
          setMaintenanceMode(true);
          // Only redirect if not already on maintenance page and not admin
          if (pathname !== '/maintenance' && !isAdminRoute) {
            router.push('/maintenance');
          }
        }
      } else {
        if (maintenanceMode) {
          setMaintenanceMode(false);
          // If on maintenance page and maintenance is off, redirect to home
          if (pathname === '/maintenance') {
            router.push('/');
          }
        }
      }
    } catch (error) {
      // If check fails, allow normal operation
    } finally {
      setIsChecking(false);
    }
  }, [pathname, router, maintenanceMode, isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute || isBot()) {
      setIsChecking(false);
      return;
    }

    checkMaintenance();
    intervalRef.current = setInterval(checkMaintenance, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pathname, isAdminRoute, checkMaintenance]);

  // Show loading state while doing initial check
  if (isChecking && !isAdminRoute && pathname !== '/maintenance') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
