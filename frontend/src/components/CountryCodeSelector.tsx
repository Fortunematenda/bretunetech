'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const COUNTRY_CODES = [
  { code: 'ZA', dial: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: 'ZW', dial: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
  { code: 'ZM', dial: '+260', flag: '🇿🇲', name: 'Zambia' },
  { code: 'BW', dial: '+267', flag: '🇧🇼', name: 'Botswana' },
  { code: 'NA', dial: '+264', flag: '🇳🇦', name: 'Namibia' },
  { code: 'MZ', dial: '+258', flag: '🇲🇿', name: 'Mozambique' },
  { code: 'LS', dial: '+266', flag: '🇱🇸', name: 'Lesotho' },
  { code: 'SZ', dial: '+268', flag: '🇸🇿', name: 'Eswatini' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'US', dial: '+1', flag: '🇺🇸', name: 'United States' },
  { code: 'IN', dial: '+91', flag: '🇮🇳', name: 'India' },
  { code: 'CN', dial: '+86', flag: '🇨🇳', name: 'China' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: 'AU', dial: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: 'DE', dial: '+49', flag: '🇩🇪', name: 'Germany' },
];

interface CountryCodeSelectorProps {
  value?: string;
  onChange: (dialCode: string) => void;
  className?: string;
  buttonClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CountryCodeSelector({
  value = '+27',
  onChange,
  className = '',
  buttonClassName = '',
  size = 'md',
}: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCountry = COUNTRY_CODES.find(c => c.dial === value) || COUNTRY_CODES[0];

  const sizeClasses = {
    sm: 'px-2 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap ${sizeClasses[size]} ${buttonClassName}`}
      >
        <span className="text-base">{selectedCountry.flag}</span>
        <span className="font-medium text-sm">{selectedCountry.dial}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {COUNTRY_CODES.filter(c => c.code !== selectedCountry.code).map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onChange(c.dial); setIsOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-gray-700"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{c.flag}</span>
                <span className="text-gray-600">{c.name}</span>
              </div>
              <span className="font-medium">{c.dial}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { COUNTRY_CODES };
