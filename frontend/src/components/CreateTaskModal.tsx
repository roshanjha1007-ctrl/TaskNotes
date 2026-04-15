import { FormEvent, useEffect, useRef, useState } from 'react';
import { CreateTaskPayload, TaskPriority } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input, Textarea } from './ui/Input';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreate: (payload: CreateTaskPayload) => Promise<unknown>;
}

export function CreateTaskModal({ onClose, onCreate }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!title.trim()) {
      setError('A task title helps your workspace stay scannable.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate ? new Date(`${dueDate}T12:00:00`).toISOString() : null,
      });
      onClose();
    } catch (err: unknown) {
      const nextError = err as { message?: string };
      setError(nextError.message ?? 'We couldn’t create that task.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--backdrop)] p-4 backdrop-blur-sm" onClick={onClose}>
      <Card
        elevated
        className="w-full max-w-2xl rounded-[32px] p-6 sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--text-muted)]">New task</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Capture work with enough detail to act on it.
            </h2>
          </div>
          <button className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]" onClick={onClose} aria-label="Close create task modal">
            ×
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error-fg)]">
            {error}
          </div>
        ) : null}

        <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
          <Input
            ref={inputRef}
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What should happen next?"
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Add context, owner notes, or success criteria."
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

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button onClick={() => void handleSubmit()} disabled={saving} type="submit">
              {saving ? 'Creating...' : 'Create task'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
