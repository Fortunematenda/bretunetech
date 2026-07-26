/** Shop-by-solution cards on the homepage + products listing filter. */
export const SHOP_SOLUTIONS = [
  {
    title: 'Networking & WiFi',
    slug: 'networking',
    desc: 'Routers, switches, access points',
  },
  {
    title: 'CCTV & Security',
    slug: 'cctv-security',
    desc: 'Cameras, NVRs, access control',
  },
  {
    title: 'Power & Backup',
    slug: 'power-backup',
    desc: 'UPS, inverters, batteries',
  },
  {
    title: 'Computers & Laptops',
    slug: 'computers-laptops',
    desc: 'Desktops, laptops, mini PCs',
  },
  {
    title: 'Wireless Solutions',
    slug: 'wireless-solutions',
    desc: 'Outdoor links, antennas, bridges',
  },
  {
    title: 'Printers & Office',
    slug: 'printers-office',
    desc: 'Printers, scanners, ink & toner',
  },
] as const;

export type SolutionSlug = (typeof SHOP_SOLUTIONS)[number]['slug'];

export function getSolutionLabel(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return SHOP_SOLUTIONS.find((s) => s.slug === slug)?.title ?? null;
}
