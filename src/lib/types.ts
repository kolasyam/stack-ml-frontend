/**
 * Shared domain types — mirror the NestJS backend DTOs/schemas.
 *
 * `id` is present (Mongoose virtual) even though `_id`/`__v` are stripped
 * server-side by the schema's `toJSON` transform.
 */

export type ResourceType =
  | 'GitHub'
  | 'PDF'
  | 'Documentation'
  | 'YouTube'
  | 'Instagram'
  | 'LinkedIn'
  | 'Website'
  | 'Research Paper'
  | 'DOC'
  | 'DOCX'
  | 'Other';

export type ResourceDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type ResourcePriority = 'Low' | 'Medium' | 'High';
export type ResourceStatus = 'Not Started' | 'Reading' | 'Completed';

export type ResourceSort =
  | 'newest'
  | 'oldest'
  | 'recentlyRead'
  | 'alphabetical'
  | 'priority'
  | 'progress';

export type TodoStatus =
  | 'Not Started'
  | 'Studying'
  | 'Reading'
  | 'Completed';

export type TodoEstimatedTime = '30 mins' | '1 hour' | '2 hours' | 'Custom';

export type NotePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type NoteStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Completed';

export interface Bookmark {
  page: number;
  note?: string;
  createdAt: string;
}

/** A persisted PDF text highlight. Rects are fractions (0..1) of the page box. */
export interface HighlightRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Highlight {
  /** Subdocument id (Mongoose `_id`). */
  _id: string;
  page: number;
  rects: HighlightRect[];
  color: string;
  note?: string;
  /** Plain text selected when the highlight was created. */
  text?: string;
  createdAt?: string;
}

export interface Resource {
  id: string;
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
  tags: string[];
  difficulty?: ResourceDifficulty;
  priority?: ResourcePriority;
  estimatedReadingTime?: number;
  status: ResourceStatus;
  favorite: boolean;
  readingProgress: number;
  currentPage: number;
  bookmarks: Bookmark[];
  highlights: Highlight[];
  lastReadAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Light resource snapshot populated onto a Todo. */
export interface ResourceSnapshot {
  id: string;
  title: string;
  type: ResourceType;
  status?: ResourceStatus;
  filePath?: string;
  fileUrl?: string;
  currentPage?: number;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  resourceId: ResourceSnapshot | string;
  status: TodoStatus;
  priority: ResourcePriority;
  dueDate?: string;
  estimatedTime?: TodoEstimatedTime;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Note {
  id: string;
  taskName: string;
  taskDescription?: string;
  priority: NotePriority;
  status: NoteStatus;
  assignedBy?: string;
  projectName?: string;
  attachments: string[];
  links: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Upload metadata returned by POST /uploads. */
export interface UploadResult {
  path: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  signedUrl: string;
  pages?: number;
  extractedText?: string;
}

export interface ResourceStats {
  total: number;
  reading: number;
  completed: number;
  favorites: number;
  pdfs: number;
}

export interface TodoSummary {
  total: number;
  completed: number;
  reading: number;
  studying: number;
  notStarted: number;
  remaining: number;
  completionPct: number;
  upcoming: number;
  recentlyAdded: number;
}

export interface NoteSummary {
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  notStarted: number;
  critical: number;
  remaining: number;
}

export interface DashboardData {
  resources: ResourceStats;
  todos: TodoSummary;
  notes: NoteSummary;
  currentReading: Resource | null;
  recentResources: Resource[];
  recentTodos: Todo[];
  recentNotes: Note[];
}

export interface SearchResult {
  query: string;
  resources: Resource[];
  todos: Todo[];
  notes: Note[];
  counts: { resources: number; todos: number; notes: number };
}

export interface ApiError {
  success: false;
  statusCode: number;
  path: string;
  method: string;
  timestamp: string;
  error: string;
  message: string | string[];
}

/** Success envelope shape (data generic erased on the wire). */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  path: string;
}
