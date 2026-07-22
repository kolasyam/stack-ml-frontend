'use client';

import * as React from 'react';
import { Search, SlidersHorizontal, Star, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  RESOURCE_PRIORITIES,
  RESOURCE_SORTS,
  RESOURCE_STATUSES,
  RESOURCE_TYPES,
} from '@/lib/constants';
import type { ResourceQuery } from '@/lib/api/resources';
import type {
  ResourcePriority,
  ResourceStatus,
  ResourceType,
} from '@/lib/types';

export type ResourceFilters = Omit<
  ResourceQuery,
  'page' | 'limit'
>;

interface Props {
  filters: ResourceFilters;
  onChange: (patch: Partial<ResourceFilters>) => void;
  onAdd: () => void;
  total?: number;
  loading?: boolean;
}

export function ResourcesToolbar({
  filters,
  onChange,
  onAdd,
  total,
  loading,
}: Props) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const activeCount =
    (filters.type ? 1 : 0) +
    (filters.priority ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.favorite ? 1 : 0);

  const FilterBody = (
    <div className="flex flex-col gap-4 px-5 py-4">
      <FilterRow label="Type">
        <Select
          value={filters.type ?? 'all'}
          onValueChange={(v) =>
            onChange({ type: v === 'all' ? undefined : (v as ResourceType) })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {RESOURCE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterRow>

      <FilterRow label="Priority">
        <Select
          value={filters.priority ?? 'all'}
          onValueChange={(v) =>
            onChange({
              priority: v === 'all' ? undefined : (v as ResourcePriority),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {RESOURCE_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterRow>

      <FilterRow label="Status">
        <Select
          value={filters.status ?? 'all'}
          onValueChange={(v) =>
            onChange({
              status: v === 'all' ? undefined : (v as ResourceStatus),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {RESOURCE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterRow>

      <Button
        variant="ghost"
        className="self-start"
        onClick={() =>
          onChange({ type: undefined, priority: undefined, status: undefined, favorite: false })
        }
      >
        <X className="h-4 w-4" /> Clear filters
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-secondary" />
          <Input
            value={filters.search ?? ''}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search resources…"
            className="pl-9"
          />
        </div>

        <Select
          value={filters.sort ?? 'newest'}
          onValueChange={(v) => onChange({ sort: v as ResourceFilters['sort'] })}
        >
          <SelectTrigger className="hidden w-44 sm:flex">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={filters.favorite ? 'outline' : 'secondary'}
          size="icon"
          aria-label="Favorites"
          onClick={() => onChange({ favorite: !filters.favorite })}
          className="shrink-0"
        >
          <Star
            className={cnStar(filters.favorite === true)}
          />
        </Button>

        {/* Mobile: filters in a sheet */}
        <Button
          variant="secondary"
          size="icon"
          className="shrink-0 lg:hidden"
          aria-label="Filters"
          onClick={() => setSheetOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-mint text-[9px] text-fg-invert">
              {activeCount}
            </span>
          )}
        </Button>

        <Button
          variant="primary"
          onClick={onAdd}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>

      {/* Desktop inline filters summary + sort */}
      <div className="hidden items-center gap-2 lg:flex">
        <Select
          value={filters.type ?? 'all'}
          onValueChange={(v) =>
            onChange({ type: v === 'all' ? undefined : (v as ResourceType) })
          }
        >
          <SelectTrigger className="h-9 w-40 rounded-pill">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {RESOURCE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.priority ?? 'all'}
          onValueChange={(v) =>
            onChange({
              priority: v === 'all' ? undefined : (v as ResourcePriority),
            })
          }
        >
          <SelectTrigger className="h-9 w-40 rounded-pill">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {RESOURCE_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status ?? 'all'}
          onValueChange={(v) =>
            onChange({
              status: v === 'all' ? undefined : (v as ResourceStatus),
            })
          }
        >
          <SelectTrigger className="h-9 w-40 rounded-pill">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {RESOURCE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({
                type: undefined,
                priority: undefined,
                status: undefined,
                favorite: false,
              })
            }
          >
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
        {typeof total === 'number' && (
          <span className="mono-label ml-auto text-[10px] text-fg-secondary">
            {loading ? '…' : `${total} result${total === 1 ? '' : 's'}`}
          </span>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Narrow your library by type, priority and status.
            </SheetDescription>
          </SheetHeader>
          {FilterBody}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="mono-label text-[10px] text-fg-secondary">{label}</span>
      {children}
    </div>
  );
}

function cnStar(active: boolean) {
  return ['h-4 w-4', active ? 'fill-mint text-mint' : 'text-fg-secondary'].join(
    ' ',
  );
}
