import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING_APPROVAL: 'bg-amber-50 text-amber-800',
  APPROVED: 'bg-sky-50 text-sky-800',
  SCHEDULED: 'bg-indigo-50 text-indigo-800',
  SENDING: 'bg-orange-50 text-orange-800',
  SENT: 'bg-emerald-50 text-emerald-800',
  CANCELLED: 'bg-rose-50 text-rose-800',
  FAILED: 'bg-red-50 text-red-800',
};

export function CampaignStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-700',
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function downloadTextFile(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
