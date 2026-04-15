import { Task } from '../types';
import { Card } from './ui/Card';

interface TaskCardProps {
  task: Task;
  index: number;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onClick: (task: Task) => void;
}

function formatDate(value: string | null) {
  if (!value) return 'No due date';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function TaskCard({ task, index, onToggle, onDelete, onClick }: TaskCardProps) {
  return (
    <Card
      className={`task-card ${task.completed ? 'task-card-complete' : ''}`}
      style={{ animationDelay: `${index * 45}ms` }}
      onClick={() => onClick(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(task);
        }
      }}
    >
      <button
        className={`check-toggle ${task.completed ? 'check-toggle-active' : ''}`}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(task.id, task.completed);
        }}
        aria-label={task.completed ? 'Mark task as pending' : 'Mark task as completed'}
      >
        <span className="check-toggle-mark" />
      </button>

      <div className="task-card-main">
        <div className="task-card-head">
          <div>
            <div className="task-meta-row">
              <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
              {task.dueDate ? <span className="meta-chip">Due {formatDate(task.dueDate)}</span> : <span className="meta-chip meta-chip-muted">No deadline</span>}
              {task.notes.length ? <span className="meta-chip">{task.notes.length} notes</span> : null}
            </div>
            <h3>{task.title}</h3>
          </div>
          <button
            className="icon-action icon-danger"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(task.id);
            }}
            aria-label={`Delete ${task.title}`}
          >
            ×
          </button>
        </div>

        <p className="task-card-copy">{task.description || 'Add context, owner notes, or handoff details inside the task panel.'}</p>

        <div className="task-card-footer">
          <span>Created {formatDate(task.createdAt)}</span>
          <span>Updated {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(Math.round((new Date(task.updatedAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)), 'day')}</span>
        </div>
      </div>
    </Card>
  );
}
