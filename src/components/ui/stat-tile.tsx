import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatTileProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent?: string;
  className?: string;
}

/** Compact statistic tile used on the dashboard and module summaries. */
export function StatTile({ icon, label, value, accent, className }: StatTileProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-2 rounded-card border border-fg/10 bg-surface/60 p-4',
        className,
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-1">
        <span className="mono-label truncate text-[10px] text-fg-secondary">{label}</span>
        <span className={cn('flex shrink-0 h-7 w-7 items-center justify-center rounded-feature', accent ?? 'bg-mint/10 text-mint')}>
          {icon}
        </span>
      </div>
      <span className="font-sans text-2xl font-semibold leading-none text-fg">
        {value}
      </span>
    </div>
  );
}
