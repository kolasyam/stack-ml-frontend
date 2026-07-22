import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}

/** Beautiful empty state — icon, headline, supporting copy, optional CTA. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-feature border border-dashed border-fg/15 bg-surface/30 px-6 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mint/10 text-mint">
          {icon}
        </div>
      )}
      <h3 className="font-sans text-lg font-semibold text-fg">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm font-sans text-sm text-fg-secondary">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Button asChild variant="primary" size="md">
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
