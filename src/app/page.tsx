'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  Star,
  FileText,
  Clock,
  CheckSquare,
  StickyNote,
  Plus,
  PlayCircle,
  ArrowRight,
} from 'lucide-react';

import { useDashboard } from '@/features/search/hooks/use-search';
import { useCreate } from '@/components/layout/create-provider';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ResourceTypeIcon } from '@/features/shared/type-icon';
import { PRIORITY_DOT, RESOURCE_STATUS_STYLES, NOTE_STATUS_STYLES, TODO_STATUS_STYLES } from '@/lib/constants';
import { formatShortDate, relativeTime, remainingTime, cn } from '@/lib/utils';
import { ApiClientError } from '@/lib/api/client';

export default function DashboardPage() {
  const router = useRouter();
  const { openCreate } = useCreate();
  const { data, isLoading, isError, error, refetch } = useDashboard();

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting + quick actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mono-label text-[10px] text-mint">PERSONAL LEARNING</p>
          <h2 className="font-sans text-xl font-semibold text-fg">
            Your AI/ML command center
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={() => openCreate('resource')}>
            <Plus className="h-4 w-4" /> Resource
          </Button>
          <Button variant="secondary" size="sm" onClick={() => openCreate('todo')}>
            <Plus className="h-4 w-4" /> Todo
          </Button>
          <Button variant="secondary" size="sm" onClick={() => openCreate('note')}>
            <Plus className="h-4 w-4" /> Note
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="Couldn’t load dashboard"
          description={error instanceof ApiClientError ? error.message : 'Is the backend running?'}
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : data ? (
        <>
          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <StatTile icon={<BookOpen className="h-4 w-4" />} label="Resources" value={data.resources.total} />
            <StatTile icon={<BookOpen className="h-4 w-4" />} label="Reading" value={data.resources.reading} accent="bg-tile-blue/10 text-tile-blue" />
            <StatTile icon={<CheckCircle2 className="h-4 w-4" />} label="Completed" value={data.resources.completed} accent="bg-info/10 text-info" />
            <StatTile icon={<Star className="h-4 w-4" />} label="Favorites" value={data.resources.favorites} accent="bg-warning/10 text-warning" />
            <StatTile icon={<FileText className="h-4 w-4" />} label="Total PDFs" value={data.resources.pdfs} accent="bg-danger/10 text-danger" />
            <StatTile icon={<Clock className="h-4 w-4" />} label="Todo Pending" value={data.todos.remaining} accent="bg-violet/10 text-violet" />
            <StatTile icon={<CheckSquare className="h-4 w-4" />} label="Todo Done" value={data.todos.completed} accent="bg-mint/10 text-mint" />
            <StatTile icon={<StickyNote className="h-4 w-4" />} label="Company Tasks" value={data.notes.total} accent="bg-tile-orange/10 text-tile-orange" />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            {/* Current reading */}
            <CurrentReading
              resource={data.currentReading}
              onOpen={(id) => router.push(`/resources/${id}`)}
              onContinue={() => data.currentReading && router.push(`/resources/${data.currentReading.id}`)}
            />

            {/* Continue reading quick action + completion */}
            <Card className="flex flex-col justify-between gap-4 p-5">
              <div>
                <p className="mono-label text-[10px] text-fg-secondary">QUICK ACTIONS</p>
                <div className="mt-3 flex flex-col gap-2">
                  <QuickAction icon={<BookOpen className="h-4 w-4 text-mint" />} label="Add Resource" onClick={() => openCreate('resource')} />
                  <QuickAction icon={<CheckSquare className="h-4 w-4 text-mint" />} label="Add Todo" onClick={() => openCreate('todo')} />
                  <QuickAction icon={<StickyNote className="h-4 w-4 text-mint" />} label="Add Note" onClick={() => openCreate('note')} />
                </div>
              </div>
              <div className="rounded-card border border-fg/10 bg-canvas/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="mono-label text-[10px] text-fg-secondary">LEARNING PROGRESS</span>
                  <span className="font-sans text-sm font-semibold text-fg">{data.todos.completionPct}%</span>
                </div>
                <Progress value={data.todos.completionPct} className="mt-2" />
              </div>
            </Card>
          </div>

          {/* Recent items */}
          <div className="grid gap-5 lg:grid-cols-3">
            <RecentColumn
              title="Recent Uploads"
              href="/resources"
              items={data.recentResources.map((r) => ({
                id: r.id,
                primary: r.title,
                secondary: r.type,
                icon: <ResourceTypeIcon type={r.type} className="h-4 w-4" />,
                meta: formatShortDate(r.createdAt),
                status: (
                  <Badge tone="neutral" className={cn('py-0.5', RESOURCE_STATUS_STYLES[r.status])}>
                    {r.status}
                  </Badge>
                ),
              }))}
            />
            <RecentColumn
              title="Recent Todos"
              href="/todos"
              items={data.recentTodos.map((t) => {
                const res = typeof t.resourceId === 'object' ? t.resourceId : null;
                return {
                  id: t.id,
                  to: '/todos',
                  primary: t.title,
                  secondary: res?.title ?? 'Linked resource',
                  icon: <CheckSquare className="h-4 w-4 text-mint" />,
                  meta: formatShortDate(t.createdAt),
                  status: (
                    <Badge tone="neutral" className={cn('py-0.5', TODO_STATUS_STYLES[t.status])}>
                      {t.status}
                    </Badge>
                  ),
                };
              })}
            />
            <RecentColumn
              title="Recent Notes"
              href="/notes"
              items={data.recentNotes.map((n) => ({
                id: n.id,
                to: '/notes',
                primary: n.taskName,
                secondary: n.projectName ?? n.status,
                icon: <StickyNote className="h-4 w-4 text-mint" />,
                meta: relativeTime(n.createdAt),
                status: (
                  <Badge tone="neutral" className={cn('py-0.5', NOTE_STATUS_STYLES[n.status])}>
                    {n.status}
                  </Badge>
                ),
              }))}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function CurrentReading({
  resource,
  onOpen,
  onContinue,
}: {
  resource: import('@/lib/types').Resource | null;
  onOpen: (id: string) => void;
  onContinue: () => void;
}) {
  if (!resource) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/10 text-mint">
          <PlayCircle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-sans text-base font-semibold text-fg">Nothing in progress</h3>
          <p className="mt-1 font-sans text-sm text-fg-secondary">
            Start reading a resource to pick up where you left off.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => onOpen('')}>
          Browse Resources
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-feature bg-fg/5">
          <ResourceTypeIcon type={resource.type} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="mono-label text-[10px] text-mint">CONTINUE READING</p>
          <h3 className="mt-0.5 truncate font-sans text-base font-semibold text-fg">
            {resource.title}
          </h3>
          <p className="mono-label text-[10px] text-fg-secondary">
            {resource.type} · PAGE {resource.currentPage}
            {resource.estimatedReadingTime
              ? ` · ${remainingTime(resource.readingProgress, resource.estimatedReadingTime)}`
              : ''}
          </p>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <span className="mono-label text-[10px] text-fg-secondary">PROGRESS</span>
          <span className="font-sans text-sm font-semibold text-fg">{resource.readingProgress}%</span>
        </div>
        <Progress value={resource.readingProgress} className="mt-2" />
      </div>
      <Button variant="primary" onClick={onContinue}>
        <PlayCircle className="h-4 w-4" /> Continue Reading
      </Button>
    </Card>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-pill border border-fg/10 bg-canvas/40 px-4 py-3 text-left transition-colors hover:border-mint/40"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-feature bg-mint/10">
        {icon}
      </span>
      <span className="font-sans text-sm text-fg">{label}</span>
    </button>
  );
}

function RecentColumn({
  title,
  href,
  items,
}: {
  title: string;
  href: string;
  items: {
    id: string;
    to?: string;
    primary: string;
    secondary: string;
    icon: React.ReactNode;
    meta: string;
    status: React.ReactNode;
  }[];
}) {
  return (
    <Card className="flex flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="mono-label text-[10px] text-fg-secondary">{title.toUpperCase()}</p>
        <Link href={href} className="mono-label flex items-center gap-1 text-[10px] text-mint hover:underline">
          ALL <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center font-sans text-xs text-fg-secondary">Nothing yet.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {items.map((it) => (
            <Link
              key={it.id}
              href={it.to ?? `${href}/${it.id}`}
              className="flex items-center gap-3 rounded-pill px-2 py-2 transition-colors hover:bg-fg/5"
            >
              <span className="text-fg-secondary">{it.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-sans text-sm text-fg">{it.primary}</span>
                <span className="block truncate font-sans text-[11px] text-fg-secondary">{it.secondary}</span>
              </span>
              {it.status}
              <span className="mono-label hidden text-[9px] text-fg-secondary sm:inline">{it.meta}</span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
