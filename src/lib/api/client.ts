import type { ApiError } from '../types';

/**
 * Centralised API client.
 *
 * Wraps `fetch` against the NestJS backend and unwraps its uniform envelope
 * `{ success, data, message?, timestamp, path }`. On any non-2xx response the
 * backend returns `{ success:false, statusCode, error, message }`; we surface
 * `message` (a string or string[] from class-validator) as the thrown error so
 * callers / toasts can show it directly.
 */

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1'
).replace(/\/$/, '');

export class ApiClientError extends Error {
  statusCode: number;
  error: string;
  details?: string[];
  path: string;
  constructor(payload: ApiError) {
    const message = Array.isArray(payload.message)
      ? payload.message.join('. ')
      : payload.message;
    super(message || payload.error || 'Request failed');
    this.name = 'ApiClientError';
    this.statusCode = payload.statusCode;
    this.error = payload.error;
    this.path = payload.path;
    this.details = Array.isArray(payload.message) ? payload.message : undefined;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Skip JSON serialisation (pass a raw BodyInit, e.g. FormData). */
  rawBody?: boolean;
  signal?: AbortSignal;
  /** Extra query appended to the URL (already-encoded string). */
  query?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, rawBody, signal, query } = options;
  const url = `${BASE_URL}${path}${query ?? ''}`;

  const headers: Record<string, string> = {};
  let payload: BodyInit | undefined;
  if (rawBody && body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(url, { method, headers, body: payload, signal });
  } catch (err) {
    // Network failure — no backend / CORS / offline.
    throw new ApiClientError({
      success: false,
      statusCode: 0,
      path,
      method,
      timestamp: new Date().toISOString(),
      error: 'NetworkError',
      message: 'Could not reach the server. Is the backend running?',
    });
  }

  // 204 / empty body
  if (res.status === 204) {
    return undefined as T;
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    if (!res.ok) {
      throw new ApiClientError({
        success: false,
        statusCode: res.status,
        path,
        method,
        timestamp: new Date().toISOString(),
        error: 'ParseError',
        message: res.statusText || 'Failed to parse server response',
      });
    }
    return undefined as T;
  }

  if (!res.ok) {
    throw new ApiClientError(json as ApiError);
  }

  // Envelope: { success, data, message?, ... }
  const envelope = json as { success: boolean; data: T; message?: string };
  return envelope.data;
}

export const api = {
  get: <T>(path: string, query?: string, signal?: AbortSignal) =>
    request<T>(path, { method: 'GET', query, signal }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'DELETE', body }),
  /** Upload multipart/form-data (field name handled by caller). */
  upload: <T>(path: string, form: FormData) =>
    request<T>(path, { method: 'POST', body: form, rawBody: true }),
};

export { BASE_URL };
