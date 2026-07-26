'use client';

import type { ReactNode, AnchorHTMLAttributes } from 'react';
import { trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  location: string;
  children: ReactNode;
};

export function TrackedWhatsAppLink({ location, onClick, children, ...rest }: Props) {
  return (
    <a
      {...rest}
      target={rest.target ?? '_blank'}
      rel={rest.rel ?? 'noopener noreferrer'}
      onClick={(e) => {
        trackWhatsAppClick(location);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}

export function TrackedPhoneLink({ location, onClick, children, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        trackPhoneClick(location);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
