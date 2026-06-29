'use client';

import { useState } from 'react';
import AuthModal from '@/components/ui/AuthModal';

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export default function SignInButton({ className, children }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {children ?? 'Sign In'}
      </button>
      {open && (
        <AuthModal
          mode="login"
          onClose={() => setOpen(false)}
          onSwitchMode={() => setOpen(true)}
        />
      )}
    </>
  );
}
