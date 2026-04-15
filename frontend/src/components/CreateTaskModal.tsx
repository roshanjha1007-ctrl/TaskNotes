import React, { useState, useEffect, useRef } from 'react';
import { CreateTaskPayload } from '../types';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreate: (payload: CreateTaskPayload) => Promise<unknown>;
}

export function CreateTaskModal({ onClose, onCreate }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    setSaving(true); setError('');
    try {
      await onCreate({ title: title.trim(), description: description.trim() || undefined });
      onClose();
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message ?? 'Failed to create task.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)',
    fontSize: 14, fontFamily: 'var(--font)',
    outline: 'none', transition: 'border-color .15s',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 500,
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-lg)', padding: 28,
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn .2s ease both',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Task</h2>

        {error && (
          <p style={{
            marginBottom: 14, padding: '8px 12px',
            background: 'rgba(245,101,101,.08)',
            border: '1px solid rgba(245,101,101,.2)',
            borderRadius: 8, color: 'var(--red)', fontSize: 13,
          }}>{error}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Title *
            </label>
            <input
              ref={inputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="What needs to be done?"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', background: 'transparent',
              color: 'var(--text2)', fontSize: 14,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: '8px 24px',
              background: saving ? 'var(--border2)' : 'var(--accent)',
              border: 'none', borderRadius: 'var(--radius)',
              color: '#fff', fontSize: 14, fontWeight: 600,
              transition: 'background .15s',
            }}
          >
            {saving ? 'Creating…' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
