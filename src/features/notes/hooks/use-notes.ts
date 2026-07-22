'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notesApi, type NoteQuery } from '@/lib/api/notes';
import { queryKeys } from '@/lib/query-keys';

export function useNoteList(query: NoteQuery = {}) {
  return useQuery({
    queryKey: queryKeys.notes.list(query),
    queryFn: ({ signal }) => notesApi.list(query, signal),
  });
}

export function useNoteSummary() {
  return useQuery({
    queryKey: queryKeys.notes.summary,
    queryFn: notesApi.summary,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof notesApi.create>[0]) =>
      notesApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notes.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Notes Saved');
    },
    onError: (e: Error) => toast.error(e.message || 'Could not save note'),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof notesApi.update>[1];
    }) => notesApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notes.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Note Updated');
    },
    onError: (e: Error) => toast.error(e.message || 'Could not update note'),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notes.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Note Deleted');
    },
    onError: (e: Error) => toast.error(e.message || 'Could not delete note'),
  });
}
