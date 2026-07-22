'use client';

import {
  StickyNote,
  CheckCircle2,
  Loader2,
  Ban,
  Circle,
  AlertTriangle,
} from 'lucide-react';
import { StatTile } from '@/components/ui/stat-tile';
import type { NoteSummary as NoteSummaryData } from '@/lib/types';

/** Notes (work tasks) dashboard summary. */
export function NoteSummary({ data }: { data: NoteSummaryData }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      <StatTile icon={<StickyNote className="h-4 w-4" />} label="Total" value={data.total} />
      <StatTile icon={<CheckCircle2 className="h-4 w-4" />} label="Completed" value={data.completed} accent="bg-info/10 text-info" />
      <StatTile icon={<Loader2 className="h-4 w-4" />} label="In Progress" value={data.inProgress} accent="bg-mint/10 text-mint" />
      <StatTile icon={<Ban className="h-4 w-4" />} label="Blocked" value={data.blocked} accent="bg-danger/10 text-danger" />
      <StatTile icon={<Circle className="h-4 w-4" />} label="Not Started" value={data.notStarted} accent="bg-fg/10 text-fg-secondary" />
      <StatTile icon={<AlertTriangle className="h-4 w-4" />} label="Critical" value={data.critical} accent="bg-warning/10 text-warning" />
      <StatTile icon={<StickyNote className="h-4 w-4" />} label="Remaining" value={data.remaining} />
    </div>
  );
}
