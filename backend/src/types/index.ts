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

export type ReflectionQuestionType =
  | 'number'
  | 'text'
  | 'rating'
  | 'yes_no'
  | 'multi_select'
  | 'color_select';

export type ReflectionGraphType = 'line' | 'bar' | 'dots';

export interface ReflectionOption {
  label: string;
  color: string;
}

export interface ReflectionQuestion {
  id: string;
  questionText: string;
  type: ReflectionQuestionType;
  options: ReflectionOption[];
  graphType: ReflectionGraphType;
  defaultColor: string | null;
}

export interface ReflectionQuestionWithMeta extends ReflectionQuestion {
  hasResponses: boolean;
}

export interface DailyReflectionAnswer {
  questionId: string;
  value: unknown;
  selectedColor?: string | null;
}

export interface DailyReflectionResponse {
  date: string;
  answers: DailyReflectionAnswer[];
}

export interface SaveQuestionsBody {
  questions: ReflectionQuestion[];
}

export interface SaveResponsesBody {
  date: string;
  answers: DailyReflectionAnswer[];
}

export interface ReflectionResponsesQuery {
  startDate?: string;
  endDate?: string;
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
