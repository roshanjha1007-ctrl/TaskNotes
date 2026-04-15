import {
  CreateNotePayload,
  CreateTaskPayload,
  Task,
  TaskCounts,
  TaskFilter,
  UpdateTaskPayload,
  WorkspaceUser,
} from '../types';

const DEMO_USER_KEY = 'tasknotes-demo-user';
const DEMO_TASKS_KEY = 'tasknotes-demo-tasks';
const DEMO_ONBOARDING_KEY = 'tasknotes-onboarding';

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function isoDaysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export const DEMO_CREDENTIALS = {
  email: 'demo@tasknotes.app',
  password: 'TaskNotes2026!',
};

export const DEMO_USER: WorkspaceUser = {
  id: 'demo-user',
  email: DEMO_CREDENTIALS.email,
  name: 'Product Demo',
  isOwner: false,
  mode: 'demo',
};

export const DEMO_SEED_TASKS: Task[] = [
  {
    id: 'demo-task-1',
    userId: DEMO_USER.id,
    title: 'Finalize onboarding checklist for new teammates',
    description: 'Turn the rough handoff doc into a polished first-week checklist with product links and owner notes.',
    priority: 'high',
    dueDate: isoDaysFromNow(1),
    completed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    notes: [
      {
        id: 'demo-note-1',
        taskId: 'demo-task-1',
        content: 'Need sign-off from design and support before publishing.',
        createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      },
    ],
  },
  {
    id: 'demo-task-2',
    userId: DEMO_USER.id,
    title: 'Review this week’s customer follow-ups',
    description: 'Tag churn risks, summarize trends, and queue product requests for the roadmap sync.',
    priority: 'medium',
    dueDate: isoDaysFromNow(3),
    completed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    notes: [],
  },
  {
    id: 'demo-task-3',
    userId: DEMO_USER.id,
    title: 'Ship dashboard visual refresh',
    description: 'Replace the placeholder cards with retention-oriented KPI summaries and activity snapshots.',
    priority: 'high',
    dueDate: isoDaysFromNow(-1),
    completed: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    notes: [
      {
        id: 'demo-note-2',
        taskId: 'demo-task-3',
        content: 'Motion is intentionally subtle to keep dashboards feeling fast.',
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    ],
  },
];

export function readDemoTasks() {
  if (typeof window === 'undefined') return DEMO_SEED_TASKS;
  const raw = window.localStorage.getItem(DEMO_TASKS_KEY);
  if (!raw) {
    window.localStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(DEMO_SEED_TASKS));
    return DEMO_SEED_TASKS;
  }

  try {
    return JSON.parse(raw) as Task[];
  } catch {
    window.localStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(DEMO_SEED_TASKS));
    return DEMO_SEED_TASKS;
  }
}

export function writeDemoTasks(tasks: Task[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(tasks));
}

export function enableDemoUser() {
  if (typeof window === 'undefined') return DEMO_USER;
  window.localStorage.setItem(DEMO_USER_KEY, JSON.stringify(DEMO_USER));
  return DEMO_USER;
}

export function readDemoUser() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(DEMO_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as WorkspaceUser;
  } catch {
    return null;
  }
}

export function clearDemoUser() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DEMO_USER_KEY);
}

export function getOnboardingKey(userId: string) {
  return `${DEMO_ONBOARDING_KEY}:${userId}`;
}

export function readOnboardingState(userId: string) {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(getOnboardingKey(userId)) === 'done';
}

export function writeOnboardingState(userId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getOnboardingKey(userId), 'done');
}

export function getTaskCounts(tasks: Task[]): TaskCounts {
  return {
    all: tasks.length,
    pending: tasks.filter((task) => !task.completed).length,
    completed: tasks.filter((task) => task.completed).length,
  };
}

export function filterDemoTasks(tasks: Task[], filter: TaskFilter, search: string) {
  const loweredSearch = search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (!loweredSearch) return true;

    const haystack = [
      task.title,
      task.description ?? '',
      task.priority,
      ...task.notes.map((note) => note.content),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(loweredSearch);
  });
}

export function createDemoTask(userId: string, payload: CreateTaskPayload): Task {
  const now = new Date().toISOString();
  return {
    id: createId('task'),
    userId,
    title: payload.title.trim(),
    description: payload.description?.trim() || null,
    priority: payload.priority ?? 'medium',
    dueDate: payload.dueDate ?? null,
    completed: false,
    createdAt: now,
    updatedAt: now,
    notes: (payload.notes ?? []).map((note) => ({
      id: createId('note'),
      taskId: '',
      content: note.content.trim(),
      createdAt: now,
      updatedAt: now,
    })),
  };
}

export function updateDemoTask(task: Task, payload: UpdateTaskPayload): Task {
  return {
    ...task,
    title: payload.title !== undefined ? payload.title.trim() : task.title,
    description:
      payload.description !== undefined ? payload.description?.trim() || null : task.description,
    priority: payload.priority ?? task.priority,
    dueDate: payload.dueDate !== undefined ? payload.dueDate : task.dueDate,
    completed: payload.completed ?? task.completed,
    updatedAt: new Date().toISOString(),
  };
}

export function createDemoNote(taskId: string, payload: CreateNotePayload) {
  const now = new Date().toISOString();
  return {
    id: createId('note'),
    taskId,
    content: payload.content.trim(),
    createdAt: now,
    updatedAt: now,
  };
}
