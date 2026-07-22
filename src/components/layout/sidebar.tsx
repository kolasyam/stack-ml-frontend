'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { NAV_ITEMS } from '@/components/nav-config';
import { Button } from '@/components/ui/button';
import { useCreate } from './create-provider';
import { cn } from '@/lib/utils';

/** Desktop sidebar — brand wordmark, primary nav, quick-add. */
export function Sidebar() {
  const pathname = usePathname();
  const { openCreate } = useCreate();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-fg/10 bg-canvas/60 px-4 py-6 lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-feature bg-mint text-fg-invert">
          <span className="display text-lg leading-none">M</span>
        </span>
        <span className="font-sans text-sm font-semibold leading-tight text-fg">
          ML Knowledge
          <br />
          <span className="text-fg-secondary">Hub</span>
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
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
                'group flex items-center gap-3 rounded-pill px-3 py-2.5 font-sans text-sm transition-colors',
                active
                  ? 'bg-mint/10 text-mint'
                  : 'text-fg-secondary hover:bg-fg/5 hover:text-fg',
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => openCreate('resource')}
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </Button>
      </div>
    </aside>
  );
}
