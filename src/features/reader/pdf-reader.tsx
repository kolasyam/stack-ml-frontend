'use client';

import * as React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Bookmark as BookmarkIcon,
  Search as SearchIcon,
  X,
  Moon,
  Sun,
  RotateCcw,
  Highlighter,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Bookmark, Highlight, HighlightRect } from '@/lib/types';
import type {
  CreateHighlightInput,
  UpdateHighlightInput,
} from '@/lib/api/resources';

// Self-hosted pdf.js worker (copied to /public at build time).
pdfjs.GlobalWorkerOptions.workerSrc =
  process.env.NEXT_PUBLIC_PDF_WORKER_SRC ?? '/pdf.worker.min.mjs';

/** Highlight palette — mirrors the saturated story-tile colours. */
const HIGHLIGHT_COLORS = [
  '#3cffd0', // mint
  '#ffe14d', // yellow
  '#ff6ec7', // pink
  '#2f6bff', // blue
  '#ff7a2f', // orange
];

interface Props {
  url: string;
  initialPage: number;
  bookmarks: Bookmark[];
  highlights: Highlight[];
  onProgress: (currentPage: number, progress: number) => void;
  onAddBookmark: (page: number, note?: string) => void;
  onRemoveBookmark: (page: number) => void;
  onAddHighlight: (input: CreateHighlightInput) => void;
  onUpdateHighlight: (highlightId: string, input: UpdateHighlightInput) => void;
  onRemoveHighlight: (highlightId: string) => void;
}

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
/** How many pages around the current one are actually rendered (lazy). */
const RENDER_WINDOW = 2;

