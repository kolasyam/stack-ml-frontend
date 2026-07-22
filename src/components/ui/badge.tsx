import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Badge — the "text pill" (20px radius, tighter than buttons). Non-interactive
 * status/priority/type chips. `tone` selects a semantic border+text colour.
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 font-sans text-[11px] font-medium leading-none transition-colors',
  {
    variants: {
      tone: {
        neutral: 'border-fg/15 text-fg-secondary',
        mint: 'border-mint/40 text-mint',
        violet: 'border-violet/40 text-violet',
        blue: 'border-tile-blue/40 text-tile-blue',
        orange: 'border-tile-orange/40 text-tile-orange',
        danger: 'border-danger/50 text-danger',
        info: 'border-info/40 text-info',
        solid: 'border-transparent bg-mint text-fg-invert',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { badgeVariants };
