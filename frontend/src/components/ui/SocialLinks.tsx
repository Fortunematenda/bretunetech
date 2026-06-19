'use client';

import Link from 'next/link';
import { LinkedinIcon, FacebookIcon } from '@/components/ui/SocialIcons';

export interface SocialLinksProps {
  variant?: 'icons' | 'text' | 'cards';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  iconClassName?: string;
}

const SOCIAL_PLATFORMS = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/bretunetech',
    icon: LinkedinIcon,
    color: '#0A66C2',
    hoverColor: '#08509c',
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/bretunetech',
    icon: FacebookIcon,
    color: '#1877F2',
    hoverColor: '#0A66C2',
  },
];

export default function SocialLinks({
  variant = 'icons',
  size = 'md',
  showText = false,
  className = '',
  iconClassName = '',
}: SocialLinksProps) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizeMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-2 gap-4 ${className}`}>
        {SOCIAL_PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          return (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group"
            >
              <Icon className={`${sizeMap[size]} text-[#0066CC] group-hover:scale-110 transition-transform duration-300`} />
              <span className={`${textSizeMap[size]} font-semibold text-gray-700 group-hover:text-[#0066CC] transition-colors`}>
                {platform.name}
              </span>
            </a>
          );
        })}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <span className="font-medium text-gray-700">Follow us:</span>
        <div className="flex items-center gap-3">
          {SOCIAL_PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            return (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-[#0066CC] hover:bg-blue-50 transition-all duration-300 group text-sm"
              >
                <Icon className={`${sizeMap[size]} text-[#0066CC] group-hover:scale-110 transition-transform`} />
                {showText && <span className="font-medium text-gray-700 group-hover:text-[#0066CC]">{platform.name}</span>}
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  // Default: icons variant
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {SOCIAL_PLATFORMS.map((platform) => {
        const Icon = platform.icon;
        return (
          <a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-full transition-all duration-300 group hover:scale-110"
            title={platform.name}
          >
            <Icon
              className={`${sizeMap[size]} ${iconClassName || 'text-white'} group-hover:text-[#0066CC] transition-colors`}
            />
          </a>
        );
      })}
    </div>
  );
}
