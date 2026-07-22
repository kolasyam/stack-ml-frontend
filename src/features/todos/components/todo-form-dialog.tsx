'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Check, Loader2, Search, BookOpen } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { DescriptionImprover } from '@/components/common/DescriptionImprover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RESOURCE_PRIORITIES,
  TODO_ESTIMATED_TIMES,
  TODO_STATUSES,
} from '@/lib/constants';
import { useCreateTodo, useUpdateTodo } from '../hooks/use-todos';
import { useResourceList } from '@/features/resources/hooks/use-resources';
import { ResourceTypeIcon } from '@/features/shared/type-icon';
import { formatShortDate } from '@/lib/utils';
import type {
  CreateTodoInput,
  UpdateTodoInput,
} from '@/lib/api/todos';
import type { Resource, Todo } from '@/lib/types';

const schema = z.object({
  title: z.string().min(1, 'Todo title is required'),
  description: z.string().optional(),
  resourceId: z.string().min(1, 'Linked resource is required'),
  status: z.enum(TODO_STATUSES as [string, ...string[]]).optional(),
  priority: z.enum(RESOURCE_PRIORITIES as [string, ...string[]]).optional(),
  dueDate: z.string().optional(),
  estimatedTime: z.enum(TODO_ESTIMATED_TIMES as [string, ...string[]]).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo?: Todo | null;
}

export function TodoFormDialog({ open, onOpenChange, todo }: Props) {
  const isEdit = !!todo;
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const create = useCreateTodo();
  const update = useUpdateTodo();

  // Only fetch the resource list when the dialog (or its resource picker) is
  // actually open — the dialog is always mounted in CreateProvider, so an
  // unconditional fetch would hit /resources on every page load.
  const { data: resources, isLoading } = useResourceList(
    { search, limit: 20 },
    open || pickerOpen,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      resourceId: '',
      status: 'Not Started',
      priority: 'Medium',
      dueDate: '',
      estimatedTime: undefined,
    },
  });

  React.useEffect(() => {
    if (!open) return;
    if (todo) {
      form.reset({
        title: todo.title,
        description: todo.description ?? '',
        resourceId:
          typeof todo.resourceId === 'string'
            ? todo.resourceId
            : todo.resourceId.id,
        status: todo.status,
        priority: todo.priority,
        dueDate: todo.dueDate
          ? new Date(todo.dueDate).toISOString().slice(0, 10)
          : '',
        estimatedTime: todo.estimatedTime,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        resourceId: '',
        status: 'Not Started',
        priority: 'Medium',
        dueDate: '',
        estimatedTime: undefined,
      });
    }
  }, [open, todo, form]);

  const selectedId = form.watch('resourceId');
  const selectedResource = React.useMemo(
    () =>
      resources?.items.find((r) => r.id === selectedId) ??
      (todo && typeof todo.resourceId !== 'string'
        ? (todo.resourceId as unknown as Resource)
        : undefined),
    [resources, selectedId, todo],
  );

  const onSubmit = (values: FormValues) => {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      resourceId: values.resourceId,
      status: values.status || undefined,
      priority: values.priority || undefined,
      dueDate: values.dueDate || undefined,
      estimatedTime: values.estimatedTime || undefined,
    };
    if (isEdit && todo) {
      update.mutate(
        { id: todo.id, input: payload as unknown as UpdateTodoInput },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      create.mutate(payload as unknown as CreateTodoInput, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Todo' : 'Add Todo'}</DialogTitle>
            <DialogDescription>
              Link a todo to a learning resource so you always know what to
              study next.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex max-h-[64vh] flex-col gap-4 overflow-y-auto px-6 py-5"
          >
            <Field
              label="Todo Title"
              error={form.formState.errors.title?.message}
            >
              <Input
                placeholder="e.g. Summarise the transformer architecture"
                {...form.register('title')}
              />
            </Field>

            <Field
              label="Linked Resource"
              error={form.formState.errors.resourceId?.message}
            >
              <Button
                type="button"
                variant="secondary"
                className="w-full justify-between"
                onClick={() => setPickerOpen(true)}
              >
                {selectedResource ? (
                  <span className="flex min-w-0 items-center gap-2">
                    <ResourceTypeIcon
                      type={selectedResource.type}
                      className="h-4 w-4 shrink-0"
                    />
                    <span className="truncate text-fg">
                      {selectedResource.title}
                    </span>
                  </span>
                ) : (
                  <span className="text-fg-secondary">
                    Select a resource…
                  </span>
                )}
                <Search className="h-4 w-4 text-fg-secondary" />
              </Button>
            </Field>

            <Field label="Description">
              <DescriptionImprover
                value={form.watch('description') ?? ''}
                onChange={(v) =>
                  form.setValue('description', v, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                disabled={pending}
                placeholder="Optional context"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Priority">
                <Select
                  value={form.watch('priority')}
                  onValueChange={(v) => form.setValue('priority', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Status">
                <Select
                  value={form.watch('status')}
                  onValueChange={(v) => form.setValue('status', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TODO_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Due Date">
                <Input type="date" {...form.register('dueDate')} />
              </Field>
              <Field label="Estimated Time">
                <Select
                  value={form.watch('estimatedTime')}
                  onValueChange={(v) =>
                    form.setValue(
                      'estimatedTime',
                      v as FormValues['estimatedTime'],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {TODO_ESTIMATED_TIMES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <DialogFooter className="sticky bottom-0 -mx-6 -mb-5 mt-2 bg-surface px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Add Todo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Searchable resource picker */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select a Resource</DialogTitle>
            <DialogDescription>
              Search your learning library to link this todo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 px-6 py-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-secondary" />
              <Input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources…"
                className="pl-9"
              />
            </div>
            <div className="max-h-72 space-y-1.5 overflow-y-auto">
              {isLoading && (
                <p className="py-6 text-center font-sans text-sm text-fg-secondary">
                  Loading…
                </p>
              )}
              {!isLoading && resources?.items.length === 0 && (
                <p className="py-6 text-center font-sans text-sm text-fg-secondary">
                  No resources found.
                </p>
              )}
              {resources?.items.map((r) => {
                const active = r.id === selectedId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      form.setValue('resourceId', r.id, {
                        shouldValidate: true,
                      });
                      setPickerOpen(false);
                    }}
                    className={cnRow(active)}
                  >
                    <ResourceTypeIcon
                      type={r.type}
                      className="h-4 w-4 shrink-0"
                    />
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate font-sans text-sm text-fg">
                        {r.title}
                      </span>
                      <span className="mono-label text-[10px] text-fg-secondary">
                        {r.type}
                      </span>
                    </span>
                    {active && <Check className="h-4 w-4 text-mint" />}
                  </button>
                );
              })}
            </div>
            {(!resources || resources.items.length === 0) &&
              !isLoading &&
              !search && (
                <p className="flex items-center justify-center gap-2 font-sans text-xs text-fg-secondary">
                  <BookOpen className="h-3.5 w-3.5" />
                  Add a resource first to link it here.
                </p>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function cnRow(active: boolean) {
  return [
    'flex w-full items-center gap-3 rounded-pill border px-3 py-2.5 text-left transition-colors',
    active
      ? 'border-mint/50 bg-mint/10'
      : 'border-fg/10 bg-canvas/40 hover:border-fg/20',
  ].join(' ');
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="font-sans text-xs text-danger">{error}</p>}
    </div>
  );
}
