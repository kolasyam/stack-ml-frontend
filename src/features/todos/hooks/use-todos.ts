'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { todosApi, type TodoQuery } from '@/lib/api/todos';
import { queryKeys } from '@/lib/query-keys';

export function useTodoList(query: TodoQuery = {}) {
  return useQuery({
    queryKey: queryKeys.todos.list(query),
    queryFn: ({ signal }) => todosApi.list(query, signal),
  });
}

export function useTodoSummary() {
  return useQuery({
    queryKey: queryKeys.todos.summary,
    queryFn: todosApi.summary,
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof todosApi.create>[0]) =>
      todosApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.todos.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Todo Created');
    },
    onError: (e: Error) => toast.error(e.message || 'Could not create todo'),
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof todosApi.update>[1];
    }) => todosApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.todos.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Todo Updated');
    },
    onError: (e: Error) => toast.error(e.message || 'Could not update todo'),
  });
}

export function useCompleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todosApi.complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.todos.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Todo Completed');
    },
    onError: (e: Error) => toast.error(e.message || 'Could not complete todo'),
  });
}

export function useStartTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todosApi.start(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.todos.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Todo Started');
    },
    onError: (e: Error) => toast.error(e.message || 'Could not start todo'),
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todosApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.todos.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Todo Deleted');
    },
    onError: (e: Error) => toast.error(e.message || 'Could not delete todo'),
  });
}
