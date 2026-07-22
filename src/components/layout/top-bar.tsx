'use client';

import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { NAV_ITEMS } from '@/components/nav-config';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

/** Sticky top bar — page kicker + title, global search trigger, theme toggle. */
export function TopBar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const pathname = usePathname();
  const current =
    NAV_ITEMS.find((n) =>
      n.href === '/' ? pathname === '/' : pathname.startsWith(n.href),
    ) ?? NAV_ITEMS[0];

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-fg/10 bg-canvas/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="min-w-0 flex-1">
        <p className="mono-label text-[10px] text-mint">{current.kicker}</p>
        <h1 className="truncate font-sans text-lg font-semibold leading-tight text-fg">
          {current.label}
        </h1>
      </div>

      <button
        onClick={onOpenSearch}
        className="flex h-10 items-center gap-2 rounded-pill border border-fg/15 bg-canvas/60 px-3 text-fg-secondary transition-colors hover:border-fg/25 sm:w-64 sm:px-4"
      >
        <Search className="h-4 w-4" />
        <span className="font-sans text-sm">Search…</span>
        <kbd className="mono-label ml-auto hidden text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <ThemeToggle />
    </header>
  );
}
