'use client';

import * as React from 'react';
import { CheckSquare, BookOpen, Plus, Search } from 'lucide-react';
import { TodoCard } from '@/features/todos/components/todo-card';
import { TodoSummary } from '@/features/todos/components/todo-summary';
import { useTodoList, useTodoSummary } from '@/features/todos/hooks/use-todos';
import { useResourceList } from '@/features/resources/hooks/use-resources';
import { useCreate } from '@/components/layout/create-provider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { RESOURCE_PRIORITIES, TODO_STATUSES } from '@/lib/constants';
import { ApiClientError } from '@/lib/api/client';
import type {
  ResourcePriority,
  TodoStatus,
} from '@/lib/types';

const PAGE_SIZE = 12;

export default function TodosPage() {
  const { openCreate } = useCreate();
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<TodoStatus | 'all'>('all');
  const [priority, setPriority] = React.useState<ResourcePriority | 'all'>('all');
  const [page, setPage] = React.useState(1);

  const { data: summary } = useTodoSummary();
  const { data: resourcesCheck } = useResourceList({ limit: 1 });
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
  const { data, isLoading, isError, error, refetch } = useTodoList(query);

  const hasNoResources = resourcesCheck?.total === 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary */}
      {summary && <TodoSummary data={summary} />}

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-secondary" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search todos…"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v as TodoStatus | 'all'); setPage(1); }}>
          <SelectTrigger className="hidden h-11 w-40 rounded-pill sm:flex">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TODO_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => { setPriority(v as ResourcePriority | 'all'); setPage(1); }}>
          <SelectTrigger className="hidden h-11 w-40 rounded-pill sm:flex">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {RESOURCE_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="primary" onClick={() => openCreate('todo')} className="shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>

      {/* Mobile filter chips */}
      <div className="flex gap-2 sm:hidden">
        <Select value={status} onValueChange={(v) => { setStatus(v as TodoStatus | 'all'); setPage(1); }}>
          <SelectTrigger className="h-9 flex-1 rounded-pill">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TODO_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => { setPriority(v as ResourcePriority | 'all'); setPage(1); }}>
          <SelectTrigger className="h-9 flex-1 rounded-pill">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {RESOURCE_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {hasNoResources ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No learning resources available"
          description="Please add a resource first before creating a personal learning todo."
          action={{ label: 'Add Resource', onClick: () => openCreate('resource') }}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<CheckSquare className="h-6 w-6" />}
          title="Couldn’t load todos"
          description={error instanceof ApiClientError ? error.message : 'Something went wrong.'}
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : data && data.items.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-6 w-6" />}
          title="No todos yet"
          description="Turn your resources into a study plan. Add a todo linked to a resource."
          action={{ label: 'Add Todo', onClick: () => openCreate('todo') }}
        />
      ) : (
        <>
          {data?.total ? (
            <p className="mono-label text-[10px] text-fg-secondary">
              {data.total} TODO{data.total === 1 ? '' : 'S'}
            </p>
          ) : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data?.items.map((t) => (
              <TodoCard key={t.id} todo={t} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
