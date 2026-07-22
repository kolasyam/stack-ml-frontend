'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  BookOpen,
  CheckSquare,
  StickyNote,
  CornerDownLeft,
  Plus,
} from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ResourceTypeIcon } from '@/features/shared/type-icon';
import { useGlobalSearch } from '@/features/search/hooks/use-search';
import { useCreate } from './create-provider';
import { cn } from '@/lib/utils';

type Item =
  | { kind: 'action'; label: string; icon: React.ReactNode; run: () => void }
  | { kind: 'resource'; id: string; title: string; type: string }
  | { kind: 'todo'; id: string; title: string }
  | { kind: 'note'; id: string; title: string };

/**
 * Global command palette (⌘K) — instant search across resources / todos /
 * notes plus quick-create shortcuts. Keyboard navigable.
 */
export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { openCreate } = useCreate();
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { data } = useGlobalSearch(query, open);

  const items = React.useMemo<Item[]>(() => {
    const actions: Item[] = [
      { kind: 'action', label: 'Add Resource', icon: <BookOpen className="h-4 w-4 text-mint" />, run: () => openCreate('resource') },
      { kind: 'action', label: 'Add Todo', icon: <CheckSquare className="h-4 w-4 text-mint" />, run: () => openCreate('todo') },
      { kind: 'action', label: 'Add Note', icon: <StickyNote className="h-4 w-4 text-mint" />, run: () => openCreate('note') },
    ];
    if (!query.trim()) return actions;
    const results: Item[] = [];
    for (const r of data?.resources ?? []) {
      results.push({ kind: 'resource', id: r.id, title: r.title, type: r.type });
    }
    for (const t of data?.todos ?? []) {
      results.push({ kind: 'todo', id: t.id, title: t.title });
    }
    for (const n of data?.notes ?? []) {
      results.push({ kind: 'note', id: n.id, title: n.taskName });
    }
    return [...actions, ...results];
  }, [query, data, openCreate]);

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  React.useEffect(() => setActive(0), [query]);

  const go = (item: Item) => {
    onOpenChange(false);
    if (item.kind === 'action') {
      item.run();
      return;
    }
    if (item.kind === 'resource') router.push(`/resources/${item.id}`);
    else if (item.kind === 'todo') router.push('/todos');
    else router.push('/notes');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = items[active];
      if (item) go(item);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          onKeyDown={onKeyDown}
          className="fixed left-1/2 top-[12vh] z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-feature border border-fg/10 bg-surface shadow-2xl shadow-black/60 data-[state=open]:animate-fade-in"
        >
          <DialogPrimitive.Title className="sr-only">
            Search
          </DialogPrimitive.Title>
          <div className="flex items-center gap-3 border-b border-fg/10 px-4">
            <Search className="h-4 w-4 text-fg-secondary" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources, todos, notes…"
              className="h-12 flex-1 bg-transparent font-sans text-sm text-fg outline-none placeholder:text-fg-secondary"
            />
            <kbd className="mono-label text-[10px] text-fg-secondary">ESC</kbd>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query.trim() && items.length <= 3 && (
              <p className="px-3 py-6 text-center font-sans text-sm text-fg-secondary">
                No matches for “{query}”.
              </p>
            )}
            {items.map((item, i) => {
              const isActive = i === active;
              return (
                <button
                  key={`${item.kind}-${'id' in item ? item.id : item.label}-${i}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(item)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-pill px-3 py-2.5 text-left transition-colors',
                    isActive ? 'bg-mint/10 text-fg' : 'text-fg-secondary',
                  )}
                >
                  {item.kind === 'action' ? (
                    <>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint/10">
                        {item.icon}
                      </span>
                      <span className="flex items-center gap-1.5 font-sans text-sm text-fg">
                        <Plus className="h-3.5 w-3.5 text-mint" />
                        {item.label}
                      </span>
                    </>
                  ) : item.kind === 'resource' ? (
                    <>
                      <ResourceTypeIcon
                        type={item.type as never}
                        className="h-4 w-4"
                      />
                      <span className="min-w-0 flex-1 truncate font-sans text-sm text-fg">
                        {item.title}
                      </span>
                      <span className="mono-label text-[10px] text-fg-secondary">
                        Resource
                      </span>
                    </>
                  ) : (
                    <>
                      {item.kind === 'todo' ? (
                        <CheckSquare className="h-4 w-4 text-mint" />
                      ) : (
                        <StickyNote className="h-4 w-4 text-mint" />
                      )}
                      <span className="min-w-0 flex-1 truncate font-sans text-sm text-fg">
                        {item.title}
                      </span>
                      <span className="mono-label text-[10px] text-fg-secondary">
                        {item.kind === 'todo' ? 'Todo' : 'Note'}
                      </span>
                    </>
                  )}
                  {isActive && (
                    <CornerDownLeft className="h-3.5 w-3.5 text-fg-secondary" />
                  )}
                </button>
              );
            })}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
