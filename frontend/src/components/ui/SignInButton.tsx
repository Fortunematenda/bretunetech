'use client';

import { useState } from 'react';
import AuthModal from '@/components/ui/AuthModal';

interface Props {
  className?: string;
  children?: React.ReactNode;
  initialMode?: 'login' | 'register';
}

export default function SignInButton({ className, children, initialMode = 'login' }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  return (
    <>
      <button onClick={() => { setMode(initialMode); setOpen(true); }} className={className}>
        {children ?? 'Sign In'}
      </button>
      {open && (
        <AuthModal
          mode={mode}
          onClose={() => setOpen(false)}
          onSwitchMode={(m) => setMode(m)}
        />
      )}
    </>
  );
}
