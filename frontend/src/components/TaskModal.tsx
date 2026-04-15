import React, { useState, useEffect } from 'react';
import { Task, UpdateTaskPayload, CreateNotePayload } from '../types';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, payload: UpdateTaskPayload) => Promise<Task>;
  onDelete: (id: string) => Promise<void>;
  onAddNote: (taskId: string, payload: CreateNotePayload) => Promise<unknown>;
  onDeleteNote: (taskId: string, noteId: string) => Promise<void>;
}

export function TaskModal({ task, onClose, onUpdate, onDelete, onAddNote, onDeleteNote }: TaskModalProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [noteContent, setNoteContent] = useState('');
  const [savingTask, setSavingTask] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Sync when task prop updates (from parent state)
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? '');
  }, [task]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { editing ? setEditing(false) : onClose(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing, onClose]);

  const saveTask = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    setSavingTask(true); setError('');
    try {
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setEditing(false);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message ?? 'Failed to save.');
    } finally { setSavingTask(false); }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    setAddingNote(true);
    try {
      await onAddNote(task.id, { content: noteContent.trim() });
      setNoteContent('');
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message ?? 'Failed to add note.');
    } finally { setAddingNote(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task and all its notes?')) return;
    setDeleting(true);
    try { await onDelete(task.id); onClose(); }
    finally { setDeleting(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px',
    background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)',
    fontSize: 14, fontFamily: 'var(--font)',
    outline: 'none',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 600, maxHeight: '90vh',
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex', flexDirection: 'column',
          animation: 'fadeIn .2s ease both',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <button
            onClick={() => onUpdate(task.id, { completed: !task.completed })}
            style={{
              flexShrink: 0, marginTop: 3,
              width: 22, height: 22,
              border: `2px solid ${task.completed ? 'var(--green)' : 'var(--border2)'}`,
              borderRadius: 6,
              background: task.completed ? 'var(--green)' : 'transparent',
              color: '#fff', fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s',
            }}
          >
            {task.completed && '✓'}
          </button>

          <div style={{ flex: 1 }}>
            {editing ? (
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ ...inputStyle, fontSize: 18, fontWeight: 700 }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            ) : (
              <h2
                style={{
                  fontSize: 18, fontWeight: 700,
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'var(--text3)' : 'var(--text)',
                  cursor: 'text',
                }}
                onClick={() => setEditing(true)}
                title="Click to edit"
              >
                {task.title}
              </h2>
            )}
            <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
              Created {new Date(task.createdAt).toLocaleString()}
            </p>
          </div>

          <button onClick={onClose} style={{
            flexShrink: 0, width: 28, height: 28,
            border: '1px solid var(--border)', borderRadius: 8,
            background: 'transparent', color: 'var(--text2)', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {error && (
            <p style={{ padding: '8px 12px', background: 'rgba(245,101,101,.08)', border: '1px solid rgba(245,101,101,.2)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>
              {error}
            </p>
          )}

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Description
            </label>
            {editing ? (
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add description..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            ) : (
              <p
                onClick={() => setEditing(true)}
                style={{
                  fontSize: 14, color: task.description ? 'var(--text2)' : 'var(--text3)',
                  cursor: 'text', fontStyle: task.description ? 'normal' : 'italic',
                  lineHeight: 1.6,
                }}
              >
                {task.description || 'No description. Click to add one.'}
              </p>
            )}
          </div>

          {/* Edit actions */}
          {editing && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveTask} disabled={savingTask} style={{
                padding: '7px 20px', background: 'var(--accent)', border: 'none',
                borderRadius: 'var(--radius)', color: '#fff', fontSize: 13, fontWeight: 600,
              }}>
                {savingTask ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setTitle(task.title); setDescription(task.description ?? ''); }} style={{
                padding: '7px 16px', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', background: 'transparent', color: 'var(--text2)', fontSize: 13,
              }}>
                Cancel
              </button>
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Notes ({task.notes.length})
            </label>

            {task.notes.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {task.notes.map((note, i) => (
                  <div
                    key={note.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 14px',
                      background: 'var(--surface2)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      animation: `slideIn .2s ease ${i * 30}ms both`,
                    }}
                  >
                    <p style={{ flex: 1, fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {note.content}
                    </p>
                    <button
                      onClick={() => onDeleteNote(task.id, note.id)}
                      style={{
                        flexShrink: 0, width: 22, height: 22,
                        border: 'none', background: 'transparent',
                        color: 'var(--text3)', fontSize: 16, cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Add note */}
            <div style={{ display: 'flex', gap: 8 }}>
              <textarea
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                placeholder="Add a note..."
                rows={2}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote(); }}
                style={{ ...inputStyle, flex: 1, resize: 'none', fontSize: 13 }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <button
                onClick={handleAddNote}
                disabled={addingNote || !noteContent.trim()}
                style={{
                  padding: '8px 16px', alignSelf: 'flex-end',
                  background: noteContent.trim() ? 'var(--accent)' : 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', color: noteContent.trim() ? '#fff' : 'var(--text3)',
                  fontSize: 13, fontWeight: 600, transition: 'all .15s',
                }}
              >
                {addingNote ? '…' : 'Add'}
              </button>
            </div>
            <p style={{ marginTop: 5, fontSize: 11, color: 'var(--text3)' }}>⌘↵ to add</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: '7px 16px', border: '1px solid rgba(245,101,101,.3)',
              borderRadius: 'var(--radius)', background: 'transparent',
              color: 'var(--red)', fontSize: 13,
            }}
          >
            {deleting ? 'Deleting…' : '🗑 Delete Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
