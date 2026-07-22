'use client';

import { Plus, BookOpen, CheckSquare, StickyNote } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCreate } from './create-provider';

/** Mobile floating action button — quick add menu (thumb reach, bottom-right). */
export function Fab() {
  const { openCreate } = useCreate();

  return (
    <div className="fixed bottom-20 right-4 z-40 lg:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Add"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-mint text-fg-invert shadow-lg shadow-mint/20 transition-transform active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="top"
          className="mb-2 w-48 rounded-feature"
        >
          <DropdownMenuLabel>Quick Add</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => openCreate('resource')}>
            <BookOpen className="h-4 w-4 text-mint" />
            Add Resource
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openCreate('todo')}>
            <CheckSquare className="h-4 w-4 text-mint" />
            Add Todo
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openCreate('note')}>
            <StickyNote className="h-4 w-4 text-mint" />
            Add Note
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
