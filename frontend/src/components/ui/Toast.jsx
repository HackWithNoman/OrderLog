import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const TYPES = {
  success: { className: 'alert-success text-success-content', Icon: CheckCircle2 },
  error: { className: 'alert-error text-error-content', Icon: AlertCircle },
  info: { className: 'alert-info text-info-content', Icon: Info },
};

/**
 * Renders a single toast notification inside a persistent live region so
 * screen readers announce new messages.
 * Props: `toast` ({ message, type }) and `onDismiss`.
 */
export default function Toast({ toast, onDismiss }) {
  const styles = TYPES[toast?.type] ?? TYPES.success;
  const Icon = styles.Icon;

  return (
    <div
      className="toast toast-top toast-center sm:toast-end z-[80] pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toast && (
        <div
          role={toast.type === 'error' ? 'alert' : undefined}
          className={`alert ${styles.className} pointer-events-auto flex items-center gap-2 font-medium shadow-lg`}
        >
          <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{toast.message}</span>
          <button
            type="button"
            onClick={onDismiss}
            className="btn btn-ghost btn-xs btn-circle shrink-0 hover:bg-base-content/10"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
