import { FiAlertTriangle } from "react-icons/fi";
import Button from "./Button";

/**
 * Generic confirmation modal.
 *
 * Usage:
 * <ConfirmDialog
 *   open={!!pendingDelete}
 *   title="Delete this food?"
 *   message="This will remove it from today's log. This can't be undone."
 *   confirmLabel="Delete"
 *   destructive
 *   onConfirm={handleConfirmDelete}
 *   onCancel={() => setPendingDelete(null)}
 * />
 */
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              destructive
                ? "bg-red-500/10 text-red-400"
                : "bg-accent/10 text-accent"
            }`}
          >
            <FiAlertTriangle size={18} />
          </div>

          <div className="min-w-0">
            <h3
              id="confirm-dialog-title"
              className="text-sm font-semibold text-text-primary"
            >
              {title}
            </h3>

            {message && (
              <p className="mt-1 text-sm text-text-secondary">{message}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-background disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <Button
            type="button"
            className={`w-auto px-4 ${
              destructive
                ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                : ""
            }`}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
