'use client';

import * as React from 'react';
import { ResourceFormDialog } from '@/features/resources/components/resource-form-dialog';
import { TodoFormDialog } from '@/features/todos/components/todo-form-dialog';
import { NoteFormDialog } from '@/features/notes/components/note-form-dialog';
import type { Note, Resource, Todo } from '@/lib/types';

export type CreateKind = 'resource' | 'todo' | 'note';
type EditTarget =
  | { kind: 'resource'; item: Resource }
  | { kind: 'todo'; item: Todo }
  | { kind: 'note'; item: Note }
  | null;

interface CreateContextValue {
  openCreate: (kind: CreateKind) => void;
  openEdit: (target: EditTarget) => void;
  openResource: (resource: Resource) => void;
  openTodo: (todo: Todo) => void;
  openNote: (note: Note) => void;
}

const CreateContext = React.createContext<CreateContextValue | null>(null);

export function useCreate() {
  const ctx = React.useContext(CreateContext);
  if (!ctx) throw new Error('useCreate must be used within CreateProvider');
  return ctx;
}

/**
 * Hosts the three create/edit dialogs in one place so any component (FAB,
 * command palette, empty states) can open them without prop-drilling.
 */
export function CreateProvider({ children }: { children: React.ReactNode }) {
  const [createKind, setCreateKind] = React.useState<CreateKind | null>(null);
  const [editTarget, setEditTarget] = React.useState<EditTarget>(null);

  const openCreate = (kind: CreateKind) => {
    setEditTarget(null);
    setCreateKind(kind);
  };
  const openEdit = (target: EditTarget) => {
    setCreateKind(null);
    setEditTarget(target);
  };

  const closeAll = () => {
    setCreateKind(null);
    setEditTarget(null);
  };

  const resourceActive = createKind === 'resource' || editTarget?.kind === 'resource';
  const todoActive = createKind === 'todo' || editTarget?.kind === 'todo';
  const noteActive = createKind === 'note' || editTarget?.kind === 'note';

  return (
    <CreateContext.Provider
      value={{
        openCreate,
        openEdit,
        openResource: (item) => openEdit({ kind: 'resource', item }),
        openTodo: (item) => openEdit({ kind: 'todo', item }),
        openNote: (item) => openEdit({ kind: 'note', item }),
      }}
    >
      {children}

      <ResourceFormDialog
        open={resourceActive}
        onOpenChange={(o) => !o && closeAll()}
        resource={editTarget?.kind === 'resource' ? editTarget.item : null}
      />
      <TodoFormDialog
        open={todoActive}
        onOpenChange={(o) => !o && closeAll()}
        todo={editTarget?.kind === 'todo' ? editTarget.item : null}
      />
      <NoteFormDialog
        open={noteActive}
        onOpenChange={(o) => !o && closeAll()}
        note={editTarget?.kind === 'note' ? editTarget.item : null}
      />
    </CreateContext.Provider>
  );
}
