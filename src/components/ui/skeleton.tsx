import { cn } from '@/lib/utils';

/** Skeleton — shimmer placeholder for loading states. */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-pill bg-fg/5',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer',
        'before:bg-gradient-to-r before:from-transparent before:via-fg/10 before:to-transparent',
        className,
      )}
      {...props}
    />
  );
}
