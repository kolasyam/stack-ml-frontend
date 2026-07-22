import { api } from './client';

/**
 * Description improver — thin API wrapper.
 *
 * Calls the backend `POST /description/improve` endpoint, which runs Grammarify
 * (or a safe fallback) and returns the improved text only. All requests go
 * through the shared `api` client so they inherit the envelope unwrapping,
 * error normalisation and base-URL config — no inline fetch calls.
 */
export const descriptionsApi = {
  improve: (text: string) =>
    api.post<string>('/description/improve', { text }),
};
