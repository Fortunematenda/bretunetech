'use client';

import { Truck, Clock, Headphones, X } from 'lucide-react';
import { useState } from 'react';

const announcements = [
  { icon: Truck, text: '🚚 Free Delivery Over R2000' },
  { icon: Clock, text: '⚡ Same Day Cape Town Dispatch' },
  { icon: Headphones, text: '📞 24/7 Enterprise Support' },
];

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#002855] text-white py-2.5 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 text-sm">
        {announcements.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <item.icon className="w-4 h-4 text-orange-400" />
            <span className="font-medium">{item.text}</span>
          </div>
        ))}
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
