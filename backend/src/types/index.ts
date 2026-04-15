// ─── Domain Models ───────────────────────────────────────────────────────────

export interface Note {
  id: string;
  content: string;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  userId: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: Date | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  notes: Note[];
}

// ─── Request Bodies ───────────────────────────────────────────────────────────

export type TaskPriority = 'low' | 'medium' | 'high';

export interface CreateTaskBody {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  notes?: CreateNoteBody[];
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  completed?: boolean;
}

export interface CreateNoteBody {
  content: string;
}

// ─── API Response Envelope ────────────────────────────────────────────────────

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

// ─── Filter ───────────────────────────────────────────────────────────────────

export type TaskFilter = 'all' | 'pending' | 'completed';

export interface TaskListQuery {
  status?: TaskFilter;
  q?: string;
  page?: number;
  pageSize?: number;
}
