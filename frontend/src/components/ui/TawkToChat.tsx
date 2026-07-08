'use client';

import { useEffect } from 'react';

// Tawk.to configuration - replace with your actual Tawk.to property ID
const TAWK_PROPERTY_ID = 'YOUR_TAWK_PROPERTY_ID'; // e.g., 'default'
const TAWK_WIDGET_ID = 'YOUR_TAWK_WIDGET_ID'; // e.g., 'default'

export default function TawkToChat() {
  useEffect(() => {
    // Load Tawk.to script
    const script = document.createElement('script');
    script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);

    // Cleanup
    return () => {
      const existingScript = document.querySelector(`script[src*="tawk.to"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
}

// Helper function to open chat programmatically
export function openTawkChat() {
  if (typeof window !== 'undefined' && (window as any).Tawk_API) {
    (window as any).Tawk_API.maximize();
  }
}
