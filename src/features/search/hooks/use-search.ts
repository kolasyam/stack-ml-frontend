'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchApi, statsApi } from '@/lib/api/search';
import { queryKeys } from '@/lib/query-keys';
/** Debounced global search across resources / todos / notes. */
export function useGlobalSearch(query: string, enabled = true) {
  const [debouncedQuery, setDebouncedQuery] = React.useState(query);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: queryKeys.search(debouncedQuery),
    queryFn: ({ signal }) => searchApi.global(debouncedQuery, 8, signal),
    enabled: enabled && debouncedQuery.trim().length > 0,
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: statsApi.dashboard,
  });
}
