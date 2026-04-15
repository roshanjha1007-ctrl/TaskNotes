import {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn';

interface BaseFieldProps {
  label: string;
  hint?: string | null;
  error?: string | null;
  icon?: ReactNode;
  containerClassName?: string;
  theme?: 'light' | 'dark';
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseFieldProps {}
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFieldProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon, className = '', containerClassName = '', theme = 'light', ...props },
  ref,
) {
  return (
    <label className={cn('grid gap-2', containerClassName)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
        {label}
      </span>
      <span
        className={cn(
          'flex min-h-12 items-center gap-3 rounded-2xl border px-4 transition duration-200',
          error
            ? 'border-[var(--error-border)] ring-4 ring-[var(--error-bg)]'
            : 'border-[var(--border)] bg-[var(--surface-primary)] focus-within:border-[var(--accent)] focus-within:ring-4 focus-within:ring-[var(--focus-ring)]',
        )}
      >
        {icon ? <span className="text-[var(--text-muted)]">{icon}</span> : null}
        <input
          ref={ref}
          className={cn(
            'w-full border-0 bg-transparent px-0 py-3 text-sm outline-none',
            'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            className,
          )}
          {...props}
        />
      </span>
      {error ? (
        <span className="text-xs font-medium text-[var(--error-fg)]">{error}</span>
      ) : hint ? (
        <span className="text-xs text-[var(--text-muted)]">{hint}</span>
      ) : null}
    </label>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, icon, className = '', containerClassName = '', theme = 'light', ...props },
  ref,
) {
  return (
    <label className={cn('grid gap-2', containerClassName)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
        {label}
      </span>
      <span
        className={cn(
          'flex gap-3 rounded-2xl border px-4 py-3 transition duration-200',
          error
            ? 'border-[var(--error-border)] ring-4 ring-[var(--error-bg)]'
            : 'border-[var(--border)] bg-[var(--surface-primary)] focus-within:border-[var(--accent)] focus-within:ring-4 focus-within:ring-[var(--focus-ring)]',
        )}
      >
        {icon ? <span className="pt-1 text-[var(--text-muted)]">{icon}</span> : null}
        <textarea
          ref={ref}
          className={cn(
            'min-h-[120px] w-full resize-none border-0 bg-transparent px-0 py-0 text-sm outline-none',
            'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            className,
          )}
          {...props}
        />
      </span>
      {error ? (
        <span className="text-xs font-medium text-[var(--error-fg)]">{error}</span>
      ) : hint ? (
        <span className="text-xs text-[var(--text-muted)]">{hint}</span>
      ) : null}
    </label>
  );
});
