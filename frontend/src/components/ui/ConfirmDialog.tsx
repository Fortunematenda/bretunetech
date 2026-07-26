'use client';

import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

/** Shared confirm dialog (AlertDialog). Maps legacy props to AdminConfirmDialog. */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AdminConfirmDialog
      open={open}
      title={title}
      description={message}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      variant={variant === 'danger' ? 'danger' : 'default'}
      onConfirm={onConfirm}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    />
  );
}
