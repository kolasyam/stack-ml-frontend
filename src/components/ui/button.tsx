'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button — The Verge pill system.
 *  - primary: jelly-mint fill, black text (the loud CTA).
 *  - secondary: dark slate fill.
 *  - outline: mint 1px border, inverts to fill on hover.
 *  - ghost / danger variants for quiet + destructive actions.
 * Radius is a 24px pill unless `size="icon"` (circle).
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-medium transition-colors duration-180 ease-verge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focusring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-mint text-fg-invert hover:bg-fg/90 rounded-cta font-semibold',
        secondary:
          'bg-surface text-fg-muted hover:bg-fg/10 border border-transparent rounded-pill',
        outline:
          'border border-mint text-mint hover:bg-mint hover:text-fg-invert rounded-cta bg-transparent',
        violet:
          'border border-violet text-violet hover:bg-violet hover:text-fg rounded-promo bg-transparent',
        ghost: 'text-fg-secondary hover:text-fg hover:bg-fg/10 rounded-pill',
        danger:
          'bg-danger/10 text-danger border border-danger/40 hover:bg-danger hover:text-fg rounded-pill',
        link: 'text-link underline-offset-4 hover:underline rounded-sm',
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-pill',
        md: 'h-11 px-6 text-sm rounded-pill',
        lg: 'h-12 px-8 text-base rounded-cta',
        icon: 'h-11 w-11 rounded-full',
        'icon-sm': 'h-9 w-9 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
