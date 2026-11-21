import Link from 'next/link';

export default function NewsletterPreferencesPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="mb-4 text-2xl font-bold text-[#003d7a]">Email preferences</h1>
      <p className="mb-4 text-gray-600">
        Use the unsubscribe link in any BretuneTech marketing email, or contact{' '}
        <a href="mailto:support@bretunetech.com" className="text-[#003d7a] underline">
          support@bretunetech.com
        </a>{' '}
        to update your preferences. We do not enroll existing customers for marketing without documented consent.
      </p>
      <Link href="/" className="text-sm text-[#003d7a] underline">
        Back to home
      </Link>
    </main>
  );
}