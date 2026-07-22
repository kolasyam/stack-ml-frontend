'use client';

import * as React from 'react';
import { ExternalLink, FileQuestion } from 'lucide-react';
import { PdfReader } from './pdf-reader';
import { DocReader } from './doc-reader';
import { Button } from '@/components/ui/button';
import { useResourceFileUrl, useUpdateProgress, useAddBookmark, useRemoveBookmark, useAddHighlight, useUpdateHighlight, useRemoveHighlight } from '@/features/resources/hooks/use-resources';
import { DOCUMENT_TYPES, isDocumentType } from '@/lib/constants';
import type { Resource } from '@/lib/types';

/**
 * Integrated document reader entry point.
 *
 *  - Resolves a fresh signed URL for stored files (signed URLs expire).
 *  - Routes PDF / Research Paper / Documentation → PdfReader.
 *  - Routes DOC / DOCX → DocReader (mammoth).
 *  - Link-only resources → an "open externally" panel.
 *  - Persists reading progress + current page (debounced) and bookmarks.
 */
export function DocumentReader({ resource }: { resource: Resource }) {
  const hasFile = Boolean(resource.filePath);
  const { data: fileData, isLoading: fileLoading } = useResourceFileUrl(
    hasFile ? resource.id : undefined,
  );
  const updateProgress = useUpdateProgress();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const addHighlight = useAddHighlight();
  const updateHighlight = useUpdateHighlight();
  const removeHighlight = useRemoveHighlight();

  // Debounced progress persistence.
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>();
  const persistProgress = React.useCallback(
    (currentPage?: number, readingProgress?: number) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateProgress.mutate({
          id: resource.id,
          currentPage,
          readingProgress,
        });
      }, 1200);
    },
    [resource.id, updateProgress],
  );

  if (!hasFile) {
    return <LinkPanel resource={resource} />;
  }

  if (fileLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center rounded-feature border border-fg/10 bg-canvas">
        <span className="mono-label text-[10px] text-fg-secondary">
          PREPARING READER…
        </span>
      </div>
    );
  }

  const url = fileData?.url;
  if (!url) {
    return <LinkPanel resource={resource} />;
  }

  const isDoc = resource.type === 'DOC' || resource.type === 'DOCX';

  if (isDoc) {
    return (
      <div className="h-[78vh]">
        <DocReader
          url={url}
          onProgress={(p) => persistProgress(undefined, p)}
        />
      </div>
    );
  }

  return (
    <div className="h-[78vh]">
      <PdfReader
        url={url}
        initialPage={resource.currentPage ?? 1}
        bookmarks={resource.bookmarks ?? []}
        highlights={resource.highlights ?? []}
        onProgress={(page, p) => persistProgress(page, p)}
        onAddBookmark={(page, note) =>
          addBookmark.mutate({ id: resource.id, page, note })
        }
        onRemoveBookmark={(page) =>
          removeBookmark.mutate({ id: resource.id, page })
        }
        onAddHighlight={(input) =>
          addHighlight.mutate({ id: resource.id, input })
        }
        onUpdateHighlight={(highlightId, input) =>
          updateHighlight.mutate({ id: resource.id, highlightId, input })
        }
        onRemoveHighlight={(highlightId) =>
          removeHighlight.mutate({ id: resource.id, highlightId })
        }
      />
    </div>
  );
}

function LinkPanel({ resource }: { resource: Resource }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 rounded-feature border border-dashed border-fg/15 bg-surface/30 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/10 text-mint">
        <FileQuestion className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-sans text-lg font-semibold text-fg">
          {resource.title}
        </h3>
        <p className="mt-1 mono-label text-[10px] text-fg-secondary">
          {resource.type}
        </p>
      </div>
      {resource.link ? (
        <Button asChild variant="primary">
          <a href={resource.link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Open Resource
          </a>
        </Button>
      ) : (
        <p className="font-sans text-sm text-fg-secondary">
          This resource has no file or link attached.
        </p>
      )}
    </div>
  );
}
