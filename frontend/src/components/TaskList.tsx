import { Task, TaskFilter } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
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
  onCreate: () => void;
}

function SkeletonCard() {
  return (
    <Card className="task-card skeleton-card">
      <div className="skeleton-circle" />
      <div className="skeleton-stack">
        <div className="skeleton-line skeleton-line-sm" />
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-line-lg" />
      </div>
    </Card>
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
  onCreate,
}: TaskListProps) {
  if (error) {
    return (
      <Card className="state-card">
        <h3>We couldn’t load your tasks.</h3>
        <p>{error}</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="task-list">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (!tasks.length) {
    const messages: Record<TaskFilter, { title: string; copy: string }> = {
      all: {
        title: 'Your workspace is ready for its first task.',
        copy: 'Capture the next thing that matters so the dashboard can start working for you.',
      },
      pending: {
        title: 'Nothing is waiting on you right now.',
        copy: 'This is a great moment to add the next priority before it slips out of view.',
      },
      completed: {
        title: 'No completed tasks yet.',
        copy: 'As you finish work, completed items will show up here for quick review.',
      },
    };

    return (
      <Card className="state-card empty-card">
        <div className="empty-illustration" />
        <h3>{messages[filter].title}</h3>
        <p>{messages[filter].copy}</p>
        <Button onClick={onCreate}>Add task</Button>
      </Card>
    );
  }

  return (
    <>
      <div className="task-list">
        {tasks.map((task, index) => (
          <TaskCard key={task.id} task={task} index={index} onToggle={onToggle} onDelete={onDelete} onClick={onOpen} />
        ))}
      </div>

      <div className="pagination-bar">
        <Button variant="ghost" onClick={onPreviousPage} disabled={!hasPreviousPage}>
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button variant="ghost" onClick={onNextPage} disabled={!hasNextPage}>
          Next
        </Button>
      </div>
    </>
  );
}
