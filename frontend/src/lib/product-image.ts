/** Pick the best product image URL from an images array. */
export function pickProductImageUrl(
  images?: Array<{ url?: string | null; isPrimary?: boolean | null }> | null,
  fallback = '/assets/placeholder.svg'
): string {
  if (!Array.isArray(images) || images.length === 0) return fallback;

  const usable = images.filter((img) => typeof img?.url === 'string' && img.url.trim().length > 0);
  if (usable.length === 0) return fallback;

  const primary = usable.find((img) => img.isPrimary);
  return (primary?.url || usable[0].url || fallback).trim();
}

/** Hosts Next/Image is allowed to optimize (see next.config.ts remotePatterns). */
export function isOptimizedRemoteImage(url: string): boolean {
  if (!url || url.startsWith('/') || url.startsWith('data:')) return true;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host.endsWith('cloudinary.com') ||
      host.endsWith('amazonaws.com') ||
      host === 'bretunetech.com' ||
      host === 'www.bretunetech.com' ||
      host.endsWith('pinnacle.co.za') ||
      host === 'localhost' ||
      host === '127.0.0.1'
    );
  } catch {
    return false;
  }
}
