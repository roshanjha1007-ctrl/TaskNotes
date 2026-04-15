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
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.tone ?? 'info'}`}>
          <div>
            <p className="toast-title">{toast.title}</p>
          </div>
          <button className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
