'use client';

import * as React from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { ResourcesToolbar, type ResourceFilters } from '@/features/resources/components/resources-toolbar';
import { ResourceCard } from '@/features/resources/components/resource-card';
import { useResourceList } from '@/features/resources/hooks/use-resources';
import { useCreate } from '@/components/layout/create-provider';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiClientError } from '@/lib/api/client';

const PAGE_SIZE = 12;

export default function ResourcesPage() {
  const { openCreate } = useCreate();
  const [filters, setFilters] = React.useState<ResourceFilters>({
    sort: 'newest',
  });
  const [page, setPage] = React.useState(1);

  const query = React.useMemo(
    () => ({ ...filters, page, limit: PAGE_SIZE }),
    [filters, page],
  );

  const { data, isLoading, isError, error, refetch } = useResourceList(query);

  const onChange = (patch: Partial<ResourceFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-5">
      <ResourcesToolbar
        filters={filters}
        onChange={onChange}
        onAdd={() => openCreate('resource')}
        total={data?.total}
        loading={isLoading}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="Couldn’t load resources"
          description={
            error instanceof ApiClientError
              ? error.message
              : 'Something went wrong. Is the backend running?'
          }
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : data && data.items.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No resources yet"
          description="Start building your AI/ML learning library by adding your first resource."
          action={{ label: 'Add Resource', onClick: () => openCreate('resource') }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data?.items.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <span className="mono-label text-[11px] text-fg-secondary">
                PAGE {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
