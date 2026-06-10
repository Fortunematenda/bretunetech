'use client';

import { Truck, Clock, Headphones, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { publicApi } from '@/lib/api';

const iconMap = {
  truck: Truck,
  clock: Clock,
  headphones: Headphones,
};

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [announcements, setAnnouncements] = useState<{ icon: string; text: string }[] | null>(null);

  useEffect(() => {
    // Load from database API only
    const fetchAnnouncements = async () => {
      try {
        const data = await publicApi.getAnnouncements();
        setAnnouncements(data);
      } catch {
        // If API fails, don't show anything
        setAnnouncements(null);
      }
    };

    fetchAnnouncements();
  }, []);

  if (!isVisible || !announcements) return null;

  return (
    <div className="hidden md:block bg-[#002855] text-white py-2.5 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 text-sm">
        {announcements.map((item: any, idx: number) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap] || Truck;
          return (
            <div key={idx} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-orange-400" />
              <span className="font-medium">{item.text}</span>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
