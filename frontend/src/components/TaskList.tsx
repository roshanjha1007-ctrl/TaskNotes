import { Task, TaskFilter } from '../types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onOpen: (task: Task) => void;
}

function Skeleton() {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 18px',
      display: 'flex', gap: 14,
    }}>
      {[20, 'flex'].map((w, i) => (
        <div key={i} style={{
          width: typeof w === 'number' ? w : undefined,
          flex: typeof w === 'string' ? 1 : undefined,
          height: 20,
          borderRadius: 6,
          background: 'linear-gradient(90deg, var(--surface2) 25%, var(--border) 50%, var(--surface2) 75%)',
          backgroundSize: '400px 100%',
          animation: 'shimmer 1.5s infinite',
        }} />
      ))}
    </div>
  );
}

export function TaskList({
  tasks,
  filter,
  loading,
  error,
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  onToggle,
  onDelete,
  onOpen,
}: TaskListProps) {
  if (error) {
    return (
      <div style={{
        margin: '32px 24px',
        padding: 20,
        background: 'rgba(245,101,101,.08)',
        border: '1px solid rgba(245,101,101,.2)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--red)',
        fontSize: 14,
        textAlign: 'center',
      }}>
        ⚠️ {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }

  if (tasks.length === 0) {
    const msgs: Record<TaskFilter, string> = {
      all: 'No tasks yet — create your first one!',
      pending: 'No pending tasks. You\'re all caught up! 🎉',
      completed: 'No completed tasks yet.',
    };
    return (
      <div style={{
        margin: '64px 24px',
        textAlign: 'center',
        color: 'var(--text3)',
        fontSize: 15,
      }}>
        {msgs[filter]}
      </div>
    );
  }

  return (
    <>
      <div style={{
        padding: '16px 24px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {tasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            index={i}
            onToggle={onToggle}
            onDelete={onDelete}
            onClick={onOpen}
          />
        ))}
      </div>
      <div style={{ padding: '0 24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text2)', fontSize: 13 }}>
        <button
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          style={{ padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', color: hasPreviousPage ? 'var(--text)' : 'var(--text3)' }}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          onClick={onNextPage}
          disabled={!hasNextPage}
          style={{ padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', color: hasNextPage ? 'var(--text)' : 'var(--text3)' }}
        >
          Next
        </button>
      </div>
    </>
  );
}
