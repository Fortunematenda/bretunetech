'use client';

import { useCallback, useRef, useState } from 'react';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';

type ConfirmOptions = {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
};

/**
 * Promise-based confirm dialog for admin destructive actions.
 * Drop-in replacement for `window.confirm()`.
 */
export function useAdminConfirm() {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({ description: '' });
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    setOpts(options);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = (value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOpen(false);
  };

  const dialog = (
    <AdminConfirmDialog
      open={open}
      title={opts.title}
      description={opts.description}
      confirmLabel={opts.confirmLabel}
      cancelLabel={opts.cancelLabel}
      variant={opts.variant ?? 'danger'}
      onConfirm={() => settle(true)}
      onOpenChange={(next) => {
        if (!next) settle(false);
      }}
    />
  );

  return { confirm, dialog };
}
