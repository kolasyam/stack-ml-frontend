'use client';

import * as React from 'react';
import * as mammoth from 'mammoth/mammoth.browser.js';
import {
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Props {
  url: string;
  onProgress: (progress: number) => void;
}

/**
 * DOC / DOCX reader — converts the document to HTML in-browser with mammoth
 * and renders it in a clean reading column. Reading progress is derived from
 * scroll position. A "paper" toggle flips between dark and light reading mode.
 */
export function DocReader({ url, onProgress }: Props) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [html, setHtml] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [paper, setPaper] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch document');
        const buf = await res.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: buf });
        if (!cancelled) setHtml(result.value);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Could not render document',
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  React.useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const pct = max > 0 ? Math.round((el.scrollTop / max) * 100) : 100;
    setProgress(pct);
    onProgress(pct);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen?.();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-feature border border-fg/10 bg-canvas',
        fullscreen && 'fixed inset-0 z-[60] rounded-none',
      )}
    >
      <div className="px-4 pt-3">
        <Progress value={progress} />
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-fg/10 px-3 py-2">
        <span className="mono-label text-[10px] text-fg-secondary">
          DOC / DOCX
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setPaper((p) => !p)} aria-label="Toggle reading mode">
            {paper ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={toggleFullscreen} aria-label="Fullscreen">
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className={cn(
          'flex-1 overflow-auto p-4 sm:p-6',
          paper ? 'bg-white' : 'bg-canvas/60',
        )}
      >
        {error ? (
          <p className="p-8 text-center font-sans text-sm text-danger">{error}</p>
        ) : !html ? (
          <div className="flex h-full items-center justify-center gap-2 text-fg-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="mono-label text-[10px]">RENDERING…</span>
          </div>
        ) : (
          <article
            className={cn(
              'mx-auto max-w-2xl font-sans text-[15px] leading-relaxed',
              paper ? 'text-neutral-800' : 'text-fg',
            )}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>

      <div className="border-t border-fg/10 px-4 py-2">
        <span className="mono-label text-[10px] text-fg-secondary">
          {progress}% COMPLETE
        </span>
      </div>
    </div>
  );
}
