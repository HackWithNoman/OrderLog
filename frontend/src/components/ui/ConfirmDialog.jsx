import { useEffect, useRef } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

const TONES = {
  error: { icon: "bg-error/10 text-error", button: "btn-error" },
  warning: { icon: "bg-warning/10 text-warning", button: "btn-warning" },
};

/**
 * Modal confirmation for destructive actions. Focuses Cancel by default,
 * closes on Escape/backdrop click and keeps Tab focus inside the dialog.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "error",
  busy = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancelRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open]);

  if (!open) return null;

  const styles = TONES[tone] ?? TONES.error;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto overscroll-contain bg-neutral/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        aria-busy={busy}
        className="card w-full max-w-sm border border-base-200 bg-base-100 shadow-xl"
      >
        <div className="card-body gap-4">
          <div className="flex items-start gap-3">
            <span
              className={`shrink-0 rounded-xl p-2 ${styles.icon}`}
              aria-hidden="true"
            >
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 id="confirm-dialog-title" className="text-base font-bold">
                {title}
              </h2>
              <p
                id="confirm-dialog-description"
                className="mt-1 break-words text-sm text-base-content/70"
              >
                {description}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="btn btn-ghost btn-sm rounded-xl"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={`btn btn-sm rounded-xl ${styles.button}`}
            >
              {busy && (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {busy ? `${confirmLabel}…` : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
