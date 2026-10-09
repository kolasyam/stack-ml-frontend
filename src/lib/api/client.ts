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
  requestId?: string;
  constructor(payload: ApiError) {
    const message = Array.isArray(payload.message)
      ? payload.message.join('. ')
      : payload.message;
    super(message || payload.error || 'Request failed');
    this.name = 'ApiClientError';
    this.statusCode = payload.statusCode;
    this.error = payload.error;
    this.path = payload.path;
    this.requestId = payload.requestId;
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

export interface UploadOptions {
  signal?: AbortSignal;
  onProgress?: (percentage: number) => void;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, rawBody, signal, query } = options;
  const url = `${BASE_URL}${path}${query ?? ''}`;

  const headers: Record<string, string> = {};
  // A browser-generated id lets the same request be traced across frontend
  // logs, the API, and any downstream service logs.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    headers['X-Request-Id'] = crypto.randomUUID();
  }
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (apiKey) headers['X-Api-Key'] = apiKey;
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
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
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

/**
 * XMLHttpRequest is used for multipart uploads because fetch does not expose
 * browser upload progress. It preserves the same response envelope and abort
 * semantics as the fetch-based client.
 */
function uploadRequest<T>(
  path: string,
  form: FormData,
  options: UploadOptions = {},
): Promise<T> {
  if (typeof XMLHttpRequest === 'undefined') {
    return request<T>(path, {
      method: 'POST',
      body: form,
      rawBody: true,
      signal: options.signal,
    });
  }

  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${BASE_URL}${path}`;
    let settled = false;

    const cleanup = () => {
      options.signal?.removeEventListener('abort', onAbort);
    };
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback();
    };
    const onAbort = () => {
      xhr.abort();
    };

    xhr.open('POST', url);
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      xhr.setRequestHeader('X-Request-Id', crypto.randomUUID());
    }
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (apiKey) xhr.setRequestHeader('X-Api-Key', apiKey);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        options.onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.onload = () => {
      if (xhr.status === 204) {
        finish(() => resolve(undefined as T));
        return;
      }

      let json: unknown;
      try {
        json = xhr.responseText ? JSON.parse(xhr.responseText) : undefined;
      } catch {
        finish(() =>
          reject(
            new ApiClientError({
              success: false,
              statusCode: xhr.status,
              path,
              method: 'POST',
              timestamp: new Date().toISOString(),
              error: 'ParseError',
              message: xhr.statusText || 'Failed to parse server response',
            }),
          ),
        );
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        finish(() => reject(new ApiClientError(json as ApiError)));
        return;
      }

      const envelope = json as { data: T };
      options.onProgress?.(100);
      finish(() => resolve(envelope.data));
    };
    xhr.onerror = () =>
      finish(() =>
        reject(
          new ApiClientError({
            success: false,
            statusCode: 0,
            path,
            method: 'POST',
            timestamp: new Date().toISOString(),
            error: 'NetworkError',
            message: 'Could not reach the server. Is the backend running?',
          }),
        ),
      );
    xhr.onabort = () =>
      finish(() => reject(new DOMException('The operation was aborted.', 'AbortError')));

    if (options.signal?.aborted) {
      xhr.abort();
      return;
    }
    options.signal?.addEventListener('abort', onAbort, { once: true });
    xhr.send(form);
  });
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
  /** Upload multipart/form-data with cancellation and progress reporting. */
  upload: <T>(path: string, form: FormData, options?: UploadOptions) =>
    uploadRequest<T>(path, form, options),
};

export { BASE_URL };
