import React, { useState } from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  index: number;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, index, onToggle, onDelete, onClick }: TaskCardProps) {
  const [hovered, setHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    try { await onDelete(task.id); } finally { setDeleting(false); }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(task.id, task.completed);
  };

  return (
    <div
      onClick={() => onClick(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--surface2)' : 'var(--surface)',
        border: `1px solid ${hovered ? 'var(--border2)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'flex-start', gap: 14,
        transition: 'all .15s',
        animation: `fadeIn .3s ease ${index * 40}ms both`,
        opacity: task.completed ? 0.6 : 1,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        title={task.completed ? 'Mark pending' : 'Mark complete'}
        style={{
          flexShrink: 0,
          marginTop: 2,
          width: 20, height: 20,
          border: `2px solid ${task.completed ? 'var(--green)' : 'var(--border2)'}`,
          borderRadius: 6,
          background: task.completed ? 'var(--green)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .15s',
          color: '#fff', fontSize: 12,
        }}
      >
        {task.completed && '✓'}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontSize: 15, fontWeight: 600,
          textDecoration: task.completed ? 'line-through' : 'none',
          color: task.completed ? 'var(--text3)' : 'var(--text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {task.title}
        </h3>

        {task.description && (
          <p style={{
            marginTop: 4, fontSize: 13, color: 'var(--text2)',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {task.description}
          </p>
        )}

        <div style={{
          marginTop: 10, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {task.notes.length > 0 && (
            <span style={{
              fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              📝 {task.notes.length} note{task.notes.length !== 1 ? 's' : ''}
            </span>
          )}
          <span style={{
            fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)',
          }}>
            {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Delete task"
        style={{
          flexShrink: 0,
          opacity: hovered ? 1 : 0,
          width: 28, height: 28,
          border: '1px solid var(--border)',
          borderRadius: 8,
          background: 'transparent',
          color: 'var(--red)',
          fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity .15s, background .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,101,101,.1)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {deleting ? '…' : '×'}
      </button>
    </div>
  );
}
