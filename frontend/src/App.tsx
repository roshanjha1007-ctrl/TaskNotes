import { useEffect, useMemo, useRef, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { authApi } from './api/auth';
import { setApiAuthToken } from './api/client';
import { useDemoTasks } from './hooks/useDemoTasks';
import { useTasks } from './hooks/useTasks';
import {
  clearDemoUser,
  enableDemoUser,
  readDemoUser,
  readOnboardingState,
  writeOnboardingState,
} from './lib/demo';
import { supabase } from './lib/supabase';
import { AuthScreen } from './components/AuthScreen';
import { CreateTaskModal } from './components/CreateTaskModal';
import { InsightsPanel } from './components/InsightsPanel';
import { OnboardingScreen } from './components/OnboardingScreen';
import { TaskFeedCard } from './components/TaskFeedCard';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { ToastMessage, ToastRegion } from './components/ui/ToastRegion';
import {
  CalendarDaysIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  SlidersIcon,
  TaskNotesLogoIcon,
  UserCircleIcon,
} from './components/ui/Icons';
import { Input } from './components/ui/Input';
import { cn } from './lib/cn';
import { AuthUser, Task, TaskFilter, TaskSort, WorkspaceUser } from './types';

type WorkspaceTab = 'feed' | 'dashboard';

function createToast(title: string, tone: ToastMessage['tone'] = 'info'): ToastMessage {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    tone,
  };
}

function getPriorityWeight(priority: Task['priority']) {
  return priority === 'high' ? 0 : priority === 'medium' ? 1 : 2;
}

