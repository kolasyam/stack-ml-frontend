'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, UploadCloud, X } from 'lucide-react';

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
import { Switch } from '@/components/ui/switch';
import { TagInput } from '@/components/ui/tag-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RESOURCE_DIFFICULTIES,
  RESOURCE_PRIORITIES,
  RESOURCE_STATUSES,
  RESOURCE_TYPES,
  DOCUMENT_TYPES,
  isDocumentType,
} from '@/lib/constants';
import { uploadsApi } from '@/lib/api/resources';
import { formatBytes } from '@/lib/utils';
import { useCreateResource, useUpdateResource } from '../hooks/use-resources';
import type {
  CreateResourceInput,
  UpdateResourceInput,
} from '@/lib/api/resources';
import type { Resource } from '@/lib/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(RESOURCE_TYPES as [string, ...string[]]),
  link: z
    .string()
    .url('Enter a valid URL')
    .optional()
    .or(z.literal('')),
  difficulty: z.enum(RESOURCE_DIFFICULTIES as [string, ...string[]]).optional(),
  priority: z.enum(RESOURCE_PRIORITIES as [string, ...string[]]).optional(),
  estimatedReadingTime: z.coerce.number().min(0).optional(),
  status: z.enum(RESOURCE_STATUSES as [string, ...string[]]).optional(),
  favorite: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource | null;
  /** After a successful create, optionally navigate away. */
  onCreated?: (resource: Resource) => void;
}

export function ResourceFormDialog({
  open,
  onOpenChange,
  resource,
  onCreated,
}: Props) {
  const isEdit = !!resource;
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const create = useCreateResource();
  const update = useUpdateResource();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      type: 'Website',
      link: '',
      difficulty: undefined,
      priority: 'Medium',
      estimatedReadingTime: undefined,
      status: 'Not Started',
      favorite: false,
      tags: [],
    },
  });

  // Reset form whenever the dialog opens (create vs edit).
  React.useEffect(() => {
    if (!open) return;
    setFile(null);
    if (resource) {
      form.reset({
        title: resource.title,
        description: resource.description ?? '',
        type: resource.type,
        link: resource.link ?? '',
        difficulty: resource.difficulty,
        priority: resource.priority ?? 'Medium',
        estimatedReadingTime: resource.estimatedReadingTime,
        status: resource.status,
        favorite: resource.favorite,
        tags: resource.tags ?? [],
      });
    } else {
      form.reset({
        title: '',
        description: '',
        type: 'Website',
        link: '',
        difficulty: undefined,
        priority: 'Medium',
        estimatedReadingTime: undefined,
        status: 'Not Started',
        favorite: false,
        tags: [],
      });
    }
  }, [open, resource, form]);

  const selectedType = form.watch('type') as Parameters<typeof isDocumentType>[0];
  const showLink = !isDocumentType(selectedType);
  const showUpload = isDocumentType(selectedType);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const ok = DOCUMENT_TYPES.some((t) =>
        f.name.toLowerCase().endsWith(`.${t.toLowerCase()}`),
      );
      if (!ok && !/\.(pdf|docx?)$/i.test(f.name)) {
        toast.error('Upload Failed — only PDF, DOC, DOCX are allowed');
        return;
      }
      setFile(f);
    }
  };

  const onSubmit = async (values: FormValues) => {
    let fileMeta: Record<string, unknown> = {};

    if (showUpload && file) {
      setUploading(true);
      try {
        const res = await uploadsApi.upload(file);
        fileMeta = {
          fileUrl: res.signedUrl,
          filePath: res.path,
          fileName: res.fileName,
          fileSize: res.fileSize,
          fileType: res.fileType,
          pages: res.pages,
          extractedText: res.extractedText,
        };
        toast.success('File Uploaded');
      } catch (err) {
        setUploading(false);
        toast.error(err instanceof Error ? err.message : 'Upload Failed');
        return;
      }
      setUploading(false);
    }

    const payload = {
      title: values.title,
      description: values.description || undefined,
      type: values.type,
      link: showLink ? values.link || undefined : undefined,
      tags: values.tags ?? [],
      difficulty: values.difficulty || undefined,
      priority: values.priority || undefined,
      estimatedReadingTime: values.estimatedReadingTime || undefined,
      status: values.status || undefined,
      favorite: values.favorite || undefined,
      ...(file ? fileMeta : {}),
    };

    if (isEdit && resource) {
      update.mutate(
        { id: resource.id, input: payload as unknown as UpdateResourceInput },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      create.mutate(payload as unknown as CreateResourceInput, {
        onSuccess: (created) => {
          onOpenChange(false);
          onCreated?.(created);
        },
      });
    }
  };

  const pending = create.isPending || update.isPending || uploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Resource' : 'Add Resource'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details of this learning resource.'
              : 'Capture a new learning resource — link or upload a document.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-h-[64vh] flex-col gap-4 overflow-y-auto px-6 py-5"
        >
          <Field label="Resource Title" error={form.formState.errors.title?.message}>
            <Input
              placeholder="e.g. Attention Is All You Need"
              {...form.register('title')}
            />
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
              placeholder="What is this resource about?"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select
                value={form.watch('type')}
                onValueChange={(v) => form.setValue('type', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

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
          </div>

          {showLink && (
            <Field label="Link" error={form.formState.errors.link?.message}>
              <Input
                placeholder="https://…"
                {...form.register('link')}
              />
            </Field>
          )}

          {showUpload && (
            <Field label="Upload File (PDF / DOC / DOCX)">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={onFileChange}
              />
              {file ? (
                <div className="flex items-center justify-between rounded-pill border border-mint/30 bg-mint/5 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-sans text-sm text-fg">
                      {file.name}
                    </p>
                    <p className="mono-label text-[10px] text-fg-secondary">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="rounded-full p-1.5 text-fg-secondary hover:bg-fg/10 hover:text-fg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-1 rounded-feature border border-dashed border-fg/20 bg-canvas/40 px-4 py-6 text-center transition-colors hover:border-mint/40"
                >
                  <UploadCloud className="h-6 w-6 text-mint" />
                  <span className="font-sans text-sm text-fg">
                    Tap to upload a document
                  </span>
                  <span className="mono-label text-[10px] text-fg-secondary">
                    PDF · DOC · DOCX
                  </span>
                </button>
              )}
              {resource?.fileName && !file && (
                <p className="mono-label mt-1 text-[10px] text-fg-secondary">
                  Current: {resource.fileName}
                </p>
              )}
            </Field>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Difficulty">
              <Select
                value={form.watch('difficulty')}
                onValueChange={(v) =>
                  form.setValue('difficulty', v as FormValues['difficulty'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
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
                  {RESOURCE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Est. Reading Time (min)">
              <Input
                type="number"
                min={0}
                placeholder="e.g. 30"
                {...form.register('estimatedReadingTime')}
              />
            </Field>
            <Field label="Tags">
              <TagInput
                value={form.watch('tags') ?? []}
                onChange={(tags) => form.setValue('tags', tags)}
              />
            </Field>
          </div>

          <label className="flex items-center justify-between rounded-pill border border-fg/10 bg-canvas/40 px-4 py-3">
            <span className="font-sans text-sm text-fg">Favorite</span>
            <Switch
              checked={form.watch('favorite')}
              onCheckedChange={(v) => form.setValue('favorite', v)}
            />
          </label>

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
              {isEdit ? 'Save Changes' : 'Add Resource'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
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
