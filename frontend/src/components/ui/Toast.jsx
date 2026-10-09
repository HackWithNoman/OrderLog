import { X } from 'lucide-react';

const TYPE_CLASSES = {
  success: 'alert-success',
  error: 'alert-error',
  info: 'alert-info',
};

/**
 * Renders a single toast notification.
 * Props: `toast` ({ message, type }) and `onDismiss`.
 */
export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  const typeClass = TYPE_CLASSES[toast.type] || 'alert-success';

  return (
    <div className="toast toast-top toast-center sm:toast-end z-50">
      <div
        className={`alert ${typeClass} shadow-lg text-white font-medium flex items-center gap-2`}
      >
        <span>{toast.message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="btn btn-ghost btn-xs btn-circle"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
