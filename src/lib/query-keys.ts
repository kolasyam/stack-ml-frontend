import type { ResourceQuery } from './api/resources';
import type { NoteQuery } from './api/notes';
import type { TodoQuery } from './api/todos';

/**
 * Centralised React Query keys so cache invalidation stays consistent across
 * hooks and optimistic updates.
 */
export const queryKeys = {
  resources: {
    all: ['resources'] as const,
    list: (q: ResourceQuery) => ['resources', 'list', q] as const,
    detail: (id: string) => ['resources', 'detail', id] as const,
    fileUrl: (id: string) => ['resources', 'file-url', id] as const,
  },
  todos: {
    all: ['todos'] as const,
    list: (q: TodoQuery) => ['todos', 'list', q] as const,
    summary: ['todos', 'summary'] as const,
    detail: (id: string) => ['todos', 'detail', id] as const,
  },
  notes: {
    all: ['notes'] as const,
    list: (q: NoteQuery) => ['notes', 'list', q] as const,
    summary: ['notes', 'summary'] as const,
    detail: (id: string) => ['notes', 'detail', id] as const,
  },
  search: (q: string) => ['search', q] as const,
  dashboard: ['dashboard'] as const,
};
