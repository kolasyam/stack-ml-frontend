'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/components/nav-config';
import { cn } from '@/lib/utils';

/** Mobile bottom navigation — thumb-friendly, 4 primary destinations. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-fg/10 bg-canvas/90 backdrop-blur-md lg:hidden">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors',
              active ? 'text-mint' : 'text-fg-secondary',
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="mono-label text-[9px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
