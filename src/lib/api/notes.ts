import { api } from './client';
import { buildQuery } from '../utils';
import type {
  Note,
  NotePriority,
  NoteStatus,
  NoteSummary,
  Paginated,
} from '../types';

export interface NoteQuery {
  search?: string;
  status?: NoteStatus;
  priority?: NotePriority;
  projectName?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateNoteInput {
  taskName: string;
  taskDescription?: string;
  priority?: NotePriority;
  status?: NoteStatus;
  assignedBy?: string;
  projectName?: string;
  attachments?: string[];
  links?: string[];
}

export type UpdateNoteInput = Partial<CreateNoteInput>;

export const notesApi = {
  list: (q: NoteQuery = {}, signal?: AbortSignal) =>
    api.get<Paginated<Note>>('/notes', buildQuery(q as Record<string, unknown>), signal),

  summary: () => api.get<NoteSummary>('/notes/summary'),

  get: (id: string) => api.get<Note>(`/notes/${id}`),

  create: (input: CreateNoteInput) => api.post<Note>('/notes', input),

  update: (id: string, input: UpdateNoteInput) =>
    api.patch<Note>(`/notes/${id}`, input),

  remove: (id: string) => api.delete<{ deleted: true }>(`/notes/${id}`),
};
