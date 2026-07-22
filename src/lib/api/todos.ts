import { api } from './client';
import { buildQuery } from '../utils';
import type {
  Paginated,
  ResourcePriority,
  Todo,
  TodoEstimatedTime,
  TodoStatus,
  TodoSummary,
} from '../types';

export interface TodoQuery {
  search?: string;
  status?: TodoStatus;
  priority?: ResourcePriority;
  resourceId?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  resourceId: string;
  status?: TodoStatus;
  priority?: ResourcePriority;
  dueDate?: string;
  estimatedTime?: TodoEstimatedTime;
}

export type UpdateTodoInput = Partial<CreateTodoInput>;

export const todosApi = {
  list: (q: TodoQuery = {}, signal?: AbortSignal) =>
    api.get<Paginated<Todo>>('/todos', buildQuery(q as Record<string, unknown>), signal),

  summary: () => api.get<TodoSummary>('/todos/summary'),

  get: (id: string) => api.get<Todo>(`/todos/${id}`),

  create: (input: CreateTodoInput) => api.post<Todo>('/todos', input),

  update: (id: string, input: UpdateTodoInput) =>
    api.patch<Todo>(`/todos/${id}`, input),

  complete: (id: string) => api.patch<Todo>(`/todos/${id}/complete`),

  start: (id: string) => api.patch<Todo>(`/todos/${id}/start`),

  remove: (id: string) => api.delete<{ deleted: true }>(`/todos/${id}`),
};
