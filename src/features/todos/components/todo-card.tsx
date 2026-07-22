'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Check,
  ExternalLink,
  Pencil,
  Trash2,
  MoreVertical,
  Clock,
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
import { PRIORITY_DOT, TODO_STATUS_STYLES } from '@/lib/constants';
import { useCreate } from '@/components/layout/create-provider';
import {
  useCompleteTodo,
  useDeleteTodo,
  useStartTodo,
} from '../hooks/use-todos';
import { formatShortDate, cn } from '@/lib/utils';
import type { ResourceSnapshot, Todo } from '@/lib/types';

export function TodoCard({ todo }: { todo: Todo }) {
  const router = useRouter();
  const { openTodo } = useCreate();
  const complete = useCompleteTodo();
  const start = useStartTodo();
  const del = useDeleteTodo();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const resource =
    typeof todo.resourceId === 'object'
      ? (todo.resourceId as ResourceSnapshot)
      : null;

  const openResource = () => {
    if (resource) router.push(`/resources/${resource.id}`);
  };

  const isDone = todo.status === 'Completed';

  return (
    <>
      <Card interactive className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'h-2 w-2 shrink-0 rounded-full',
                  PRIORITY_DOT[todo.priority],
                )}
              />
              <h3
                className={cn(
                  'truncate font-sans text-[15px] font-semibold text-fg',
                  isDone && 'text-fg-secondary line-through',
                )}
              >
                {todo.title}
              </h3>
            </div>
            {resource && (
              <button
                onClick={openResource}
                className="mt-1 flex items-center gap-1.5 text-left font-sans text-xs text-mint hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="truncate">{resource.title}</span>
              </button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Actions"
                className="rounded-full p-1.5 text-fg-secondary transition-colors hover:bg-fg/10"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={openResource}>
                <ExternalLink className="h-4 w-4" /> Open Resource
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openTodo(todo)}>
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

        {todo.description && (
          <p className="line-clamp-2 font-sans text-xs text-fg-secondary">
            {todo.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral" className={cn(TODO_STATUS_STYLES[todo.status])}>
            {todo.status}
          </Badge>
          {todo.estimatedTime && (
            <span className="mono-label flex items-center gap-1 text-[10px] text-fg-secondary">
              <Clock className="h-3 w-3" />
              {todo.estimatedTime}
            </span>
          )}
          {todo.dueDate && (
            <span className="mono-label text-[10px] text-fg-secondary">
              DUE {formatShortDate(todo.dueDate).toUpperCase()}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1">
          {!isDone && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => start.mutate(todo.id)}
              disabled={todo.status === 'Studying'}
            >
              <Play className="h-3.5 w-3.5" /> Start
            </Button>
          )}
          {!isDone && (
            <Button variant="primary" size="sm" onClick={() => complete.mutate(todo.id)}>
              <Check className="h-3.5 w-3.5" /> Mark Completed
            </Button>
          )}
          {isDone && (
            <Badge tone="info" className="py-0.5">
              <Check className="h-3 w-3" /> Done
            </Badge>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete todo?"
        description={`“${todo.title}” will be removed from your learning list.`}
        confirmLabel="Delete"
        danger
        pending={del.isPending}
        onConfirm={() => del.mutate(todo.id, { onSuccess: () => setConfirmOpen(false) })}
      />
    </>
  );
}
