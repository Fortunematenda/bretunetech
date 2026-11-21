'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { newsletterPublicApi } from '@/lib/newsletter-api';

function UnsubscribeInner() {
  const params = useSearchParams();
  const id = params.get('id');
  const token = params.get('token');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function unsub() {
    try {
      const res = await newsletterPublicApi.unsubscribe({ subscriberId: id || undefined, token: token || undefined });
      if (!res.ok) throw new Error('Request failed');
      setDone(true);
    } catch {
      setError('Could not process unsubscribe. Contact support@bretunetech.com.');
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="mb-4 text-2xl font-bold text-[#003d7a]">Unsubscribe</h1>
      {done ? (
        <p className="text-gray-600">You have been removed from BretuneTech marketing emails.</p>
      ) : (
        <>
          <p className="mb-6 text-gray-600">One click removes you from future marketing messages (POPIA direct marketing).</p>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <button
            type="button"
            onClick={unsub}
            className="rounded-lg bg-[#003d7a] px-6 py-3 text-white hover:bg-[#002952]"
          >
            Unsubscribe
          </button>
        </>
      )}
      <p className="mt-8 text-sm">
        <Link href="/">Home</Link> · <Link href="/products">Shop</Link>
      </p>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<main className="p-16 text-center">Loading…</main>}>
      <UnsubscribeInner />
    </Suspense>
  );
}