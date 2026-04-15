import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Task } from './types';
import { supabase } from './lib/supabase';
import { setApiAuthToken } from './api/client';
import { useTasks } from './hooks/useTasks';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { TaskList } from './components/TaskList';
import { CreateTaskModal } from './components/CreateTaskModal';
import { TaskModal } from './components/TaskModal';
import './index.css';

function TaskWorkspace({ session }: { session: Session }) {
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
    createTask, updateTask, deleteTask, toggleTask,
    addNote, deleteNote,
  } = useTasks();

  const [showCreate, setShowCreate] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  // Keep activeTask in sync with updated task list
  const syncedActiveTask = activeTask
    ? tasks.find(t => t.id === activeTask.id) ?? null
    : null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setActiveTask(null);
    setShowCreate(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header
        onNewTask={() => setShowCreate(true)}
        userEmail={session.user.email ?? null}
        onSignOut={handleSignOut}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 80 }}>
        <FilterBar
          filter={filter}
          counts={counts}
          onChange={setFilter}
          search={search}
          onSearchChange={setSearch}
        />
        <TaskList
          tasks={tasks}
          filter={filter}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onNextPage={goToNextPage}
          onPreviousPage={goToPreviousPage}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onOpen={setActiveTask}
        />
      </main>

      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onCreate={createTask}
        />
      )}

      {syncedActiveTask && (
        <TaskModal
          task={syncedActiveTask}
          onClose={() => setActiveTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onAddNote={addNote}
          onDeleteNote={deleteNote}
        />
      )}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

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

  if (!authReady) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Loading session…</div>;
  }

  if (!session) {
    return <AuthScreen onAuthenticated={() => undefined} />;
  }

  return <TaskWorkspace session={session} />;
}
