import { useState } from "react";

export default function ChatHistory({
  conversations,
  activeId,
  loading,
  disabled,
  onSelect,
  onDelete,
  onNew,
}) {
  // Two-step delete: first click arms it, second click confirms.
  const [confirmId, setConfirmId] = useState(null);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      <button
        type="button"
        onClick={onNew}
        disabled={disabled}
        className="w-full rounded-lg border border-dashed border-accent/60 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/10 disabled:opacity-50 transition-colors"
      >
        + New chat
      </button>

      {loading && (
        <p className="py-6 text-center text-sm text-text-secondary">
          Loading chats…
        </p>
      )}

      {!loading && conversations.length === 0 && (
        <p className="py-6 text-center text-sm text-text-secondary">
          No past chats yet.
        </p>
      )}

      {conversations.map((c) => (
        <div
          key={c.id}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
            c.id === activeId
              ? "border-accent/60 bg-accent/10"
              : "border-border bg-bg"
          }`}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(c.id)}
            className="min-w-0 flex-1 text-left disabled:opacity-50"
          >
            <p className="truncate text-sm text-text-primary">{c.title}</p>
            <p className="text-xs text-text-secondary">
              {new Date(c.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </p>
          </button>

          {confirmId === c.id ? (
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => {
                  setConfirmId(null);
                  onDelete(c.id);
                }}
                className="rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="rounded px-2 py-1 text-xs text-text-secondary hover:bg-card"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label={`Delete chat ${c.title}`}
              disabled={disabled}
              onClick={() => setConfirmId(c.id)}
              className="shrink-0 rounded p-1.5 text-text-secondary hover:bg-card hover:text-red-400 disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
