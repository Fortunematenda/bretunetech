import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_CLASS: Record<string, string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
  PAID: 'border-blue-200 bg-blue-50 text-blue-700',
  PROCESSING: 'border-primary/20 bg-primary/5 text-primary',
  SHIPPED: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  COMPLETED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  CANCELLED: 'border-red-200 bg-red-50 text-red-700',
  NEW: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REFURBISHED: 'border-amber-200 bg-amber-50 text-amber-800',
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  INACTIVE: 'border-slate-200 bg-slate-50 text-slate-600',
};

interface AdminStatusBadgeProps {
  status: string;
  className?: string;
}

export default function AdminStatusBadge({ status, className }: AdminStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide',
        STATUS_CLASS[status] || 'border-border bg-muted text-muted-foreground',
        className
      )}
    >
      {status}
    </Badge>
  );
}
