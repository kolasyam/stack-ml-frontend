import { api } from './client';
import { buildQuery } from '../utils';
import type { DashboardData, SearchResult } from '../types';

export const searchApi = {
  global: (q: string, limit = 8, signal?: AbortSignal) =>
    api.get<SearchResult>(
      '/search',
      buildQuery({ q, limit: limit.toString() }),
      signal,
    ),
};

export const statsApi = {
  dashboard: () => api.get<DashboardData>('/stats/dashboard'),
};
