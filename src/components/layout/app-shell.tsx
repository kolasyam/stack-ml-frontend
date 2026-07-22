'use client';

import * as React from 'react';
import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';
import { TopBar } from './top-bar';
import { Fab } from './fab';
import { CommandPalette } from './command-palette';
import { CreateProvider } from './create-provider';

/**
 * App shell — responsive layout. Desktop: fixed sidebar + content. Mobile:
 * bottom nav + floating action button. Global ⌘K opens the command palette.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <CreateProvider>
      <div className="flex min-h-screen bg-canvas">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onOpenSearch={() => setCmdOpen(true)} />
          <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:pb-10">
            {children}
          </main>
        </div>
      </div>
      <BottomNav />
      <Fab />
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </CreateProvider>
  );
}
