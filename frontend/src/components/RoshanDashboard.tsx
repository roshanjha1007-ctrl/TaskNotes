import { useEffect, useMemo, useRef, useState } from 'react';
import { CreateTaskPayload, Task } from '../types';
import { CreateTaskModal } from './CreateTaskModal';
import { MonthlyCheckInPanel } from './MonthlyCheckInPanel';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { CheckIcon, MenuIcon, PlusIcon, SparkIcon } from './ui/Icons';

interface RoshanDashboardProps {
  onExit: () => void;
  onNotify: (message: string, tone?: 'success' | 'error' | 'info') => void;
}

interface RoshanPrivateTask {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

const ROSHAN_PRIVATE_TASKS_KEY = 'tasknotes-roshan-private-tasks';
const ROSHAN_MONTHLY_CHECKINS_KEY = 'tasknotes-roshan-monthly-checkins';
const PRIORITY_STYLES: Record<RoshanPrivateTask['priority'], string> = {
  low: 'bg-[color:color-mix(in_srgb,var(--success-bg)_75%,transparent)] text-[var(--success-fg)]',
  medium:
    'bg-[color:color-mix(in_srgb,var(--warning-bg)_82%,transparent)] text-[var(--warning-fg)]',
  high: 'bg-[color:color-mix(in_srgb,var(--error-bg)_82%,transparent)] text-[var(--error-fg)]',
};

function readPrivateTasks() {
  if (typeof window === 'undefined') return [] as RoshanPrivateTask[];

  const raw = window.localStorage.getItem(ROSHAN_PRIVATE_TASKS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as RoshanPrivateTask[];
  } catch {
    window.localStorage.removeItem(ROSHAN_PRIVATE_TASKS_KEY);
    return [];
  }
}

function writePrivateTasks(tasks: RoshanPrivateTask[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ROSHAN_PRIVATE_TASKS_KEY, JSON.stringify(tasks));
}

function createPrivateTask(payload: CreateTaskPayload): RoshanPrivateTask {
  return {
    id: `roshan_${Math.random().toString(36).slice(2, 10)}`,
    title: payload.title.trim(),
    description: payload.description?.trim() || null,
    priority: payload.priority ?? 'medium',
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

function mapPrivateTaskToTask(task: RoshanPrivateTask): Task {
  return {
    id: task.id,
    userId: 'roshan-private',
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: null,
    completed: task.completed,
    createdAt: task.createdAt,
    updatedAt: task.createdAt,
    notes: [],
  };
}

export function RoshanDashboard({ onExit, onNotify }: RoshanDashboardProps) {
  const tasksRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [privateTasks, setPrivateTasks] = useState<RoshanPrivateTask[]>([]);

  useEffect(() => {
    setPrivateTasks(readPrivateTasks());
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const closeMenu = () => setMenuOpen(false);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [menuOpen]);

  const mappedTasks = useMemo(() => privateTasks.map(mapPrivateTaskToTask), [privateTasks]);

  const handleCreateTask = async (payload: CreateTaskPayload) => {
    const nextTask = createPrivateTask(payload);
    setPrivateTasks((current) => {
      const next = [nextTask, ...current];
      writePrivateTasks(next);
      return next;
    });
    onNotify('Private Roshan task added.', 'success');
    onNotify('Training arc active. One more mission is live.', 'info');
  };

  const handleDeleteTask = (taskId: string) => {
    setPrivateTasks((current) => {
      const next = current.filter((task) => task.id !== taskId);
      writePrivateTasks(next);
      return next;
    });
    onNotify('Private task removed.', 'info');
  };

  const handleToggleTask = (taskId: string) => {
    setPrivateTasks((current) => {
      const next = current.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      );
      writePrivateTasks(next);
      return next;
    });
    onNotify('Private task status updated.', 'success');
  };

  return (
    <div className="min-h-screen bg-transparent px-4 py-5 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
            Private route
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Roshan Dashboard</h1>
        </div>

        <div className="relative">
          <button
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] p-3 text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((current) => !current);
            }}
            aria-label="Open Roshan menu"
            aria-expanded={menuOpen}
          >
            <MenuIcon width={18} height={18} />
          </button>

          {menuOpen ? (
            <div
              className="absolute right-0 top-[calc(100%+0.75rem)] z-40 min-w-[220px] rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] p-2 shadow-[var(--shadow-lg)]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--error-fg)] transition hover:bg-[var(--surface-secondary)]"
                onClick={() => {
                  setMenuOpen(false);
                  onExit();
                }}
              >
                Exit
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="roshan-shell mx-auto grid max-w-[1400px] gap-6 rounded-[40px] border border-[var(--border)] p-5 shadow-[var(--shadow-lg)] sm:p-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[32px] border-0 bg-[color:color-mix(in_srgb,var(--surface-primary)_86%,transparent)] p-6 backdrop-blur-xl sm:p-7">
          <div className="space-y-3">
            {privateTasks.length ? (
              privateTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-[24px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-primary)_72%,transparent)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-[var(--text-primary)]">{task.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {task.description || 'Private focus item saved for Roshan.'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${PRIORITY_STYLES[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className="mt-4 text-xs font-medium text-[var(--text-muted)]">
                    {task.completed ? 'Completed' : 'In progress'}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-primary)_72%,transparent)] p-5 text-sm leading-6 text-[var(--text-secondary)]">
                No private tasks yet. Add one and it will show up here with its priority.
              </div>
            )}
          </div>
        </Card>

        <div className="grid gap-6">
          <Card className="rounded-[30px] border-0 bg-[color:color-mix(in_srgb,var(--surface-primary)_82%,transparent)] p-6 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Quick actions
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => setShowCreate(true)}>
                <PlusIcon width={16} height={16} />
                Add task
              </Button>
              <Button
                variant="secondary"
                onClick={() => tasksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                <SparkIcon width={16} height={16} />
                Thought of the day
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  document
                    .getElementById('roshan-monthly-checkin')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              >
                <SparkIcon width={16} height={16} />
                Monthly check-in
              </Button>
            </div>
          </Card>

          <Card className="rounded-[30px] border-0 bg-[color:color-mix(in_srgb,var(--surface-primary)_82%,transparent)] p-6 backdrop-blur-xl">
            <div ref={tasksRef}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Private tasks
              </p>
              <div className="mt-4 space-y-3">
                {privateTasks.length ? (
                  privateTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-[22px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-secondary)_88%,transparent)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{task.title}</p>
                          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                            {task.description || 'Private focus item saved for Roshan.'}
                          </p>
                        </div>
                        <button
                          className="rounded-full px-2 py-1 text-xs font-medium text-[var(--error-fg)] transition hover:bg-[var(--surface-primary)]"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={task.completed ? 'secondary' : 'primary'}
                          onClick={() => handleToggleTask(task.id)}
                        >
                          <CheckIcon width={14} height={14} />
                          {task.completed ? 'Completed' : 'Mark done'}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-secondary)_88%,transparent)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
                    No private tasks yet. Use Add task to save quick priorities here.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div id="roshan-monthly-checkin" className="xl:col-span-2">
          <MonthlyCheckInPanel
            storageKey={ROSHAN_MONTHLY_CHECKINS_KEY}
            tasks={mappedTasks}
            title="Daily reflection, monthly view"
            submitLabel="Submit response"
            quoteLabel="Motivation after submit"
            showSamosaQuestion
            onNotify={onNotify}
          />
        </div>
      </div>

      {showCreate ? (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onCreate={async (payload) => {
            await handleCreateTask(payload);
            setShowCreate(false);
          }}
        />
      ) : null}
    </div>
  );
}
