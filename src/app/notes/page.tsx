'use client';

import * as React from 'react';
import { StickyNote, Plus, Search } from 'lucide-react';
import { NoteCard } from '@/features/notes/components/note-card';
import { NoteSummary } from '@/features/notes/components/note-summary';
import { useNoteList, useNoteSummary } from '@/features/notes/hooks/use-notes';
import { useCreate } from '@/components/layout/create-provider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { NOTE_PRIORITIES, NOTE_STATUSES } from '@/lib/constants';
import { ApiClientError } from '@/lib/api/client';
import type { NotePriority, NoteStatus } from '@/lib/types';

const PAGE_SIZE = 12;

export default function NotesPage() {
  const { openCreate } = useCreate();
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<NoteStatus | 'all'>('all');
  const [priority, setPriority] = React.useState<NotePriority | 'all'>('all');
  const [page, setPage] = React.useState(1);

  const { data: summary } = useNoteSummary();
  const query = React.useMemo(
    () => ({
      search: search || undefined,
      status: status === 'all' ? undefined : status,
      priority: priority === 'all' ? undefined : priority,
      page,
      limit: PAGE_SIZE,
    }),
    [search, status, priority, page],
  );
  const { data, isLoading, isError, error, refetch } = useNoteList(query);

  return (
    <div className="flex flex-col gap-5">
      {summary && <NoteSummary data={summary} />}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-secondary" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search notes…"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v as NoteStatus | 'all'); setPage(1); }}>
          <SelectTrigger className="hidden h-11 w-40 rounded-pill sm:flex">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {NOTE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => { setPriority(v as NotePriority | 'all'); setPage(1); }}>
          <SelectTrigger className="hidden h-11 w-40 rounded-pill sm:flex">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {NOTE_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="primary" onClick={() => openCreate('note')} className="shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>

      <div className="flex gap-2 sm:hidden">
        <Select value={status} onValueChange={(v) => { setStatus(v as NoteStatus | 'all'); setPage(1); }}>
          <SelectTrigger className="h-9 flex-1 rounded-pill">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {NOTE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => { setPriority(v as NotePriority | 'all'); setPage(1); }}>
          <SelectTrigger className="h-9 flex-1 rounded-pill">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {NOTE_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<StickyNote className="h-6 w-6" />}
          title="Couldn’t load notes"
          description={error instanceof ApiClientError ? error.message : 'Something went wrong.'}
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : data && data.items.length === 0 ? (
        <EmptyState
          icon={<StickyNote className="h-6 w-6" />}
          title="No notes yet"
          description="Capture a company task so nothing slips through the cracks."
          action={{ label: 'Add Note', onClick: () => openCreate('note') }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data?.items.map((n) => (
            <NoteCard key={n.id} note={n} />
          ))}
        </div>
      )}
    </div>
  );
}
