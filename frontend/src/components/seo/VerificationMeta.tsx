const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bretunetech.com/api';

export async function getSeoVerificationCodes(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_URL}/seo/verification`, {
      // Short revalidate so verification codes update without forcing every request to wait
      next: { revalidate: 300 },
    });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}
