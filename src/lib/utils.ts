import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Human-readable byte size. */
export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes)) return '—';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Absolute date, e.g. "Jul 9, 2026". */
export function formatDate(value?: string | Date): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Short month/day, e.g. "Jul 9". */
export function formatShortDate(value?: string | Date): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Relative time, e.g. "3h ago", "in 2d". */
export function relativeTime(value?: string | Date): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const mins = Math.round(abs / 60000);
  const hrs = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return rtf.format(-Math.sign(diff) * mins, 'minute');
  if (hrs < 24) return rtf.format(-Math.sign(diff) * hrs, 'hour');
  if (days < 30) return rtf.format(-Math.sign(diff) * days, 'day');
  return formatDate(d);
}

/** Estimated remaining reading time from a percentage + total reading minutes. */
export function remainingTime(
  readingProgress: number,
  estimatedMinutes?: number,
): string {
  if (!estimatedMinutes) return '—';
  const remaining = Math.max(
    0,
    Math.round(estimatedMinutes * (1 - readingProgress / 100)),
  );
  if (remaining <= 0) return 'Done';
  if (remaining < 60) return `${remaining} min left`;
  const h = Math.floor(remaining / 60);
  const m = remaining % 60;
  return m ? `${h}h ${m}m left` : `${h}h left`;
}

/**
 * Share a resource. Uses the native share sheet on mobile when available,
 * otherwise copies the URL to the clipboard. Returns what happened so the
 * caller can show the right toast.
 */
export type ShareResult = 'shared' | 'copied' | 'failed' | 'cancelled';

export async function shareLink(title: string, url: string): Promise<ShareResult> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, url });
      return 'shared';
    } catch (err) {
      // User dismissed the sheet — not an error.
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'cancelled';
      }
      // Otherwise fall through to clipboard copy.
    }
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
  return 'failed';
}

/** Debounce a function. */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  wait = 300,
): (...args: Parameters<T>) => void {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/** Title-case a string. */
export function titleCase(input: string): string {
  return input
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Download a (CORS-enabled) URL as a file while preserving the original
 * filename. Uses a blob + object URL rather than `window.open` so the saved
 * file keeps `resource.fileName` instead of the storage path segment. Works
 * after a page refresh because the caller fetches a fresh signed URL first.
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

/** Build a querystring from a record, skipping undefined/empty values. */
export function buildQuery(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) usp.set(key, value.join(','));
    } else {
      usp.set(key, String(value));
    }
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}
