const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getVerificationCodes(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_URL}/seo/verification`, {
      cache: 'no-store',
    });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export default async function VerificationMeta() {
  const codes = await getVerificationCodes();

  return (
    <>
      {codes.googleSiteVerification && (
        <meta name="google-site-verification" content={codes.googleSiteVerification} />
      )}
      {codes.bingSiteVerification && (
        <meta name="msvalidate.01" content={codes.bingSiteVerification} />
      )}
    </>
  );
}
