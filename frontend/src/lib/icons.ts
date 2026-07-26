/**
 * Standard Lucide icon sizes for BretuneTech UI.
 * Prefer these class names over ad-hoc w-* h-* on icons.
 */
export const iconSize = {
  /** 14–16px — badges, dense tables, inline meta */
  sm: 'size-3.5',
  /** 16–20px — default interface icons */
  md: 'size-4',
  /** 20–24px — feature / section icons */
  lg: 'size-5',
  /** Empty states / hero feature icons */
  xl: 'size-6',
} as const;

export type IconSize = keyof typeof iconSize;
