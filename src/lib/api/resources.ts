import { api } from './client';
import { buildQuery } from '../utils';
import type {
  Bookmark,
  Highlight,
  HighlightRect,
  Paginated,
  Resource,
  ResourceDifficulty,
  ResourcePriority,
  ResourceSort,
  ResourceStatus,
  ResourceType,
  UploadResult,
} from '../types';

export interface ResourceQuery {
  search?: string;
  type?: ResourceType;
  priority?: ResourcePriority;
  status?: ResourceStatus;
  favorite?: boolean;
  tags?: string[];
  sort?: ResourceSort;
  page?: number;
  limit?: number;
}

export interface CreateResourceInput {
  title: string;
  description?: string;
  type: ResourceType;
  link?: string;
  fileUrl?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  pages?: number;
  extractedText?: string;
  tags?: string[];
  difficulty?: ResourceDifficulty;
  priority?: ResourcePriority;
  estimatedReadingTime?: number;
  status?: ResourceStatus;
  favorite?: boolean;
}

export type UpdateResourceInput = Partial<CreateResourceInput>;

export interface ProgressInput {
  currentPage?: number;
  readingProgress?: number;
}

export const resourcesApi = {
  list: (q: ResourceQuery = {}, signal?: AbortSignal) =>
    api.get<Paginated<Resource>>('/resources', buildQuery(q as Record<string, unknown>), signal),

  get: (id: string) => api.get<Resource>(`/resources/${id}`),

  fileUrl: (id: string) =>
    api.get<{ url: string }>(`/resources/${id}/file-url`),

  create: (input: CreateResourceInput) =>
    api.post<Resource>('/resources', input),

  update: (id: string, input: UpdateResourceInput) =>
    api.patch<Resource>(`/resources/${id}`, input),

  progress: (id: string, input: ProgressInput) =>
    api.patch<Resource>(`/resources/${id}/progress`, input),

  toggleFavorite: (id: string) =>
    api.patch<Resource>(`/resources/${id}/favorite`),

  addBookmark: (id: string, bookmark: { page: number; note?: string }) =>
    api.post<Resource>(`/resources/${id}/bookmarks`, bookmark),

  removeBookmark: (id: string, page: number) =>
    api.delete<Resource>(`/resources/${id}/bookmarks/${page}`),

  addHighlight: (id: string, input: CreateHighlightInput) =>
    api.post<Resource>(`/resources/${id}/highlights`, input),

  updateHighlight: (id: string, highlightId: string, input: UpdateHighlightInput) =>
    api.patch<Resource>(`/resources/${id}/highlights/${highlightId}`, input),

  removeHighlight: (id: string, highlightId: string) =>
    api.delete<Resource>(`/resources/${id}/highlights/${highlightId}`),

  remove: (id: string) => api.delete<{ deleted: true }>(`/resources/${id}`),
};

export interface CreateHighlightInput {
  page: number;
  rects: HighlightRect[];
  color?: string;
  note?: string;
  text?: string;
}

export interface UpdateHighlightInput {
  color?: string;
  note?: string;
}

export type { Highlight };

export const uploadsApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.upload<UploadResult>('/uploads', form);
  },
  signedUrl: (path: string, download = false) =>
    api.get<{ url: string; path: string }>(
      '/uploads/signed-url',
      buildQuery({ path, download: download ? 'true' : undefined }),
    ),
};
