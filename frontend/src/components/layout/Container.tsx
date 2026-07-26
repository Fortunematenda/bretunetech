import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

/** Takealot-style content shell: 1560px max, centered, with gutters. */
export default function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1560px] px-4 sm:px-6',
        className
      )}
    >
      {children}
    </div>
  );
}
