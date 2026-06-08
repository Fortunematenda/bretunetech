'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Percent } from 'lucide-react';

interface DealSectionProps {
  title: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  linkText?: string;
  linkHref?: string;
}

const DealSection: React.FC<DealSectionProps> = ({
  title,
  subtitle,
  backgroundColor = 'bg-red-50',
  textColor = 'text-gray-900',
  linkText = 'View All Deals',
  linkHref = '/products?featured=true'
}) => {
  return (
    <div className={`${backgroundColor} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-5 h-5 text-red-600" />
              <h3 className={`text-xl sm:text-2xl font-bold ${textColor}`}>{title}</h3>
            </div>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          <Link
            href={linkHref}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#003d7a] hover:text-blue-700 transition-colors"
          >
            {linkText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DealSection;
