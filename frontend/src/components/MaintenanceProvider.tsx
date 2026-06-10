'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface MaintenanceData {
  maintenanceMode: boolean;
  message: string;
}

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    // Skip maintenance check for admin routes and maintenance page
    if (pathname?.startsWith('/admin') || pathname === '/maintenance') {
      setIsChecking(false);
      return;
    }

    const checkMaintenance = async () => {
      try {
        const response = await fetch('/api/maintenance-status');
        const data: MaintenanceData = await response.json();
        
        if (data.maintenanceMode) {
          setMaintenanceMode(true);
          router.push('/maintenance');
        }
      } catch (error) {
        // If check fails, allow normal operation
      } finally {
        setIsChecking(false);
      }
    };

    checkMaintenance();
  }, [pathname, router]);

  // Show loading state while checking
  if (isChecking && !pathname?.startsWith('/admin') && pathname !== '/maintenance') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
