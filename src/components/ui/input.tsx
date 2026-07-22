import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Input — tight 2px corners, hairline border, mint focus ring (no glow).
 * Matches the Verge form spec exactly.
 */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'flex h-11 w-full rounded-xs border border-fg/15 bg-canvas/60 px-3 py-2 font-sans text-sm text-fg',
      'placeholder:text-fg-secondary transition-colors duration-150',
      'focus-visible:outline-none focus-visible:border-mint focus-visible:ring-1 focus-visible:ring-mint',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[88px] w-full rounded-xs border border-fg/15 bg-canvas/60 px-3 py-2 font-sans text-sm text-fg',
      'placeholder:text-fg-secondary transition-colors duration-150',
      'focus-visible:outline-none focus-visible:border-mint focus-visible:ring-1 focus-visible:ring-mint',
      'disabled:cursor-not-allowed disabled:opacity-50 resize-y',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'mono-label text-[11px] font-medium text-fg-secondary',
      className,
    )}
    {...props}
  />
));
Label.displayName = 'Label';
