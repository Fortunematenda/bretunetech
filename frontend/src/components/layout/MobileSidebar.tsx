'use client';

import NavDrawer, { type NavDrawerBrand, type NavDrawerCategory } from '@/components/layout/NavDrawer';

interface Props {
  open: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  categories: NavDrawerCategory[];
  brands: NavDrawerBrand[];
}

/** Mobile navigation drawer — shared modern NavDrawer UI. */
export default function MobileSidebar({ open, onClose, onLoginClick, categories, brands }: Props) {
  return (
    <NavDrawer
      open={open}
      onClose={onClose}
      onLoginClick={onLoginClick}
      categories={categories}
      brands={brands}
    />
  );
}