function sortTasks(tasks: Task[], sort: TaskSort) {
  return [...tasks].sort((left, right) => {
    if (sort === 'oldest') {
      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    }

    if (sort === 'priority') {
      return getPriorityWeight(left.priority) - getPriorityWeight(right.priority);
    }

    if (sort === 'due-soon') {
      const leftDue = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const rightDue = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return leftDue - rightDue;
    }

    if (sort === 'alphabetical') {
      return left.title.localeCompare(right.title);
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

function getWorkspaceUser(session: Session | null, authUser: AuthUser | null): WorkspaceUser | null {
  if (!session) return null;
  const email = authUser?.email ?? session.user.email ?? null;
  return {
    id: authUser?.id ?? session.user.id,
    email,
    name: email?.split('@')[0] ?? 'Teammate',
    mode: 'live',
  };
}

function TaskFeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[30px] border border-[var(--border)] bg-[var(--surface-primary)] p-5"
        >
          <div className="flex items-start gap-4">
            <div className="mt-1 h-6 w-6 rounded-full bg-[var(--surface-tertiary)]" />
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-[var(--surface-tertiary)]" />
                <div className="h-6 w-24 rounded-full bg-[var(--surface-tertiary)]" />
              </div>
              <div className="h-5 w-2/5 rounded-full bg-[var(--surface-tertiary)]" />
              <div className="h-4 w-full rounded-full bg-[var(--bg-secondary)]" />
              <div className="h-4 w-3/4 rounded-full bg-[var(--bg-secondary)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Workspace({
  user,
  onSignOut,
  onSessionError,
  theme,
  onThemeToggle,
}: {
  user: WorkspaceUser;
  onSignOut: () => Promise<void>;
  onSessionError: (message: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}) {
  const isDemo = user.mode === 'demo';
  const liveTasks = useTasks(!isDemo);
  const demoTasks = useDemoTasks(isDemo, user.id);
  const taskSource = isDemo ? demoTasks : liveTasks;
  const {
    tasks,
    filter,
    setFilter,
    search,
    setSearch,
    loading,
    loadingMore,
    error,
    counts,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    addNote,
    deleteNote,
    hasNextPage,
    goToNextPage,
  } = taskSource;
  const [showCreate, setShowCreate] = useState(false);
  const [sort, setSort] = useState<TaskSort>('newest');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mobileTab, setMobileTab] = useState<WorkspaceTab>('feed');
  const [menuOpen, setMenuOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const visibleTasks = useMemo(() => sortTasks(tasks, sort), [sort, tasks]);
  const pendingTasks = useMemo(() => visibleTasks.filter((task) => !task.completed), [visibleTasks]);
  const dueTodayCount = useMemo(
    () =>
      pendingTasks.filter((task) => {
        if (!task.dueDate) return false;
        const due = new Date(task.dueDate);
        const now = new Date();
        return due.toDateString() === now.toDateString();
      }).length,
    [pendingTasks],
  );
  const urgentCount = useMemo(
    () => pendingTasks.filter((task) => task.priority === 'high').length,
    [pendingTasks],
  );

  useEffect(() => {
    if (!toasts.length) return;
    const timeout = window.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 3200);
    return () => window.clearTimeout(timeout);
  }, [toasts]);

  useEffect(() => {
    if (expandedTaskId && !visibleTasks.some((task) => task.id === expandedTaskId)) {
      setExpandedTaskId(null);
    }
  }, [expandedTaskId, visibleTasks]);

  useEffect(() => {
    if (!menuOpen) return;

    const closeMenu = () => setMenuOpen(false);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [menuOpen]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void goToNextPage();
        }
      },
      { rootMargin: '280px' },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [goToNextPage, hasNextPage]);

  const pushToast = (toast: ToastMessage) => {
    setToasts((current) => [...current, toast].slice(-3));
  };

  const wrapAction = async <T,>(
    action: () => Promise<T>,
    successMessage: string,
    errorMessage: string,
  ) => {
    try {
      const result = await action();
      pushToast(createToast(successMessage, 'success'));
      return result;
    } catch (err: unknown) {
      const nextError = err as { message?: string };
      const message = nextError.message ?? errorMessage;
      pushToast(createToast(message, 'error'));
      if (message.toLowerCase().includes('authentication')) {
        onSessionError(message);
      }
      throw err;
    }
  };

  const filterCounts: Record<TaskFilter, number> = {
    all: counts.all,
    pending: counts.pending,
    completed: counts.completed,
  };

  const emptyCopy: Record<TaskFilter, { title: string; copy: string }> = {
    all: {
      title: 'Your feed is ready for its first task.',
      copy: 'Create a task to activate the dashboard, trend chart, and today summary.',
    },
    pending: {
      title: 'No active work right now.',
      copy: 'This is a good moment to add the next priority before it becomes scattered.',
    },
    completed: {
      title: 'Completed work will appear here.',
      copy: 'Mark a task done and this lane turns into your lightweight activity archive.',
    },
  };

  const feedContent = (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-[30px] border border-[var(--border)] bg-[var(--surface-secondary)] p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Feed controls
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Action stream
            </h2>
          </div>

          <div className="grid gap-3 xl:min-w-[680px] xl:grid-cols-[minmax(0,1fr)_260px]">
            <Input
              label="Quick find"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search titles, notes, and descriptions"
              icon={<SearchIcon width={16} height={16} />}
              containerClassName="min-w-0"
              theme={theme}
            />

            <label className="grid gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Sort by
              </span>
              <select
                className="min-h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--focus-ring)]"
                value={sort}
                onChange={(event) => setSort(event.target.value as TaskSort)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="priority">Priority</option>
                <option value="due-soon">Due soon</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {([
            ['all', 'All tasks'],
            ['pending', 'In progress'],
            ['completed', 'Completed'],
          ] as const).map(([key, label]) => {
            const active = filter === key;
            return (
              <button
                key={key}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition duration-200',
                  active
                    ? 'border border-[var(--accent)] bg-[var(--accent)] text-[var(--text-inverse)]'
                    : 'bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)]',
                )}
                onClick={() => setFilter(key)}
              >
                <span>{label}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs',
                    active ? 'bg-[var(--accent-soft)] text-[var(--text-inverse)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]',
                  )}
                >
                  {filterCounts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <Card className="rounded-[30px] border-[var(--error-border)] bg-[var(--error-bg)] p-5 text-[var(--error-fg)]">
          <h3 className="text-lg font-semibold">We couldn’t load your feed.</h3>
          <p className="mt-2 text-sm">{error}</p>
        </Card>
      ) : null}

      {!error && loading ? <TaskFeedSkeleton /> : null}

      {!error && !loading && !visibleTasks.length ? (
        <Card className="rounded-[32px] border-dashed border-[var(--border-strong)] bg-[var(--surface-primary)] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--surface-tertiary)] text-[var(--text-muted)]">
            <CalendarDaysIcon width={24} height={24} />
          </div>
          <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {emptyCopy[filter].title}
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--text-secondary)]">
            {emptyCopy[filter].copy}
          </p>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => setShowCreate(true)}>
              <PlusIcon width={16} height={16} />
              Add task
            </Button>
          </div>
        </Card>
      ) : null}

      {!error && !loading && visibleTasks.length ? (
        <div className="space-y-4">
          {visibleTasks.map((task) => (
            <TaskFeedCard
              key={task.id}
              task={task}
              theme={theme}
              expanded={expandedTaskId === task.id}
              onToggleExpand={(taskId) =>
                setExpandedTaskId((current) => (current === taskId ? null : taskId))
              }
              onToggleStatus={(id, completed) =>
                wrapAction(
                  () => toggleTask(id, completed),
                  completed ? 'Task moved back to in progress.' : 'Task completed.',
                  'We couldn’t update that task.',
                )
              }
              onDelete={(id) =>
                wrapAction(() => deleteTask(id), 'Task removed.', 'We couldn’t delete that task.')
              }
              onUpdate={(id, payload) =>
                wrapAction(() => updateTask(id, payload), 'Task updated.', 'We couldn’t save that task.')
              }
              onAddNote={(taskId, payload) =>
                wrapAction(() => addNote(taskId, payload), 'Note added.', 'We couldn’t add that note.')
              }
              onDeleteNote={(taskId, noteId) =>
                wrapAction(
                  () => deleteNote(taskId, noteId),
                  'Note removed.',
                  'We couldn’t remove that note.',
                )
              }
            />
          ))}

          <div ref={loadMoreRef} className="h-4" />

          {loadingMore ? (
            <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-primary)] p-5 text-sm text-[var(--text-secondary)]">
              Loading more feed items...
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const dashboardContent = (
    <InsightsPanel
      tasks={visibleTasks}
      dueTodayCount={dueTodayCount}
      urgentCount={urgentCount}
      onCreateTask={() => setShowCreate(true)}
      onFilterChange={setFilter}
    />
  );

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-primary)_82%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[var(--surface-inverse)] p-2 shadow-[var(--shadow-sm)]">
              <TaskNotesLogoIcon width={42} height={42} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight text-[var(--text-primary)]">
                TaskNotes
              </p>
              <p className="truncate text-sm text-[var(--text-secondary)]">{user.name} workspace</p>
            </div>
          </div>

          <div className="hidden flex-1 lg:block">
            <Input
              label="Quick find"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks, notes, and activity"
              icon={<SearchIcon width={16} height={16} />}
              containerClassName="max-w-xl mx-auto"
              theme={theme}
            />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] p-3 text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuOpen((current) => !current);
                }}
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                <MenuIcon width={18} height={18} />
              </button>

              {menuOpen ? (
                <div
                  className={cn(
                    'absolute right-0 top-[calc(100%+0.75rem)] z-40 min-w-[250px] rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] p-2 shadow-[var(--shadow-lg)]',
                  )}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-secondary)]"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowCreate(true);
                    }}
                  >
                    <PlusIcon width={16} height={16} />
                    Add task
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-secondary)]"
                    onClick={() => {
                      setMenuOpen(false);
                      setFilter('pending');
                    }}
                  >
                    <SlidersIcon width={16} height={16} />
                    Focus active work
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-secondary)]"
                    onClick={() => {
                      setMenuOpen(false);
                      onThemeToggle();
                    }}
                  >
                    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </button>
                  <div className="mx-2 my-2 h-px bg-[var(--border)]" />
                  <div className="rounded-xl px-3 py-2">
                    <div className="flex items-center gap-3">
                      <UserCircleIcon width={18} height={18} className="text-[var(--text-muted)]" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">{user.name}</p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">{user.email ?? 'Local demo user'}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    className={cn(
                      'flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-secondary)]',
                    )}
                    onClick={() => {
                      setMenuOpen(false);
                      void onSignOut();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1900px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex rounded-[24px] border border-[var(--border)] bg-[var(--surface-secondary)] p-1 lg:hidden">
          {(['feed', 'dashboard'] as const).map((tab) => (
            <button
              key={tab}
              className={cn(
                'flex-1 rounded-[20px] px-4 py-3 text-sm font-medium transition duration-200',
                mobileTab === tab ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)]',
              )}
              onClick={() => setMobileTab(tab)}
            >
              {tab === 'feed' ? 'Feed' : 'Dashboard'}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.9fr)_minmax(280px,0.72fr)]">
          <div className={cn(mobileTab !== 'feed' && 'hidden lg:block')}>{feedContent}</div>
          <div className={cn(mobileTab !== 'dashboard' && 'hidden lg:block')}>{dashboardContent}</div>
        </div>
      </div>

      <nav className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-[24px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-primary)_92%,transparent)] px-4 py-3 shadow-[var(--shadow-md)] backdrop-blur lg:hidden">
        <button
          className={cn(
            'flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium',
            mobileTab === 'feed' ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)]',
          )}
          onClick={() => setMobileTab('feed')}
        >
          <SlidersIcon width={16} height={16} />
          Feed
        </button>
        <button
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--text-inverse)] shadow-[var(--shadow-md)]"
          onClick={() => setShowCreate(true)}
          aria-label="Add task"
        >
          <PlusIcon width={18} height={18} />
        </button>
        <button
          className={cn(
            'flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium',
            mobileTab === 'dashboard' ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)]',
          )}
          onClick={() => setMobileTab('dashboard')}
        >
          <CalendarDaysIcon width={16} height={16} />
          Dashboard
        </button>
      </nav>

      {showCreate ? (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          theme={theme}
          onCreate={(payload) =>
            wrapAction(
              () => createTask(payload),
              'Task created successfully.',
              'We couldn’t create that task.',
            )
          }
        />
      ) : null}

      <ToastRegion
        toasts={toasts}
        onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
      />
    </div>
  );
}

