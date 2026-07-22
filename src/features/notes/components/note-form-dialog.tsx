'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
import { TagInput } from '@/components/ui/tag-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NOTE_PRIORITIES, NOTE_STATUSES } from '@/lib/constants';
import { useCreateNote, useUpdateNote } from '../hooks/use-notes';
import type { CreateNoteInput, UpdateNoteInput } from '@/lib/api/notes';
import type { Note } from '@/lib/types';

const schema = z.object({
  taskName: z.string().min(1, 'Task name is required'),
  taskDescription: z.string().optional(),
  priority: z.enum(NOTE_PRIORITIES as [string, ...string[]]).optional(),
  status: z.enum(NOTE_STATUSES as [string, ...string[]]).optional(),
  assignedBy: z.string().optional(),
  projectName: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  links: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note | null;
}

export function NoteFormDialog({ open, onOpenChange, note }: Props) {
  const isEdit = !!note;
  const create = useCreateNote();
  const update = useUpdateNote();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      taskName: '',
      taskDescription: '',
      priority: 'Medium',
      status: 'Not Started',
      assignedBy: '',
      projectName: '',
      attachments: [],
      links: [],
    },
  });

  React.useEffect(() => {
    if (!open) return;
    if (note) {
      form.reset({
        taskName: note.taskName,
        taskDescription: note.taskDescription ?? '',
        priority: note.priority,
        status: note.status,
        assignedBy: note.assignedBy ?? '',
        projectName: note.projectName ?? '',
        attachments: note.attachments ?? [],
        links: note.links ?? [],
      });
    } else {
      form.reset({
        taskName: '',
        taskDescription: '',
        priority: 'Medium',
        status: 'Not Started',
        assignedBy: '',
        projectName: '',
        attachments: [],
        links: [],
      });
    }
  }, [open, note, form]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      taskName: values.taskName,
      taskDescription: values.taskDescription || undefined,
      priority: values.priority || undefined,
      status: values.status || undefined,
      assignedBy: values.assignedBy || undefined,
      projectName: values.projectName || undefined,
      attachments: values.attachments ?? [],
      links: values.links ?? [],
    };
    if (isEdit && note) {
      update.mutate(
        { id: note.id, input: payload as unknown as UpdateNoteInput },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      create.mutate(payload as unknown as CreateNoteInput, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Task Note' : 'Add Task Note'}</DialogTitle>
          <DialogDescription>
            Capture a company task — separate from your personal learning todos.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-h-[64vh] flex-col gap-4 overflow-y-auto px-6 py-5"
        >
          <Field
            label="Task Name"
            error={form.formState.errors.taskName?.message}
          >
            <Input placeholder="e.g. Ship onboarding flow" {...form.register('taskName')} />
          </Field>

          <Field label="Task Description">
            <DescriptionImprover
              value={form.watch('taskDescription') ?? ''}
              onChange={(v) =>
                form.setValue('taskDescription', v, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              disabled={pending}
              placeholder="Details, acceptance criteria…"
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
                  {NOTE_PRIORITIES.map((p) => (
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
                  {NOTE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Assigned By">
              <Input placeholder="Manager name" {...form.register('assignedBy')} />
            </Field>
            <Field label="Project Name">
              <Input placeholder="Project" {...form.register('projectName')} />
            </Field>
          </div>

          <Field label="Attachments (URLs)">
            <TagInput
              value={form.watch('attachments') ?? []}
              onChange={(v) => form.setValue('attachments', v)}
              placeholder="Paste a URL and press Enter"
            />
          </Field>

          <Field label="Links (URLs)">
            <TagInput
              value={form.watch('links') ?? []}
              onChange={(v) => form.setValue('links', v)}
              placeholder="Paste a URL and press Enter"
            />
          </Field>

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
              {isEdit ? 'Save Changes' : 'Save Note'}
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
