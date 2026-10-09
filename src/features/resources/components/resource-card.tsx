'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreVertical,
  Star,
  Download,
  Pencil,
  Trash2,
  ExternalLink,
  BookOpen,
  FileText,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  RESOURCE_STATUS_STYLES,
  PRIORITY_DOT,
} from '@/lib/constants';
import { ResourceTypeIcon } from '@/features/shared/type-icon';
import { resourcesApi, uploadsApi } from '@/lib/api/resources';
import { formatBytes, formatShortDate, cn, shareLink, downloadFile } from '@/lib/utils';
import {
  useDeleteResource,
  useToggleFavorite,
} from '../hooks/use-resources';
import { useCreate } from '@/components/layout/create-provider';
import { isDocumentType } from '@/lib/constants';
import type { Resource } from '@/lib/types';
import { safeExternalUrl } from '@/lib/safe-content';

export function ResourceCard({ resource }: { resource: Resource }) {
  const router = useRouter();
  const { openResource } = useCreate();
  const toggleFav = useToggleFavorite();
  const deleteResource = useDeleteResource();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);

  const doc = isDocumentType(resource.type);

  const go = () => router.push(`/resources/${resource.id}`);

  const onOpen = (e: Event) => {
    e.stopPropagation();
    const targetLink = resource.links?.[0] ?? resource.link;
    if (doc) go();
    else if (safeExternalUrl(targetLink)) {
      window.open(safeExternalUrl(targetLink) ?? '', '_blank', 'noopener,noreferrer');
    }
    else go();
  };

  const onDownload = async (e: Event) => {
    e.stopPropagation();
    if (!resource.filePath) {
      toast.error('No file attached to download.');
      return;
    }
    setDownloading(true);
    try {
      const { url } = await resourcesApi.fileUrl(resource.id, true);
      await downloadFile(url, resource.fileName ?? 'download');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const onShare = async (e: Event) => {
    e.stopPropagation();
    const targetLink = resource.links?.[0] ?? resource.link;
    const url =
      targetLink ?? `${window.location.origin}/resources/${resource.id}`;
    const res = await shareLink(resource.title, url);
    if (res === 'copied') toast.success('Link copied to clipboard');
    else if (res === 'failed') toast.error('Could not share this resource');
  };

  return (
    <>
      <Card
        interactive
        onClick={go}
        onKeyDown={(e) => {
          // Keep keyboard activation of the nested favorite/actions controls
          // from also activating the card itself.
          if (e.target !== e.currentTarget) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            go();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Open ${resource.title}`}
        className="group flex cursor-pointer flex-col gap-3 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focusring"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-feature bg-fg/5">
              <ResourceTypeIcon type={resource.type} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="mono-label truncate text-[10px] text-fg-secondary">
                {resource.type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              aria-label="Favorite"
              onClick={(e) => {
                e.stopPropagation();
                toggleFav.mutate(resource.id);
              }}
              className="rounded-full p-1.5 text-fg-secondary transition-colors hover:bg-fg/10"
            >
              <Star
                className={cn(
                  'h-4 w-4',
                  resource.favorite && 'fill-mint text-mint',
                )}
              />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Actions"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-full p-1.5 text-fg-secondary transition-colors hover:bg-fg/10"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuItem onSelect={onOpen}>
                  {doc ? (
                    <BookOpen className="h-4 w-4" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  {doc ? 'Read' : 'Open'}
                </DropdownMenuItem>
                {resource.filePath && (
                  <DropdownMenuItem
                    onSelect={onDownload}
                    disabled={downloading}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={onShare}>
                  <Share2 className="h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => { e.stopPropagation(); openResource(resource); }}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  danger
                  onSelect={(e) => {
                    e.stopPropagation();
                    setConfirmOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="line-clamp-2 break-words font-sans text-[15px] font-semibold leading-snug text-fg">
            {resource.title}
          </h3>
          {resource.description && (
            <p className="mt-1 line-clamp-2 break-words font-sans text-xs text-fg-secondary">
              {resource.description}
            </p>
          )}
        </div>

        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resource.tags.slice(0, 3).map((t) => (
              <Badge key={t} tone="neutral" className="py-0.5">
                {t}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge tone="neutral" className="py-0.5">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <Badge tone="neutral" className={cn('py-0.5', RESOURCE_STATUS_STYLES[resource.status])}>
              {resource.status}
            </Badge>
            {resource.priority && (
              <span className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    PRIORITY_DOT[resource.priority],
                  )}
                />
                <span className="mono-label text-[10px] text-fg-secondary">
                  {resource.priority}
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-fg-secondary">
            {resource.fileSize ? (
              <span className="mono-label flex items-center gap-1 text-[10px]">
                <FileText className="h-3 w-3" />
                {formatBytes(resource.fileSize)}
              </span>
            ) : null}
            <span className="mono-label text-[10px]">
              {formatShortDate(resource.createdAt)}
            </span>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete resource?"
        description={`“${resource.title}” will be permanently removed along with its file.`}
        confirmLabel="Delete"
        danger
        pending={deleteResource.isPending}
        onConfirm={() => {
          deleteResource.mutate(resource.id, {
            onSuccess: () => setConfirmOpen(false),
          });
        }}
      />
    </>
  );
}
