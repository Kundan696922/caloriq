import { useState } from "react";
import { FiCheck, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { LuUtensils } from "react-icons/lu";

import Card from "../common/Card";
import ConfirmDialog from "../common/ConfirmDialog";

function EntryThumbnail() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent/10 text-accent">
      <LuUtensils size={15} />
    </div>
  );
}

export default function FoodLogList({ entries, onDelete, onEdit }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  function startEditing(entry) {
    setEditingId(entry._id);
    setEditQuantity(String(entry.quantity));
    setEditError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditQuantity("");
    setEditError("");
  }

  async function handleSaveEdit(entry) {
    const quantity = Number(editQuantity);

    if (!Number.isFinite(quantity) || quantity < 0.1 || quantity > 50) {
      setEditError("Quantity must be between 0.1 and 50.");
      return;
    }

    setSavingEdit(true);
    setEditError("");

    try {
      await onEdit(entry._id, quantity);
      cancelEditing();
    } catch (err) {
      setEditError(err.message || "Could not update this food.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);

    try {
      await onDelete(pendingDelete._id);
      setPendingDelete(null);
    } catch {
      // Keep the dialog open if deletion fails.
    } finally {
      setDeleting(false);
    }
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <p className="text-sm text-text-secondary">
          No foods logged yet today.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className="divide-y divide-border p-0">
        {entries.map((entry) => {
          const isEditing = editingId === entry._id;

          return (
            <div key={entry._id} className="px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <EntryThumbnail />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {entry.description}
                    </p>

                    {!isEditing && (
                      <p className="text-xs text-text-secondary">
                        {entry.quantity}x {entry.servingSize}
                        {entry.servingSizeUnit} · {entry.nutrients.calories}{" "}
                        kcal
                      </p>
                    )}

                    {isEditing && (
                      <div className="mt-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0.1"
                            max="50"
                            step="0.1"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            autoFocus
                            disabled={savingEdit}
                            className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-center text-xs text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
                          />

                          <span className="text-xs text-text-secondary">
                            × {entry.servingSize}
                            {entry.servingSizeUnit}
                          </span>
                        </div>

                        {editError && (
                          <p className="mt-1 text-[11px] text-red-400">
                            {editError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(entry)}
                        disabled={savingEdit}
                        aria-label="Save food quantity"
                        className="rounded-lg p-2 text-text-secondary transition hover:bg-accent/10 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FiCheck size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={savingEdit}
                        aria-label="Cancel editing"
                        className="rounded-lg p-2 text-text-secondary transition hover:bg-border hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FiX size={15} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditing(entry)}
                        aria-label={`Edit ${entry.description}`}
                        className="rounded-lg p-2 text-text-secondary transition hover:bg-accent/10 hover:text-accent"
                      >
                        <FiEdit2 size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPendingDelete(entry)}
                        className="rounded-lg p-2 text-text-secondary transition hover:bg-border hover:text-red-400"
                        aria-label={`Remove ${entry.description}`}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </Card>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this food?"
        message={
          pendingDelete
            ? `"${pendingDelete.description}" will be removed from today's log. This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
