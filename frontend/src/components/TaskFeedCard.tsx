import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { CreateNotePayload, Task, TaskPriority, UpdateTaskPayload } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ChevronDownIcon, ClockIcon } from './ui/Icons';
import { Input, Textarea } from './ui/Input';
import { cn } from '../lib/cn';

interface TaskFeedCardProps {
  task: Task;
  expanded: boolean;
  onToggleExpand: (taskId: string) => void;
  onToggleStatus: (id: string, completed: boolean) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  onUpdate: (id: string, payload: UpdateTaskPayload) => Promise<unknown>;
  onAddNote: (taskId: string, payload: CreateNotePayload) => Promise<unknown>;
  onDeleteNote: (taskId: string, noteId: string) => Promise<unknown>;
}

function formatDate(value: string | null) {
  if (!value) return 'No due date';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
}

function formatRelativeDate(value: string) {
  const diffDays = Math.round((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(diffDays, 'day');
}

const priorityTheme: Record<TaskPriority, string> = {
  high: 'bg-[var(--error-bg)] text-[var(--error-fg)] ring-1 ring-[var(--error-border)]',
  medium: 'bg-[var(--warning-bg)] text-[var(--warning-fg)] ring-1 ring-[var(--warning-border)]',
  low: 'bg-[var(--success-bg)] text-[var(--success-fg)] ring-1 ring-[var(--success-border)]',
};

export function TaskFeedCard({
  task,
  expanded,
  onToggleExpand,
  onToggleStatus,
  onDelete,
  onUpdate,
  onAddNote,
  onDeleteNote,
}: TaskFeedCardProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : '');
  const [noteContent, setNoteContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setPriority(task.priority);
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
  }, [task]);

  useEffect(() => {
    if (expanded) {
      window.setTimeout(() => titleRef.current?.focus(), 60);
    }
  }, [expanded]);

  const handleOpenWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggleExpand(task.id);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate ? new Date(`${dueDate}T12:00:00`).toISOString() : null,
      });
    } catch (err: unknown) {
      const nextError = err as { message?: string };
      setError(nextError.message ?? 'We couldn’t save your task.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    setAddingNote(true);
    setError(null);
    try {
      await onAddNote(task.id, { content: noteContent.trim() });
      setNoteContent('');
    } catch (err: unknown) {
      const nextError = err as { message?: string };
      setError(nextError.message ?? 'We couldn’t add that note.');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card
      className={cn(
        'group rounded-[30px] border border-[var(--border)] bg-[var(--surface-primary)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]',
        task.completed && 'border-[var(--success-border)] bg-[var(--success-bg)]/40',
      )}
    >
      <div
        className="cursor-pointer outline-none"
        role="button"
        tabIndex={0}
        onClick={() => onToggleExpand(task.id)}
        onKeyDown={handleOpenWithKeyboard}
      >
        <div className="flex items-start gap-4">
          <button
            className={cn(
              'mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border transition',
              task.completed
                ? 'border-[var(--success-border)] bg-[var(--success-fg)] text-[var(--text-inverse)]'
                : 'border-[var(--border-strong)] bg-[var(--surface-primary)] text-transparent hover:border-[var(--text-secondary)]',
            )}
            onClick={(event) => {
              event.stopPropagation();
              void onToggleStatus(task.id, task.completed);
            }}
            aria-label={task.completed ? 'Mark task as pending' : 'Mark task as completed'}
          >
            ✓
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]', priorityTheme[task.priority])}>
                {task.priority}
              </span>
              <span className="rounded-full bg-[var(--surface-secondary)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                {task.completed ? 'Done' : 'In progress'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-secondary)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">
                <ClockIcon width={13} height={13} />
                {formatDate(task.dueDate)}
              </span>
            </div>

            <div className="mt-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)] sm:text-[1.45rem] sm:leading-[1.2]">
                  {task.title}
                </h3>
                <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                  {task.description || 'Add context, handoff notes, or success criteria inside this card.'}
                </p>
              </div>

              <button
                className={cn(
                  'rounded-full bg-[var(--surface-secondary)] p-2 text-[var(--text-secondary)] transition group-hover:bg-[var(--surface-inverse)] group-hover:text-[var(--text-inverse)]',
                  expanded && 'rotate-180',
                )}
                aria-label={expanded ? 'Collapse task' : 'Expand task'}
              >
                <ChevronDownIcon width={16} height={16} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
              <span>Updated {formatRelativeDate(task.updatedAt)}</span>
              <span>{task.notes.length} notes</span>
            </div>
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="mt-5 grid gap-5 border-t border-[var(--border)] pt-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4">
            {error ? (
              <div className="rounded-2xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error-fg)]">
                {error}
              </div>
            ) : null}

            <Input
              ref={titleRef}
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task title"
            />
            <Textarea
              label="Description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add more context or acceptance criteria."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  Priority
                </span>
                <select
                  className="min-h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--focus-ring)]"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as TaskPriority)}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>

              <Input
                label="Due date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant={task.completed ? 'secondary' : 'primary'}
                onClick={() => void onToggleStatus(task.id, task.completed)}
              >
                {task.completed ? 'Mark as active' : 'Mark complete'}
              </Button>
              <Button variant="secondary" onClick={() => void handleSave()} disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
              <Button variant="danger" onClick={() => void handleDelete()} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-secondary)] p-4">
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Notes</p>
              <h4 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{task.notes.length} saved updates</h4>
            </div>

            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {task.notes.length ? (
                task.notes.map((note) => (
                  <div key={note.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] p-3 shadow-[var(--shadow-sm)]">
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{note.content}</p>
                    <button
                      className="mt-2 text-xs font-medium text-[var(--error-fg)] transition hover:opacity-80"
                      onClick={() => void onDeleteNote(task.id, note.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-primary)] px-4 py-6 text-sm text-[var(--text-secondary)]">
                  Add quick notes for decisions, blockers, or handoff context.
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3">
              <Textarea
                label="Add note"
                rows={3}
                value={noteContent}
                onChange={(event) => setNoteContent(event.target.value)}
                placeholder="Write a short update."
              />
              <Button variant="secondary" onClick={() => void handleAddNote()} disabled={addingNote || !noteContent.trim()}>
                {addingNote ? 'Adding...' : 'Add note'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
