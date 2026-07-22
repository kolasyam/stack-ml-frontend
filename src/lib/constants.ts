import type {
  NotePriority,
  NoteStatus,
  ResourceDifficulty,
  ResourcePriority,
  ResourceStatus,
  ResourceType,
  TodoEstimatedTime,
  TodoStatus,
} from './types';

export const RESOURCE_TYPES: ResourceType[] = [
  'GitHub',
  'PDF',
  'Documentation',
  'YouTube',
  'Instagram',
  'LinkedIn',
  'Website',
  'Research Paper',
  'DOC',
  'DOCX',
  'Other',
];

export const RESOURCE_DIFFICULTIES: ResourceDifficulty[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
];

export const RESOURCE_PRIORITIES: ResourcePriority[] = ['Low', 'Medium', 'High'];

export const RESOURCE_STATUSES: ResourceStatus[] = [
  'Not Started',
  'Reading',
  'Completed',
];

export const TODO_STATUSES: TodoStatus[] = [
  'Not Started',
  'Studying',
  'Reading',
  'Completed',
];

export const TODO_ESTIMATED_TIMES: TodoEstimatedTime[] = [
  '30 mins',
  '1 hour',
  '2 hours',
  'Custom',
];

export const NOTE_PRIORITIES: NotePriority[] = [
  'Low',
  'Medium',
  'High',
  'Critical',
];

export const NOTE_STATUSES: NoteStatus[] = [
  'Not Started',
  'In Progress',
  'Blocked',
  'Completed',
];

export const RESOURCE_SORTS: { value: string; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'recentlyRead', label: 'Recently Read' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'priority', label: 'Priority' },
  { value: 'progress', label: 'Reading Progress' },
];

export const TODO_SORTS: { value: string; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate', label: 'Due Date' },
];

export const NOTE_SORTS: { value: string; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'priority', label: 'Priority' },
  { value: 'project', label: 'Project' },
];

/** Resource types that open in the integrated document reader. */
export const DOCUMENT_TYPES: ResourceType[] = [
  'PDF',
  'DOC',
  'DOCX',
  'Research Paper',
  'Documentation',
];

export function isDocumentType(type: ResourceType): boolean {
  return DOCUMENT_TYPES.includes(type);
}

/** Tailwind text/border classes for each priority (used by badges). */
export const PRIORITY_STYLES: Record<string, string> = {
  Low: 'text-fg-secondary border-fg/15',
  Medium: 'text-mint border-mint/40',
  High: 'text-tile-orange border-tile-orange/40',
  Critical: 'text-danger border-danger/50',
};

/** Solid-ish fills for priority dots. */
export const PRIORITY_DOT: Record<string, string> = {
  Low: 'bg-fg-secondary',
  Medium: 'bg-mint',
  High: 'bg-tile-orange',
  Critical: 'bg-danger',
};

/** Status pill styles per domain. */
export const RESOURCE_STATUS_STYLES: Record<ResourceStatus, string> = {
  'Not Started': 'text-fg-secondary border-fg/15',
  Reading: 'text-mint border-mint/40',
  Completed: 'text-info border-info/40',
};

export const TODO_STATUS_STYLES: Record<TodoStatus, string> = {
  'Not Started': 'text-fg-secondary border-fg/15',
  Studying: 'text-mint border-mint/40',
  Reading: 'text-tile-blue border-tile-blue/40',
  Completed: 'text-info border-info/40',
};

export const NOTE_STATUS_STYLES: Record<NoteStatus, string> = {
  'Not Started': 'text-fg-secondary border-fg/15',
  'In Progress': 'text-mint border-mint/40',
  Blocked: 'text-danger border-danger/50',
  Completed: 'text-info border-info/40',
};

/** Sort rank so priority ordering matches the backend (higher = more urgent). */
export const PRIORITY_RANK: Record<string, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};
