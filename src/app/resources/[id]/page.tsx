'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  Pencil,
  Trash2,
  Download,
  ExternalLink,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Gauge,
  Layers,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useResource, useToggleFavorite, useDeleteResource } from '@/features/resources/hooks/use-resources';
import { useCreate } from '@/components/layout/create-provider';
import dynamic from 'next/dynamic';
import { ResourceTypeIcon } from '@/features/shared/type-icon';

// The document reader pulls in react-pdf / mammoth, which touch the DOM — load
// it client-side only so it never executes during SSR.
const DocumentReader = dynamic(
  () => import('@/features/reader/document-reader').then((m) => m.DocumentReader),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[78vh] items-center justify-center rounded-feature border border-fg/10 bg-canvas">
        <span className="mono-label text-[10px] text-fg-secondary">
          PREPARING READER…
        </span>
      </div>
    ),
  },
);
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { uploadsApi } from '@/lib/api/resources';
import {
  PRIORITY_DOT,
  RESOURCE_STATUS_STYLES,
  isDocumentType,
} from '@/lib/constants';
import { formatBytes, formatDate, cn, shareLink, downloadFile } from '@/lib/utils';
import { ApiClientError } from '@/lib/api/client';

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { openResource } = useCreate();

  const { data: resource, isLoading, isError, error } = useResource(id);
  const toggleFav = useToggleFavorite();
  const deleteResource = useDeleteResource();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);

  const onDownload = async () => {
    if (!resource?.filePath) return;
    setDownloading(true);
    try {
      const { url } = await uploadsApi.signedUrl(resource.filePath, true);
      await downloadFile(url, resource.fileName ?? 'download');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const onShare = async () => {
    if (!resource) return;
    const url =
      resource.link ?? `${window.location.origin}/resources/${resource.id}`;
    const res = await shareLink(resource.title, url);
    if (res === 'copied') toast.success('Link copied to clipboard');
    else if (res === 'failed') toast.error('Could not share this resource');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-[78vh] w-full" />
        </div>
      </div>
    );
  }

  if (isError || !resource) {
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6" />}
        title="Resource not found"
        description={
          error instanceof ApiClientError
            ? error.message
            : 'This resource may have been deleted.'
        }
        action={{ label: 'Back to Resources', href: '/resources' }}
      />
    );
  }

  const doc = isDocumentType(resource.type);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/resources">
            <ArrowLeft className="h-4 w-4" /> Resources
          </Link>
        </Button>
        <div className="flex items-center gap-1">
          <button
            aria-label="Favorite"
            onClick={() => toggleFav.mutate(resource.id)}
            className="rounded-full p-2 text-fg-secondary transition-colors hover:bg-fg/10"
          >
            <Star className={cn('h-4 w-4', resource.favorite && 'fill-mint text-mint')} />
          </button>
          <Button variant="secondary" size="icon-sm" aria-label="Share" onClick={onShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon-sm" aria-label="Edit" onClick={() => openResource(resource)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="danger" size="icon-sm" aria-label="Delete" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Details panel */}
        <Card className="h-fit p-5 lg:sticky lg:top-20">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-feature bg-fg/5">
              <ResourceTypeIcon type={resource.type} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="mono-label text-[10px] text-mint">{resource.type}</p>
              <h1 className="mt-0.5 font-sans text-base font-semibold leading-snug text-fg">
                {resource.title}
              </h1>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="neutral" className={cn(RESOURCE_STATUS_STYLES[resource.status])}>
              {resource.status}
            </Badge>
            {resource.priority && (
              <span className="flex items-center gap-1.5">
                <span className={cn('h-2 w-2 rounded-full', PRIORITY_DOT[resource.priority])} />
                <span className="mono-label text-[10px] text-fg-secondary">{resource.priority}</span>
              </span>
            )}
          </div>

          {resource.description && (
            <p className="mt-4 font-sans text-sm text-fg-secondary">
              {resource.description}
            </p>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {doc && (
              <Button asChild variant="primary" size="sm">
                <Link href={`/resources/${resource.id}`}>
                  <BookOpen className="h-4 w-4" /> Read
                </Link>
              </Button>
            )}
            {resource.link && !doc && (
              <Button asChild variant="primary" size="sm">
                <a href={resource.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" /> Open
                </a>
              </Button>
            )}
            {resource.filePath && (
              <Button variant="secondary" size="sm" onClick={onDownload} disabled={downloading}>
                <Download className="h-4 w-4" /> Download
              </Button>
            )}
          </div>

          {/* Metadata */}
          <div className="mt-5 space-y-2.5 border-t border-fg/10 pt-4">
            <Meta icon={<Calendar className="h-3.5 w-3.5" />} label="Created" value={formatDate(resource.createdAt)} />
            <Meta icon={<Clock className="h-3.5 w-3.5" />} label="Updated" value={formatDate(resource.updatedAt)} />
            {resource.pages ? (
              <Meta icon={<Layers className="h-3.5 w-3.5" />} label="Pages" value={String(resource.pages)} />
            ) : null}
            {resource.fileSize ? (
              <Meta icon={<FileText className="h-3.5 w-3.5" />} label="Size" value={formatBytes(resource.fileSize)} />
            ) : null}
            {resource.estimatedReadingTime ? (
              <Meta icon={<Gauge className="h-3.5 w-3.5" />} label="Est. reading" value={`${resource.estimatedReadingTime} min`} />
            ) : null}
            {resource.difficulty ? (
              <Meta icon={<Gauge className="h-3.5 w-3.5" />} label="Difficulty" value={resource.difficulty} />
            ) : null}
            {resource.fileName ? (
              <Meta icon={<FileText className="h-3.5 w-3.5" />} label="File" value={resource.fileName} />
            ) : null}
          </div>

          {resource.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-fg/10 pt-4">
              {resource.tags.map((t) => (
                <Badge key={t} tone="neutral" className="py-0.5">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        {/* Reader */}
        <DocumentReader resource={resource} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete resource?"
        description={`“${resource.title}” will be permanently removed along with its file.`}
        confirmLabel="Delete"
        danger
        pending={deleteResource.isPending}
        onConfirm={() =>
          deleteResource.mutate(resource.id, {
            onSuccess: () => router.push('/resources'),
          })
        }
      />
    </div>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 font-sans text-xs text-fg-secondary">
        <span className="text-fg-secondary">{icon}</span>
        {label}
      </span>
      <span className="truncate font-sans text-xs text-fg">{value}</span>
    </div>
  );
}
