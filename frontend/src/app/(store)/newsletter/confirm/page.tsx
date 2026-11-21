'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { newsletterPublicApi } from '@/lib/newsletter-api';

function ConfirmInner() {
  const params = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState<'loading' | 'ok' | 'fail'>('loading');

  useEffect(() => {
    if (!token) {
      setState('fail');
      return;
    }
    newsletterPublicApi
      .confirm(token)
      .then((r) => setState(r.ok ? 'ok' : 'fail'))
      .catch(() => setState('fail'));
  }, [token]);

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="mb-4 text-2xl font-bold text-[#003d7a]">Confirm subscription</h1>
      {state === 'loading' && <p>Confirming…</p>}
      {state === 'ok' && <p className="text-gray-600">Thank you — your BretuneTech newsletter subscription is active.</p>}
      {state === 'fail' && <p className="text-red-600">This confirmation link is invalid or expired.</p>}
      <p className="mt-8 text-sm">
        <Link href="/products">Browse products</Link>
      </p>
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmInner />
    </Suspense>
  );
}