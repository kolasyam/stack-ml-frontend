'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { resourcesApi, type ResourceQuery, type CreateHighlightInput, type UpdateHighlightInput } from '@/lib/api/resources';
import { queryKeys } from '@/lib/query-keys';
import type { Resource } from '@/lib/types';

/**
 * List resources with search / filter / sort / pagination.
 *
 * `enabled` is accepted so callers that mount this hook eagerly (e.g. the
 * always-mounted Todo form dialog) can defer the network request until the
 * UI that actually needs the list is open — avoids an unnecessary fetch on
 * every page load.
 */
export function useResourceList(query: ResourceQuery = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.resources.list(query),
    queryFn: ({ signal }) => resourcesApi.list(query, signal),
    enabled,
  });
}

/** Single resource detail. */
export function useResource(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.resources.detail(id ?? ''),
    queryFn: ({ signal }) => resourcesApi.get(id as string),
    enabled: !!id,
  });
}

export function useResourceFileUrl(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.resources.fileUrl(id ?? ''),
    queryFn: ({ signal }) => resourcesApi.fileUrl(id as string),
    enabled: !!id,
  });
}

export function useCreateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof resourcesApi.create>[0]) =>
      resourcesApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resources.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Resource Added Successfully');
    },
    onError: (e: Error) => toast.error(e.message || 'Could not add resource'),
  });
}

export function useUpdateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof resourcesApi.update>[1];
    }) => resourcesApi.update(id, input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.resources.all });
      qc.invalidateQueries({ queryKey: queryKeys.resources.detail(data.id) });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Resource Updated');
    },
    onError: (e: Error) => toast.error(e.message || 'Could not update resource'),
  });
}

export function useDeleteResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resourcesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resources.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Resource Deleted');
    },
    onError: (e: Error) => toast.error(e.message || 'Could not delete resource'),
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resourcesApi.toggleFavorite(id),
    // Optimistic flip so the star reacts instantly.
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.resources.detail(id) });
      const prev = qc.getQueryData<Resource>(
        queryKeys.resources.detail(id),
      );
      if (prev) {
        qc.setQueryData(queryKeys.resources.detail(id), {
          ...prev,
          favorite: !prev.favorite,
        });
      }
      return { prev };
    },
    onError: (_e, id, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.resources.detail(id), ctx.prev);
    },
    onSettled: (data) => {
      if (data) {
        qc.invalidateQueries({ queryKey: queryKeys.resources.all });
        qc.invalidateQueries({ queryKey: queryKeys.resources.detail(data.id) });
      }
    },
  });
}

/** Persist reader progress. Debounced by the caller; silent on error. */
export function useUpdateProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      currentPage,
      readingProgress,
    }: {
      id: string;
      currentPage?: number;
      readingProgress?: number;
    }) => resourcesApi.progress(id, { currentPage, readingProgress }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.resources.detail(data.id) });
    },
    onError: () => {
      /* silent — reader progress must never interrupt reading */
    },
  });
}

export function useAddBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      page,
      note,
    }: {
      id: string;
      page: number;
      note?: string;
    }) => resourcesApi.addBookmark(id, { page, note }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.resources.detail(data.id) });
      toast.success('Bookmark Saved');
    },
    onError: (e: Error) => toast.error(e.message || 'Could not save bookmark'),
  });
}

export function useRemoveBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, page }: { id: string; page: number }) =>
      resourcesApi.removeBookmark(id, page),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.resources.detail(data.id) });
      toast.success('Bookmark Removed');
    },
    onError: (e: Error) =>
      toast.error(e.message || 'Could not remove bookmark'),
  });
}

/**
 * Highlights — persisted text selections in the PDF reader. We patch the
 * resource-detail cache directly (the mutation returns the full resource) so
 * the reader stays on the current page without a refetch flash.
 */
export function useAddHighlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateHighlightInput }) =>
      resourcesApi.addHighlight(id, input),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.resources.detail(data.id), data);
      toast.success('Highlight Saved');
    },
    onError: (e: Error) => toast.error(e.message || 'Could not save highlight'),
  });
}

export function useUpdateHighlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      highlightId,
      input,
    }: {
      id: string;
      highlightId: string;
      input: UpdateHighlightInput;
    }) => resourcesApi.updateHighlight(id, highlightId, input),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.resources.detail(data.id), data);
    },
    onError: (e: Error) => toast.error(e.message || 'Could not update highlight'),
  });
}

export function useRemoveHighlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, highlightId }: { id: string; highlightId: string }) =>
      resourcesApi.removeHighlight(id, highlightId),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.resources.detail(data.id), data);
      toast.success('Highlight Removed');
    },
    onError: (e: Error) =>
      toast.error(e.message || 'Could not remove highlight'),
  });
}
