'use client';

import {
  CheckSquare,
  CheckCircle2,
  BookOpen,
  PlayCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { StatTile } from '@/components/ui/stat-tile';
import { Progress } from '@/components/ui/progress';
import type { TodoSummary as TodoSummaryData } from '@/lib/types';

/** Todo dashboard summary — counts + completion ring. */
export function TodoSummary({ data }: { data: TodoSummaryData }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile icon={<CheckSquare className="h-4 w-4" />} label="Total" value={data.total} />
        <StatTile icon={<CheckCircle2 className="h-4 w-4" />} label="Completed" value={data.completed} accent="bg-info/10 text-info" />
        <StatTile icon={<BookOpen className="h-4 w-4" />} label="Reading" value={data.reading} accent="bg-tile-blue/10 text-tile-blue" />
        <StatTile icon={<PlayCircle className="h-4 w-4" />} label="Studying" value={data.studying} accent="bg-mint/10 text-mint" />
        <StatTile icon={<Clock className="h-4 w-4" />} label="Upcoming" value={data.upcoming} accent="bg-warning/10 text-warning" />
        <StatTile icon={<Sparkles className="h-4 w-4" />} label="New (7d)" value={data.recentlyAdded} accent="bg-violet/10 text-violet" />
      </div>
      <div className="rounded-card border border-fg/10 bg-surface/60 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="mono-label text-[10px] text-fg-secondary">COMPLETION</span>
          <span className="font-sans text-sm font-semibold text-fg">
            {data.completionPct}%
          </span>
        </div>
        <Progress value={data.completionPct} />
        <p className="mt-2 font-sans text-xs text-fg-secondary">
          {data.remaining} of {data.total} todos remaining.
        </p>
      </div>
    </div>
  );
}
