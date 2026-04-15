import { useEffect, useState } from 'react';
import { CreateNotePayload, Task, TaskPriority, UpdateTaskPayload } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input, Textarea } from './ui/Input';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, payload: UpdateTaskPayload) => Promise<Task>;
  onDelete: (id: string) => Promise<void>;
  onAddNote: (taskId: string, payload: CreateNotePayload) => Promise<unknown>;
  onDeleteNote: (taskId: string, noteId: string) => Promise<void>;
}

export function TaskModal({ task, onClose, onUpdate, onDelete, onAddNote, onDeleteNote }: TaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : '');
  const [noteContent, setNoteContent] = useState('');
  const [savingTask, setSavingTask] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setPriority(task.priority);
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
  }, [task]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const saveTask = async () => {
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setSavingTask(true);
    setError('');

    try {
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate ? new Date(`${dueDate}T12:00:00`).toISOString() : null,
      });
    } catch (err: unknown) {
      const nextError = err as { message?: string };
      setError(nextError.message ?? 'We couldn’t save your changes.');
    } finally {
      setSavingTask(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    setAddingNote(true);
    setError('');
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
    if (!window.confirm('Delete this task and all of its notes?')) return;

    setDeleting(true);
    try {
      await onDelete(task.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleCompletion = async () => {
    setError('');
    try {
      await onUpdate(task.id, { completed: !task.completed });
    } catch (err: unknown) {
      const nextError = err as { message?: string };
      setError(nextError.message ?? 'We couldn’t update the task status.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setError('');
    try {
      await onDeleteNote(task.id, noteId);
    } catch (err: unknown) {
      const nextError = err as { message?: string };
      setError(nextError.message ?? 'We couldn’t remove that note.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <Card elevated className="modal-card modal-card-wide" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Task details</p>
            <h2>{task.completed ? 'Completed task review' : 'Keep this task ready for action'}</h2>
          </div>
          <button className="icon-action" onClick={onClose} aria-label="Close task details">
            ×
          </button>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="modal-content">
          <div className="task-modal-layout">
            <div className="task-modal-main">
              <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
              <Textarea label="Description" value={description} onChange={(event) => setDescription(event.target.value)} rows={5} placeholder="Add more context, decisions, and handoff details." />

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

              <div className="inline-actions">
                <Button
                  variant={task.completed ? 'secondary' : 'ghost'}
                  onClick={handleToggleCompletion}
                >
                  {task.completed ? 'Mark as pending' : 'Mark as complete'}
                </Button>
                <Button onClick={saveTask} disabled={savingTask}>
                  {savingTask ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </div>

            <aside className="task-modal-side">
              <div className="note-header">
                <div>
                  <p className="eyebrow">Notes</p>
                  <h3>{task.notes.length} saved</h3>
                </div>
              </div>

              <div className="note-list">
                {task.notes.length ? (
                  task.notes.map((note) => (
                    <div key={note.id} className="note-card">
                      <p>{note.content}</p>
                      <button className="text-link text-link-danger" onClick={() => handleDeleteNote(note.id)}>
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="note-empty">Capture decisions, meeting notes, or reminders here.</div>
                )}
              </div>

              <Textarea
                label="Add note"
                value={noteContent}
                onChange={(event) => setNoteContent(event.target.value)}
                rows={4}
                placeholder="Write a short update or context note."
              />
              <Button onClick={handleAddNote} disabled={addingNote || !noteContent.trim()}>
                {addingNote ? 'Adding...' : 'Add note'}
              </Button>
            </aside>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete task'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
