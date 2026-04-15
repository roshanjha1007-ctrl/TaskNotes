import { useEffect, useRef, useState } from 'react';
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

  const handleSubmit = async () => {
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
    <div className="modal-backdrop" onClick={onClose}>
      <Card elevated className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">New task</p>
            <h2>Create a task with enough detail to be actionable.</h2>
          </div>
          <button className="icon-action" onClick={onClose} aria-label="Close create task modal">
            ×
          </button>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="modal-content">
          <Input ref={inputRef} label="Title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to happen next?" />
          <Textarea label="Description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Add the why, context, handoff notes, or success criteria." />

          <div className="form-grid">
            <label className="field">
              <span className="field-label">Priority</span>
              <span className="field-control">
                <select className="field-input select-input" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </span>
            </label>

            <Input label="Due date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Creating...' : 'Create task'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
