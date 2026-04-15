export interface Note {
  id: string;
  content: string;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  notes: Note[];
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  notes?: CreateNotePayload[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  completed?: boolean;
}

export interface CreateNotePayload {
  content: string;
}

export type TaskFilter = 'all' | 'pending' | 'completed';
export type TaskSort = 'newest' | 'oldest' | 'priority' | 'due-soon' | 'alphabetical';

export interface TaskCounts {
  all: number;
  pending: number;
  completed: number;
}

export interface TaskListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  counts: TaskCounts;
}

export interface TaskListResponse {
  items: Task[];
  meta: TaskListMeta;
}

export interface AuthUser {
  id: string;
  email: string | null;
}

export interface WorkspaceUser {
  id: string;
  email: string | null;
  name: string;
  mode: 'live' | 'demo';
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
