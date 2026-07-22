'use client';

import * as React from 'react';
import {
  Pencil,
  Trash2,
  MoreVertical,
  Link2,
  Paperclip,
  User,
  FolderKanban,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NOTE_STATUS_STYLES, PRIORITY_DOT } from '@/lib/constants';
import { useCreate } from '@/components/layout/create-provider';
import { useDeleteNote } from '../hooks/use-notes';
import { formatShortDate, cn } from '@/lib/utils';
import type { Note } from '@/lib/types';

export function NoteCard({ note }: { note: Note }) {
  const { openNote } = useCreate();
  const del = useDeleteNote();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <>
      <Card
        interactive
        className="flex flex-col gap-3 border-l-2 p-4"
        style={{ borderLeftColor: `rgb(var(--${
          note.priority === 'Critical'
            ? 'danger'
            : note.priority === 'High'
              ? 'tile-orange'
              : note.priority === 'Medium'
                ? 'mint'
                : 'fg-secondary'
        }))` }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', PRIORITY_DOT[note.priority])} />
              <h3 className="truncate font-sans text-[15px] font-semibold text-fg">
                {note.taskName}
              </h3>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <Badge tone="neutral" className={cn(NOTE_STATUS_STYLES[note.status])}>
                {note.status}
              </Badge>
              {note.projectName && (
                <span className="flex items-center gap-1 font-sans text-xs text-fg-secondary">
                  <FolderKanban className="h-3 w-3" /> {note.projectName}
                </span>
              )}
              {note.assignedBy && (
                <span className="flex items-center gap-1 font-sans text-xs text-fg-secondary">
                  <User className="h-3 w-3" /> {note.assignedBy}
                </span>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="Actions" className="rounded-full p-1.5 text-fg-secondary transition-colors hover:bg-fg/10">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => openNote(note)}>
                <Pencil className="h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                danger
                onSelect={(e) => {
                  e.stopPropagation();
                  setConfirmOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {note.taskDescription && (
          <p className="line-clamp-2 font-sans text-xs text-fg-secondary">
            {note.taskDescription}
          </p>
        )}

        {(note.attachments.length > 0 || note.links.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {note.attachments.slice(0, 3).map((a, i) => (
              <a
                key={`a-${i}`}
                href={a}
                target="_blank"
                rel="noopener noreferrer"
                className="mono-label flex items-center gap-1 rounded-pill border border-fg/15 px-2 py-0.5 text-[10px] text-fg-secondary hover:border-mint/40"
              >
                <Paperclip className="h-3 w-3" /> attach
              </a>
            ))}
            {note.links.slice(0, 3).map((l, i) => (
              <a
                key={`l-${i}`}
                href={l}
                target="_blank"
                rel="noopener noreferrer"
                className="mono-label flex items-center gap-1 rounded-pill border border-fg/15 px-2 py-0.5 text-[10px] text-mint hover:border-mint/40"
              >
                <Link2 className="h-3 w-3" /> link
              </a>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="mono-label text-[10px] text-fg-secondary">
            {formatShortDate(note.createdAt).toUpperCase()}
          </span>
          <Button variant="ghost" size="sm" onClick={() => openNote(note)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete note?"
        description={`“${note.taskName}” will be removed.`}
        confirmLabel="Delete"
        danger
        pending={del.isPending}
        onConfirm={() => del.mutate(note.id, { onSuccess: () => setConfirmOpen(false) })}
      />
    </>
  );
}
