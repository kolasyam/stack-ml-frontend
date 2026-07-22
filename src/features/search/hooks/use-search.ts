'use client';

import { useQuery } from '@tanstack/react-query';
import { searchApi, statsApi } from '@/lib/api/search';
import { queryKeys } from '@/lib/query-keys';
import { debounce } from '@/lib/utils';

/** Debounced global search across resources / todos / notes. */
export function useGlobalSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: ({ signal }) => searchApi.global(query, 8),
    enabled: enabled && query.trim().length > 0,
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  });
}

export const debouncedSearch = debounce(
  (cb: (q: string) => void, value: string) => cb(value),
  250,
);

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: statsApi.dashboard,
  });
}
