import { useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { setApiAuthToken } from './api/client';
import { useTasks } from './hooks/useTasks';
import { useDemoTasks } from './hooks/useDemoTasks';
import {
  clearDemoUser,
  enableDemoUser,
  readDemoUser,
  readOnboardingState,
  writeOnboardingState,
} from './lib/demo';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { FilterBar } from './components/FilterBar';
import { TaskList } from './components/TaskList';
import { CreateTaskModal } from './components/CreateTaskModal';
import { TaskModal } from './components/TaskModal';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { ToastMessage, ToastRegion } from './components/ui/ToastRegion';
import {
  MenuIcon,
  MoonIcon,
  PlusIcon,
  ShieldIcon,
  SparkIcon,
  SunIcon,
} from './components/ui/Icons';
import { Task, TaskSort, WorkspaceUser } from './types';
import './index.css';

type AppTheme = 'light' | 'dark';
type NavSection = 'dashboard' | 'tasks' | 'settings';

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

function getWorkspaceUser(session: Session | null): WorkspaceUser | null {
  if (!session) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.email?.split('@')[0] ?? 'Teammate',
    mode: 'live',
  };
}

function Workspace({
  user,
  theme,
  onThemeToggle,
  onSignOut,
}: {
  user: WorkspaceUser;
  theme: AppTheme;
  onThemeToggle: () => void;
  onSignOut: () => Promise<void>;
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
    page,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    loading,
    error,
    counts,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    addNote,
    deleteNote,
  } = taskSource;

  const [showCreate, setShowCreate] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [sort, setSort] = useState<TaskSort>('newest');
  const [section, setSection] = useState<NavSection>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const sortedTasks = useMemo(() => sortTasks(tasks, sort), [sort, tasks]);
  const syncedActiveTask = activeTask ? sortedTasks.find((task) => task.id === activeTask.id) ?? null : null;
  const pendingTasks = useMemo(() => sortedTasks.filter((task) => !task.completed), [sortedTasks]);
  const completedTasks = useMemo(() => sortedTasks.filter((task) => task.completed), [sortedTasks]);
  const dueSoonCount = useMemo(
    () =>
      pendingTasks.filter((task) => {
        if (!task.dueDate) return false;
        const diff = new Date(task.dueDate).getTime() - Date.now();
        return diff <= 1000 * 60 * 60 * 24 * 3;
      }).length,
    [pendingTasks],
  );

  useEffect(() => {
    if (!toasts.length) return;
    const timeout = window.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 3200);
    return () => window.clearTimeout(timeout);
  }, [toasts]);

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
      pushToast(createToast(nextError.message ?? errorMessage, 'error'));
      throw err;
    }
  };

  const navigation = [
    { id: 'dashboard' as const, label: 'Dashboard', helper: 'Overview and activity' },
    { id: 'tasks' as const, label: 'Tasks', helper: 'Plan and execute' },
    { id: 'settings' as const, label: 'Settings', helper: 'Theme and access' },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark">
            <SparkIcon width={20} height={20} />
          </div>
          <div>
            <p className="brand-name">TaskNotes</p>
            <p className="brand-subtitle">2026 workspace</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Workspace navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${section === item.id ? 'nav-item-active' : ''}`}
              onClick={() => {
                setSection(item.id);
                setMobileNavOpen(false);
              }}
            >
              <span>{item.label}</span>
              <small>{item.helper}</small>
            </button>
          ))}
        </nav>

        <Card className="sidebar-card">
          <div className="secure-badge secure-badge-inline">
            <ShieldIcon width={16} height={16} />
            <span>{isDemo ? 'Demo workspace' : 'Secure workspace'}</span>
          </div>
          <p className="sidebar-card-copy">
            {isDemo
              ? 'Seeded data is loaded locally so you can review the full product flow without auth friction.'
              : 'Your tasks stay scoped to the signed-in user with protected backend routes.'}
          </p>
        </Card>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-action topbar-menu" onClick={() => setMobileNavOpen((current) => !current)} aria-label="Toggle navigation">
              <MenuIcon width={18} height={18} />
            </button>
            <div>
              <p className="breadcrumb">Workspace / {section}</p>
              <h1>{section === 'dashboard' ? 'Dashboard' : section === 'tasks' ? 'Task center' : 'Settings'}</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <button className="theme-toggle" onClick={onThemeToggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <SunIcon width={16} height={16} /> : <MoonIcon width={16} height={16} />}
            </button>
            <Button variant="secondary" onClick={onSignOut}>
              Sign out
            </Button>
            <Button onClick={() => setShowCreate(true)}>
              <PlusIcon width={16} height={16} />
              Add task
            </Button>
          </div>
        </header>

        <main className="workspace-main">
          {section === 'dashboard' ? (
            <section className="dashboard-grid">
              <Card elevated className="hero-card">
                <p className="eyebrow">Today at a glance</p>
                <h2>{user.name}, your workspace is set up to keep momentum high.</h2>
                <p className="hero-copy">
                  {counts.pending
                    ? `${counts.pending} active tasks are in flight, with ${dueSoonCount} due soon.`
                    : 'You’re caught up. Capture the next priority before it becomes background noise.'}
                </p>
                <div className="hero-actions">
                  <Button onClick={() => setSection('tasks')}>Review tasks</Button>
                  <Button variant="ghost" onClick={() => setShowCreate(true)}>
                    Capture new work
                  </Button>
                </div>
              </Card>

              <div className="summary-grid">
                <Card className="summary-card">
                  <p className="summary-label">Total tasks</p>
                  <strong>{counts.all}</strong>
                  <span>Across your current workspace</span>
                </Card>
                <Card className="summary-card">
                  <p className="summary-label">In progress</p>
                  <strong>{counts.pending}</strong>
                  <span>Open items needing attention</span>
                </Card>
                <Card className="summary-card">
                  <p className="summary-label">Completed</p>
                  <strong>{counts.completed}</strong>
                  <span>Finished and ready for review</span>
                </Card>
                <Card className="summary-card">
                  <p className="summary-label">Due soon</p>
                  <strong>{dueSoonCount}</strong>
                  <span>Due within the next 3 days</span>
                </Card>
              </div>

              <Card className="activity-card">
                <div className="section-header">
                  <div>
                    <p className="eyebrow">Recent activity</p>
                    <h3>Priority queue</h3>
                  </div>
                </div>
                <div className="activity-list">
                  {pendingTasks.slice(0, 4).map((task) => (
                    <button key={task.id} className="activity-item" onClick={() => setActiveTask(task)}>
                      <span className={`priority-dot priority-${task.priority}`} />
                      <div>
                        <strong>{task.title}</strong>
                        <p>{task.description || 'No extra detail yet.'}</p>
                      </div>
                    </button>
                  ))}
                  {!pendingTasks.length ? <p className="muted-copy">No pending tasks right now.</p> : null}
                </div>
              </Card>

              <Card className="activity-card">
                <div className="section-header">
                  <div>
                    <p className="eyebrow">Recent wins</p>
                    <h3>Completed work</h3>
                  </div>
                </div>
                <div className="activity-list">
                  {completedTasks.slice(0, 4).map((task) => (
                    <div key={task.id} className="activity-item activity-item-static">
                      <span className="priority-dot priority-complete" />
                      <div>
                        <strong>{task.title}</strong>
                        <p>Updated {new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  ))}
                  {!completedTasks.length ? <p className="muted-copy">Completed tasks will show up here.</p> : null}
                </div>
              </Card>
            </section>
          ) : null}

          {section === 'tasks' ? (
            <section className="tasks-section">
              <Card className="section-card">
                <div className="section-header">
                  <div>
                    <p className="eyebrow">Core workflow</p>
                    <h2>Plan, prioritize, and complete work without losing context.</h2>
                  </div>
                  <Button onClick={() => setShowCreate(true)}>
                    <PlusIcon width={16} height={16} />
                    Add task
                  </Button>
                </div>

                <FilterBar
                  filter={filter}
                  counts={counts}
                  onChange={setFilter}
                  search={search}
                  onSearchChange={setSearch}
                  sort={sort}
                  onSortChange={setSort}
                />

                <TaskList
                  tasks={sortedTasks}
                  filter={filter}
                  loading={loading}
                  error={error}
                  page={page}
                  totalPages={totalPages}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                  onNextPage={goToNextPage}
                  onPreviousPage={goToPreviousPage}
                  onToggle={(id, completed) =>
                    wrapAction(() => toggleTask(id, completed), completed ? 'Task moved back to in progress.' : 'Task completed.', 'We couldn’t update that task.')
                  }
                  onDelete={(id) => wrapAction(() => deleteTask(id), 'Task removed.', 'We couldn’t delete that task.')}
                  onOpen={setActiveTask}
                  onCreate={() => setShowCreate(true)}
                />
              </Card>
            </section>
          ) : null}

          {section === 'settings' ? (
            <section className="settings-grid">
              <Card className="settings-card">
                <p className="eyebrow">Profile</p>
                <h2>{user.name}</h2>
                <p className="muted-copy">{user.email ?? 'Local demo user'}</p>
              </Card>
              <Card className="settings-card">
                <p className="eyebrow">Theme</p>
                <h2>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</h2>
                <p className="muted-copy">Accessible contrast, visible focus states, and consistent elevation across the app shell.</p>
                <Button variant="secondary" onClick={onThemeToggle}>
                  Switch theme
                </Button>
              </Card>
              <Card className="settings-card">
                <p className="eyebrow">Access</p>
                <h2>{isDemo ? 'Demo mode is active' : 'Live Supabase session'}</h2>
                <p className="muted-copy">
                  {isDemo
                    ? 'You can keep editing local seeded tasks or sign out to try real authentication again.'
                    : 'Auth and API requests are using the signed-in Supabase session.'}
                </p>
              </Card>
            </section>
          ) : null}
        </main>
      </div>

      {showCreate ? (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onCreate={(payload) => wrapAction(() => createTask(payload), 'Task created successfully.', 'We couldn’t create that task.')}
        />
      ) : null}

      {syncedActiveTask ? (
        <TaskModal
          task={syncedActiveTask}
          onClose={() => setActiveTask(null)}
          onUpdate={(id, payload) => wrapAction(() => updateTask(id, payload), 'Task updated.', 'We couldn’t save that task.')}
          onDelete={(id) => wrapAction(() => deleteTask(id), 'Task deleted.', 'We couldn’t delete that task.')}
          onAddNote={(taskId, payload) => wrapAction(() => addNote(taskId, payload), 'Note added.', 'We couldn’t add that note.')}
          onDeleteNote={(taskId, noteId) => wrapAction(() => deleteNote(taskId, noteId), 'Note removed.', 'We couldn’t remove that note.')}
        />
      ) : null}

      <ToastRegion toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [demoUser, setDemoUser] = useState<WorkspaceUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [theme, setTheme] = useState<AppTheme>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (window.localStorage.getItem('tasknotes-theme') as AppTheme | null) ?? 'dark';
  });
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [workspaceUser, setWorkspaceUser] = useState<WorkspaceUser | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('tasknotes-theme', theme);
  }, [theme]);

  useEffect(() => {
    let mounted = true;

    const initialDemoUser = readDemoUser();
    if (initialDemoUser) setDemoUser(initialDemoUser);

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setApiAuthToken(data.session?.access_token ?? null);
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setApiAuthToken(nextSession?.access_token ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const nextUser = demoUser ?? getWorkspaceUser(session);
    setWorkspaceUser(nextUser);
    setNeedsOnboarding(nextUser ? !readOnboardingState(nextUser.id) : false);
  }, [demoUser, session]);

  const handleDemoAccess = () => {
    const nextUser = enableDemoUser();
    setDemoUser(nextUser);
    setSession(null);
    setApiAuthToken(null);
  };

  const handleSignOut = async () => {
    if (demoUser) {
      clearDemoUser();
      setDemoUser(null);
    }

    await supabase.auth.signOut();
    setSession(null);
    setWorkspaceUser(null);
  };

  if (!authReady) {
    return <div className="boot-screen">Loading workspace...</div>;
  }

  if (!workspaceUser) {
    return <AuthScreen onAuthenticated={() => undefined} onDemoAccess={handleDemoAccess} />;
  }

  if (needsOnboarding) {
    return (
      <OnboardingScreen
        user={workspaceUser}
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
      theme={theme}
      onThemeToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      onSignOut={handleSignOut}
    />
  );
}