export default function App() {
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window === 'undefined') return 'system';
    return (window.localStorage.getItem('tasknotes-theme') as 'light' | 'dark' | 'system' | null) ?? 'system';
  });
  const [session, setSession] = useState<Session | null>(null);
  const [verifiedUser, setVerifiedUser] = useState<AuthUser | null>(null);
  const [demoUser, setDemoUser] = useState<WorkspaceUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [validatingSession, setValidatingSession] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [workspaceUser, setWorkspaceUser] = useState<WorkspaceUser | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem('tasknotes-theme') as 'light' | 'dark' | 'system' | null;
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyPreference = () => {
      setTheme(themePreference === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : themePreference);
    };

    applyPreference();

    const handleChange = () => {
      if (themePreference === 'system') {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    window.localStorage.setItem('tasknotes-theme', themePreference);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [themePreference]);

  const handleThemeToggle = () => {
    setThemePreference((current) => {
      const resolved = current === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : current;
      return resolved === 'dark' ? 'light' : 'dark';
    });
  };

  const resetDemoMode = () => {
    clearDemoUser();
    setDemoUser(null);
  };

  useEffect(() => {
    const initialDemoUser = readDemoUser();
    if (initialDemoUser) setDemoUser(initialDemoUser);

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setApiAuthToken(data.session?.access_token ?? null);
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession) {
        resetDemoMode();
      }
      setSession(nextSession);
      setApiAuthToken(nextSession?.access_token ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!session) {
      setVerifiedUser(null);
      setValidatingSession(false);
      return;
    }

    let cancelled = false;

    const verify = async () => {
      setValidatingSession(true);
      try {
        const me = await authApi.getMe();
        if (cancelled) return;
        setVerifiedUser(me);
        resetDemoMode();
      } catch (error) {
        if (cancelled) return;
        setVerifiedUser(null);
        setToasts((current) => [
          ...current,
          createToast('Your session expired. Please sign in again.', 'error'),
        ]);
        await supabase.auth.signOut();
        setSession(null);
        setApiAuthToken(null);
      } finally {
        if (!cancelled) {
          setValidatingSession(false);
        }
      }
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [authReady, session]);

  useEffect(() => {
    const nextUser = getWorkspaceUser(session, verifiedUser) ?? demoUser;
    setWorkspaceUser(nextUser);
    setNeedsOnboarding(nextUser ? !readOnboardingState(nextUser.id) : false);
  }, [demoUser, session, verifiedUser]);

  useEffect(() => {
    if (!toasts.length) return;
    const timeout = window.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 3200);
    return () => window.clearTimeout(timeout);
  }, [toasts]);

  const handleDemoAccess = async () => {
    await supabase.auth.signOut();
    const nextUser = enableDemoUser();
    setDemoUser(nextUser);
    setSession(null);
    setVerifiedUser(null);
    setApiAuthToken(null);
  };

  const handleSignOut = async () => {
    if (demoUser) {
      resetDemoMode();
    }

    await supabase.auth.signOut();
    setSession(null);
    setVerifiedUser(null);
    setWorkspaceUser(null);
  };

  if (!authReady || validatingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent px-4">
        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface-primary)] px-6 py-5 text-sm text-[var(--text-secondary)] shadow-[var(--shadow-md)]">
          Loading workspace...
        </div>
      </div>
    );
  }

  if (!workspaceUser) {
    return (
      <>
        <AuthScreen
          onAuthenticated={() => undefined}
          onDemoAccess={handleDemoAccess}
          theme={theme}
          onThemeToggle={handleThemeToggle}
        />
        <ToastRegion
          toasts={toasts}
          onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
        />
      </>
    );
  }

  if (needsOnboarding) {
    return (
      <OnboardingScreen
        user={workspaceUser}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onComplete={({ name }) => {
          const nextUser = { ...workspaceUser, name };
          setWorkspaceUser(nextUser);
          if (nextUser.mode === 'demo') {
            setDemoUser(nextUser);
            window.localStorage.setItem('tasknotes-demo-user', JSON.stringify(nextUser));
          }
          writeOnboardingState(nextUser.id);
          setNeedsOnboarding(false);
        }}
      />
    );
  }

  return (
    <Workspace
      user={workspaceUser}
      onSignOut={handleSignOut}
      theme={theme}
      onThemeToggle={handleThemeToggle}
      onSessionError={(message) =>
        setToasts((current) => [...current, createToast(message, 'error')].slice(-3))
      }
    />
  );
}
