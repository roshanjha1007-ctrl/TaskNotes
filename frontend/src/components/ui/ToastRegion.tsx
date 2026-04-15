import { cn } from '../../lib/cn';

export interface ToastMessage {
  id: string;
  title: string;
  tone?: 'success' | 'error' | 'info';
}

interface ToastRegionProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastRegion({ toasts, onDismiss }: ToastRegionProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex max-w-md flex-col gap-3 px-4"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 shadow-[var(--shadow-md)] backdrop-blur',
            toast.tone === 'success' && 'border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-fg)]',
            toast.tone === 'error' && 'border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error-fg)]',
            (!toast.tone || toast.tone === 'info') && 'border-[var(--border)] bg-[var(--surface-primary)] text-[var(--text-primary)]',
          )}
        >
          <div className="pr-4">
            <p className="text-sm font-semibold">{toast.title}</p>
          </div>
          <button
            className="rounded-full p-1 text-[var(--text-muted)] transition hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
