let cachedAds: any[] | null = null;
let fetchPromise: Promise<any[]> | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 60_000; // 1 minute

export function fetchActiveAds(): Promise<any[]> {
  const now = Date.now();

  // Return in-memory cache if fresh
  if (cachedAds && now - lastFetchTime < CACHE_TTL) {
    return Promise.resolve(cachedAds);
  }

  // Deduplicate concurrent calls — return the same in-flight promise
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/active`)
    .then((r) => (r.ok ? r.json() : []))
    .then((ads: any[]) => {
      cachedAds = ads;
      lastFetchTime = Date.now();
      fetchPromise = null;
      return ads;
    })
    .catch(() => {
      fetchPromise = null;
      return cachedAds ?? [];
    });

  return fetchPromise;
}