export function PdfReader({
  url,
  initialPage,
  bookmarks,
  highlights,
  onProgress,
  onAddBookmark,
  onRemoveBookmark,
  onAddHighlight,
  onUpdateHighlight,
  onRemoveHighlight,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  // Per-page wrapper elements, used for scroll-to + selection geometry.
  const pageRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const [numPages, setNumPages] = React.useState(0);
  const [page, setPage] = React.useState(Math.max(1, initialPage));
  const [scale, setScale] = React.useState(1);
  const [dark, setDark] = React.useState(true);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // Search state
  const [search, setSearch] = React.useState('');
  const [matchPages, setMatchPages] = React.useState<number[]>([]);
  const [matchIdx, setMatchIdx] = React.useState(0);
  const [searching, setSearching] = React.useState(false);

  // Bookmark + highlight panels
  const [bookmarkOpen, setBookmarkOpen] = React.useState(false);
  const [highlightOpen, setHighlightOpen] = React.useState(false);

  // Highlight creation / editing
  const [highlightColor, setHighlightColor] = React.useState(HIGHLIGHT_COLORS[0]);
  // Highlights-panel controls: filter by colour, search by text/note, sort.
  const [hlFilterColor, setHlFilterColor] = React.useState<string>('all');
  const [hlSearch, setHlSearch] = React.useState('');
  const [hlSort, setHlSort] = React.useState<'page' | 'created'>('page');
  const [pending, setPending] = React.useState<{
    page: number;
    rects: HighlightRect[];
    text: string;
    top: number;
    left: number;
  } | null>(null);
  const [activeHlId, setActiveHlId] = React.useState<string | null>(null);
  // Briefly emphasise a highlight after jumping to it from the panel.
  const [flashId, setFlashId] = React.useState<string | null>(null);
  // A highlight chosen from the panel that lives on a *different* page. We defer
  // activating it until the page-change effect settles (see below), otherwise
  // navigating would immediately clear the active highlight.
  const [pendingActiveId, setPendingActiveId] = React.useState<string | null>(
    null,
  );
  const [noteDraft, setNoteDraft] = React.useState('');

  // Natural page dimensions at scale=1, captured on load so we can render
  // correctly-sized placeholders for pages that are outside the lazy window.
  const [pageDims, setPageDims] = React.useState<
    Map<number, { w: number; h: number }>
  >(new Map());

  const activeHl = React.useMemo(
    () => highlights.find((h) => h._id === activeHlId) ?? null,
    [highlights, activeHlId],
  );

  // Sync the note draft when the active highlight changes.
  React.useEffect(() => {
    setNoteDraft(activeHl?.note ?? '');
  }, [activeHl]);

  const highlightsByPage = React.useMemo(() => {
    const map = new Map<number, Highlight[]>();
    for (const h of highlights) {
      const arr = map.get(h.page) ?? [];
      arr.push(h);
      map.set(h.page, arr);
    }
    return map;
  }, [highlights]);

  // Panel list: filtered by colour + search term, then sorted by page or recency.
  const visibleHighlights = React.useMemo(() => {
    const term = hlSearch.trim().toLowerCase();
    const filtered = highlights.filter((h) => {
      if (hlFilterColor !== 'all' && h.color !== hlFilterColor) return false;
      if (
        term &&
        !((h.text ?? '').toLowerCase().includes(term) ||
          (h.note ?? '').toLowerCase().includes(term))
      ) {
        return false;
      }
      return true;
    });
    return filtered.sort((a, b) => {
      if (hlSort === 'created') {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      }
      return a.page - b.page;
    });
  }, [highlights, hlFilterColor, hlSearch, hlSort]);

  // Fit page to container width on first load.
  const fitWidth = React.useCallback(() => {
    const c = scrollRef.current;
    if (!c) return;
    const target = c.clientWidth - 48;
    const base = 800;
    setScale(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, target / base)));
  }, []);

  React.useEffect(() => {
    fitWidth();
    const onResize = () => fitWidth();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [fitWidth]);

  // Fullscreen change tracking
  React.useEffect(() => {
    const onFs = () =>
      setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // Report progress + apply a panel-requested highlight activation when the
  // current page settles. (We deliberately do NOT clear `pending` here: in the
  // continuous-scroll model the page changes on every scroll, and a pending
  // selection must survive scrolling until the user picks a colour.)
  // When the page change was triggered by `goTo`/`init` (navigatingRef), scroll
  // the target into view *after* it has mounted in the lazy window.
  React.useEffect(() => {
    if (numPages > 0) {
      onProgress(page, Math.min(100, Math.round((page / numPages) * 100)));
    }
    if (pendingActiveId !== null) {
      setActiveHlId(pendingActiveId);
      setPendingActiveId(null);
    }
    if (navigatingRef.current) {
      navigatingRef.current = false;
      scrollToPage(page, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, numPages]);

  // Scroll back to the saved page once the document has loaded.
  const didInit = React.useRef(false);
  React.useEffect(() => {
    if (numPages === 0 || didInit.current) return;
    didInit.current = true;
    const target = Math.max(1, Math.min(numPages, initialPage));
    setPage(target);
    requestAnimationFrame(() => scrollToPage(target, false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numPages]);

  const onDocLoad = (pdf: { numPages: number }) => {
    setNumPages(pdf.numPages);
    setLoadError(null);
  };

  /** Scroll the given page to the top of the viewport (instant or smooth). */
  const scrollToPage = (p: number, smooth = true) => {
    const scroller = scrollRef.current;
    const el = pageRefs.current.get(p);
    if (!scroller || !el) return;
    const elTop =
      el.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop;
    scroller.scrollTo({ top: Math.max(0, elTop - 8), behavior: smooth ? 'smooth' : 'auto' });
  };

  // Set when a page change was caused by explicit navigation (goTo / panel /
  // init) rather than by the user scrolling, so the page-change effect can
  // scroll the freshly-mounted page into view without fighting the user.
  const navigatingRef = React.useRef(false);

  const goTo = (p: number) => {
    if (numPages === 0) return;
    const target = Math.min(numPages, Math.max(1, p));
    setPage(target);
    navigatingRef.current = true;
  };

  // Track the current page from scroll position and lazy-render around it.
  const onScroll = React.useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller || numPages === 0) return;
    const scrollerTop = scroller.getBoundingClientRect().top;
    const scrollPos = scroller.scrollTop;
    let current = 1;
    for (let p = 1; p <= numPages; p++) {
      const el = pageRefs.current.get(p);
      if (!el) continue;
      const elTop =
        el.getBoundingClientRect().top - scrollerTop + scrollPos;
      if (elTop <= scrollPos + 80) current = p;
      else break;
    }
    setPage((prev) => {
      if (prev === current) return prev;
      onProgress(current, Math.min(100, Math.round((current / numPages) * 100)));
      return current;
    });
  }, [numPages, onProgress]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen?.();
    }
  };

  // ----- In-document search via pdf.js text content -----
  const runSearch = async (term: string) => {
    const q = term.trim();
    if (!q) {
      setMatchPages([]);
      return;
    }
    if (numPages === 0) return;
    setSearching(true);
    try {
      const loadingTask = pdfjs.getDocument(url);
      const pdf = await loadingTask.promise;
      const found: number[] = [];
      const needle = q.toLowerCase();
      const limit = Math.min(numPages, 200);
      for (let i = 1; i <= limit; i++) {
        const pageProxy = await pdf.getPage(i);
        const content = await pageProxy.getTextContent();
        const text = content.items
          .map((it) => ('str' in it ? it.str : ''))
          .join(' ')
          .toLowerCase();
        if (text.includes(needle)) found.push(i);
      }
      await pdf.destroy();
      setMatchPages(found);
      setMatchIdx(0);
      if (found.length) {
        goTo(found[0]);
        toast.success(`${found.length} match${found.length === 1 ? '' : 'es'} found`);
      } else {
        toast.error('No matches in this document');
      }
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const nextMatch = () => {
    if (!matchPages.length) return;
    const next = (matchIdx + 1) % matchPages.length;
    setMatchIdx(next);
    goTo(matchPages[next]);
  };

  const prevMatch = () => {
    if (!matchPages.length) return;
    const prev = (matchIdx - 1 + matchPages.length) % matchPages.length;
    setMatchIdx(prev);
    goTo(matchPages[prev]);
  };

  // Highlight the search term inside a specific page's text layer.
  const highlightCurrentPage = (
    wrap: HTMLElement | null,
    term: string,
  ) => {
    if (!wrap) return;
    const layer = wrap.querySelector(
      '.react-pdf__Page__textContent',
    ) as HTMLElement | null;
    if (!layer) return;
    const needle = term.toLowerCase();
    layer.querySelectorAll<HTMLElement>('span').forEach((span) => {
      const original = span.getAttribute('data-orig');
      const text = original ?? span.textContent ?? '';
      if (!original) span.setAttribute('data-orig', text);
      if (text.toLowerCase().includes(needle) && needle) {
        span.style.background = 'rgba(60,255,208,0.35)';
        span.style.color = '#131313';
        span.style.borderRadius = '2px';
      } else {
        span.style.background = '';
        span.style.color = '';
      }
    });
  };

  // Clear any previously-applied search highlights when the term changes.
  React.useEffect(() => {
    scrollRef.current
      ?.querySelectorAll<HTMLElement>('.react-pdf__Page__textContent span')
      .forEach((span) => {
        span.style.background = '';
        span.style.color = '';
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ----- Highlight creation: capture the current text selection -----
  const handleMouseUp = (e: React.MouseEvent) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setPending(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const startEl = (sel.anchorNode as HTMLElement | null)?.parentElement;
    const box = startEl?.closest('[data-page]') as HTMLElement | null;
    if (!box) {
      setPending(null);
      return;
    }
    const p = Number(box.dataset.page);
    const boxRect = box.getBoundingClientRect();
    const clientRects = Array.from(range.getClientRects()).filter(
      (r) => r.width > 0 && r.height > 0,
    );
    if (clientRects.length === 0) {
      setPending(null);
      return;
    }
    const rects: HighlightRect[] = clientRects.map((r) => ({
      x: (r.left - boxRect.left) / boxRect.width,
      y: (r.top - boxRect.top) / boxRect.height,
      w: r.width / boxRect.width,
      h: r.height / boxRect.height,
    }));
    const first = clientRects[0];
    const text = sel.toString().replace(/\s+/g, ' ').trim();
    setActiveHlId(null);
    setPending({
      page: p,
      rects,
      text,
      top: first.top - 8,
      left: first.left + first.width / 2,
    });
    void e;
  };

  const commitHighlight = (color: string) => {
    if (!pending) return;
    onAddHighlight({
      page: pending.page,
      rects: pending.rects,
      color,
      text: pending.text,
    });
    window.getSelection()?.removeAllRanges();
    setPending(null);
  };

  const deleteActiveHighlight = () => {
    if (!activeHl) return;
    onRemoveHighlight(activeHl._id);
    setActiveHlId(null);
  };

  const toggleBookmark = () => {
    const exists = bookmarks.some((b) => b.page === page);
    if (exists) onRemoveBookmark(page);
    else onAddBookmark(page);
  };

  const isBookmarked = bookmarks.some((b) => b.page === page);
  const progress = numPages
    ? Math.min(100, Math.round((page / numPages) * 100))
    : 0;

  // Page numbers currently mounted (lazy window around the visible page,
  // plus any page that carries a highlight so it still renders when reached).
  const renderSet = React.useMemo(() => {
    const set = new Set<number>();
    const start = Math.max(1, page - 1);
    const end = Math.min(numPages, page + RENDER_WINDOW);
    for (let p = start; p <= end; p++) set.add(p);
    for (const h of highlights) set.add(h.page);
    return set;
  }, [page, numPages, highlights]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-feature border border-fg/10 bg-canvas',
        fullscreen && 'fixed inset-0 z-[60] rounded-none',
      )}
    >
      {/* Progress bar */}
      <div className="px-4 pt-3">
        <Progress value={progress} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-fg/10 px-3 py-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => goTo(page - 1)} disabled={page <= 1} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <Input
              value={page}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!Number.isNaN(v)) setPage(v);
              }}
              onBlur={() => goTo(page)}
              className="h-8 w-14 rounded-pill text-center"
            />
            <span className="mono-label text-[10px] text-fg-secondary">
              / {numPages || '—'}
            </span>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => goTo(page + 1)} disabled={numPages > 0 && page >= numPages} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setScale((s) => Math.max(ZOOM_MIN, +(s - 0.1).toFixed(2)))} aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="mono-label w-12 text-center text-[10px] text-fg-secondary">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="ghost" size="icon-sm" onClick={() => setScale((s) => Math.min(ZOOM_MAX, +(s + 0.1).toFixed(2)))} aria-label="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={fitWidth} aria-label="Reset zoom">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-secondary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') runSearch(search);
              }}
              placeholder="Find in doc…"
              className="h-8 w-36 rounded-pill pl-8 sm:w-44"
            />
          </div>
          {matchPages.length > 0 && (
            <span className="mono-label flex items-center gap-1 text-[10px] text-mint">
              {matchIdx + 1}/{matchPages.length}
              <button onClick={prevMatch} className="rounded-full p-1 hover:bg-fg/10" aria-label="Previous match">
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button onClick={nextMatch} className="rounded-full p-1 hover:bg-fg/10" aria-label="Next match">
                <ChevronRight className="h-3 w-3" />
              </button>
            </span>
          )}
          {searching && <span className="mono-label text-[10px] text-fg-secondary">…</span>}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={highlightOpen ? 'outline' : 'ghost'}
            size="icon-sm"
            onClick={() => setHighlightOpen((o) => !o)}
            aria-label="Highlights"
          >
            <Highlighter className={cn('h-4 w-4', highlightOpen && 'text-mint')} />
          </Button>
          <Button
            variant={isBookmarked ? 'outline' : 'ghost'}
            size="icon-sm"
            onClick={() => setBookmarkOpen((o) => !o)}
            aria-label="Bookmarks"
          >
            <BookmarkIcon className={cn('h-4 w-4', isBookmarked && 'fill-mint text-mint')} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={toggleFullscreen} aria-label="Fullscreen">
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Bookmarks panel */}
      {bookmarkOpen && (
        <Panel title="BOOKMARKS" count={bookmarks.length}>
          {bookmarks.length === 0 && (
            <span className="font-sans text-xs text-fg-secondary">
              No bookmarks yet — tap the star on page {page}.
            </span>
          )}
          {bookmarks.map((b) => (
            <button
              key={b.page}
              onClick={() => goTo(b.page)}
              className="mono-label flex items-center gap-1 rounded-pill border border-fg/15 px-2 py-1 text-[10px] text-fg hover:border-mint/40"
            >
              p.{b.page}
              <X
                className="h-3 w-3 text-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveBookmark(b.page);
                }}
              />
            </button>
          ))}
        </Panel>
      )}

      {/* Highlights panel */}
      {highlightOpen && (
        <div className="flex flex-col gap-2 border-b border-fg/10 bg-surface/60 px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="mono-label text-[10px] text-fg-secondary">
              HIGHLIGHTS ({highlights.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setHlSort((s) => (s === 'page' ? 'created' : 'page'))}
                className="mono-label rounded-pill border border-fg/15 px-2 py-0.5 text-[10px] text-fg hover:border-mint/40"
                aria-label="Toggle sort"
              >
                sort: {hlSort === 'page' ? 'page' : 'recent'}
              </button>
              <X
                className="h-3.5 w-3.5 text-fg-secondary hover:text-fg"
                onClick={() => setHighlightOpen(false)}
                aria-label="Close highlights"
              />
            </div>
          </div>

          {/* Search + colour filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-secondary" />
              <Input
                value={hlSearch}
                onChange={(e) => setHlSearch(e.target.value)}
                placeholder="Search highlights…"
                className="h-7 w-40 rounded-pill pl-8 text-[11px]"
              />
            </div>
            <button
              onClick={() => setHlFilterColor('all')}
              className={cn(
                'h-4 w-4 rounded-full border border-black/10',
                hlFilterColor === 'all' && 'outline outline-2 outline-offset-1 outline-fg',
              )}
              style={{ background: 'conic-gradient(#3cffd0,#ffe14d,#ff6ec7,#2f6bff,#ff7a2f,#3cffd0)' }}
              aria-label="All colours"
            />
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setHlFilterColor(c)}
                className={cn(
                  'h-4 w-4 rounded-full border border-black/10',
                  hlFilterColor === c && 'outline outline-2 outline-offset-1 outline-fg',
                )}
                style={{ backgroundColor: c }}
                aria-label={`Filter ${c}`}
              />
            ))}
          </div>

          {/* Scrollable list */}
          <div className="flex max-h-44 flex-col gap-1 overflow-y-auto pr-1">
            {visibleHighlights.length === 0 && (
              <span className="font-sans text-xs text-fg-secondary">
                {highlights.length === 0
                  ? 'Select text on the page, then pick a colour to highlight.'
                  : 'No highlights match your filter.'}
              </span>
            )}
            {visibleHighlights.map((h) => (
              <div
                key={h._id}
                className="flex items-start justify-between gap-2 rounded-pill border border-fg/15 px-2 py-1"
              >
                <button
                  onClick={() => {
                    setHighlightOpen(false);
                    if (h.page === page) {
                      setActiveHlId(h._id);
                    } else {
                      setPendingActiveId(h._id);
                      goTo(h.page);
                    }
                    setFlashId(h._id);
                    window.setTimeout(
                      () => setFlashId((cur) => (cur === h._id ? null : cur)),
                      1200,
                    );
                  }}
                  className="flex min-w-0 items-start gap-2 text-left"
                >
                  <span
                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: h.color }}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="mono-label text-[10px] text-fg">
                      p.{h.page}
                      {h.createdAt
                        ? ` · ${new Date(h.createdAt).toLocaleDateString()}`
                        : ''}
                    </span>
                    {h.text ? (
                      <span className="truncate font-sans text-[11px] text-fg-secondary">
                        “{h.text}”
                      </span>
                    ) : null}
                    {h.note ? (
                      <span className="truncate font-sans text-[11px] text-mint">
                        {h.note}
                      </span>
                    ) : null}
                  </span>
                </button>
                <X
                  className="mt-0.5 h-3 w-3 shrink-0 text-danger"
                  onClick={() => onRemoveHighlight(h._id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable, lazy multi-page document area */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onMouseUp={handleMouseUp}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-canvas/40 py-4"
      >
        <Document
          file={url}
          onLoadSuccess={onDocLoad}
          onLoadError={(e) =>
            setLoadError(e?.message ?? 'Failed to load PDF')
          }
          onSourceError={(e) =>
            setLoadError(e?.message ?? 'Failed to load PDF source')
          }
          loading={
            <div className="flex h-96 w-[600px] items-center justify-center">
              <span className="mono-label text-[10px] text-fg-secondary">
                LOADING PDF…
              </span>
            </div>
          }
          error={
            <div className="flex h-96 w-[600px] items-center justify-center p-8 text-center">
              <p className="font-sans text-sm text-danger">{loadError}</p>
            </div>
          }
        >
          <div className="mx-auto flex w-fit flex-col items-center gap-4 px-2">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => {
            const dims = pageDims.get(p);
            const pageHighlights = highlightsByPage.get(p) ?? [];
            const isActivePage = activeHl && activeHl.page === p;
            const render = renderSet.has(p);
            const ph = dims ? dims.h * scale : 1000 * scale;
            const pw = dims ? dims.w * scale : undefined;
            return (
              <div
                key={p}
                data-page={p}
                ref={(el) => {
                  if (el) pageRefs.current.set(p, el);
                  else pageRefs.current.delete(p);
                }}
                className="relative shadow-lg shadow-black/30"
                style={{ width: pw }}
              >
                {loadError ? (
                  <div className="flex h-96 w-[600px] items-center justify-center p-8 text-center">
                    <p className="font-sans text-sm text-danger">{loadError}</p>
                  </div>
                ) : render ? (
                  <div
                    className={cn('rounded-sm', dark && '[filter:invert(1)_hue-rotate(180deg)]')}
                  >
                    <Page
                      key={`page-${p}-${scale}`}
                      pageNumber={p}
                      scale={scale}
                      renderTextLayer
                      renderAnnotationLayer
                      onLoadSuccess={(
                        pg: {
                          getViewport: (o: { scale: number }) => {
                            width: number;
                            height: number;
                          };
                        },
                      ) => {
                        const vp = pg.getViewport({ scale: 1 });
                        setPageDims((prev) => {
                          const next = new Map(prev);
                          next.set(p, { w: vp.width, h: vp.height });
                          return next;
                        });
                      }}
                      onRenderSuccess={() => {
                        if (search.trim() && matchPages.includes(p)) {
                          highlightCurrentPage(pageRefs.current.get(p) ?? null, search);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{ height: ph }}
                    className="w-[600px] rounded-sm bg-surface/40"
                  />
                )}

                {/* Highlight overlay — sits above the (possibly inverted) page
                    but is not itself inverted, so colours render as chosen. */}
                {render && pageHighlights.length > 0 && (
                  <div className="pointer-events-none absolute inset-0">
                    {pageHighlights.map((h) => (
                      <React.Fragment key={h._id}>
                        {h.rects.map((r, i) => (
                          <div
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHlId(h._id);
                            }}
                            className={cn(
                              'pointer-events-auto absolute cursor-pointer rounded-[2px]',
                              flashId === h._id && 'animate-pulse',
                            )}
                            style={{
                              left: `${r.x * 100}%`,
                              top: `${r.y * 100}%`,
                              width: `${r.w * 100}%`,
                              height: `${r.h * 100}%`,
                              backgroundColor: `${h.color}59`,
                              boxShadow:
                                activeHlId === h._id
                                  ? `0 0 0 1px ${h.color}`
                                  : flashId === h._id
                                    ? `0 0 0 2px ${h.color}`
                                    : undefined,
                            }}
                          />
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Active highlight editor — rendered inside the active page so
                    it scrolls with the document. */}
                {isActivePage && activeHl && activeHl.rects.length > 0 && (
                  <div
                    className="pointer-events-auto absolute z-[65] w-56 rounded-feature border border-fg/15 bg-surface p-3 shadow-xl shadow-black/50"
                    style={{
                      left: `${activeHl.rects[0].x * 100}%`,
                      top: `${(activeHl.rects[0].y + activeHl.rects[0].h) * 100}%`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      onBlur={() => {
                        if ((activeHl.note ?? '') !== noteDraft) {
                          onUpdateHighlight(activeHl._id, { note: noteDraft });
                        }
                      }}
                      placeholder="Add a note…"
                      rows={2}
                      className="w-full resize-none rounded-sm border border-fg/15 bg-canvas/60 px-2 py-1 font-sans text-xs text-fg outline-none placeholder:text-fg-secondary focus:border-mint/40"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {HIGHLIGHT_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => onUpdateHighlight(activeHl._id, { color: c })}
                            className="h-4 w-4 rounded-full border border-black/10"
                            style={{
                              backgroundColor: c,
                              outline:
                                activeHl.color === c ? `2px solid ${c}` : undefined,
                              outlineOffset: 1,
                            }}
                            aria-label={`Colour ${c}`}
                          />
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={deleteActiveHighlight}
                        aria-label="Delete highlight"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-danger" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </Document>
      </div>

      {/* Floating "add highlight" colour picker */}
      {pending && (
        <div
          className="fixed z-[70] flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-pill border border-fg/15 bg-surface px-2 py-1.5 shadow-lg shadow-black/50"
          style={{ top: pending.top, left: pending.left }}
        >
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => commitHighlight(c)}
              className="h-5 w-5 rounded-full border border-black/10 transition-transform hover:scale-110"
              style={{ backgroundColor: c }}
              aria-label={`Highlight ${c}`}
            />
          ))}
        </div>
      )}

      {/* Add-bookmark hint */}
      <div className="flex items-center justify-between border-t border-fg/10 px-4 py-2">
        <span className="mono-label text-[10px] text-fg-secondary">
          {progress}% COMPLETE
        </span>
        <Button variant="secondary" size="sm" onClick={toggleBookmark}>
          <BookmarkIcon className={cn('h-3.5 w-3.5', isBookmarked && 'fill-mint text-mint')} />
          {isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
        </Button>
      </div>
    </div>
  );
}

function Panel({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-fg/10 bg-surface/60 px-4 py-2">
      <span className="mono-label text-[10px] text-fg-secondary">
        {title} ({count})
      </span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}
