import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
} from "react-icons/fi";

import Card from "../common/Card";
import ConfirmDialog from "../common/ConfirmDialog";

const ITEMS_PER_PAGE = 5;

export default function WeightHistoryList({ entries = [], onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [entries]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);

  // Keep the current page valid after deleting an entry.
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);

    try {
      await onDelete(pendingDelete._id);
      setPendingDelete(null);
    } catch {
      // Keep the dialog open if deletion fails.
      // The parent/hook can surface its own error or toast.
    } finally {
      setDeleting(false);
    }
  }

  if (sorted.length === 0) {
    return (
      <Card>
        <p className="text-sm text-text-secondary">
          No entries yet. Log your weight to start building your history.
        </p>
      </Card>
    );
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentEntries = sorted.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <>
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          History
        </h3>

        <div className="divide-y divide-border">
          {currentEntries.map((entry) => (
            <div
              key={entry._id}
              className="flex items-center justify-between py-3"
            >
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {entry.weightKg} kg
                </div>

                <div className="text-xs text-text-secondary">
                  {entry.date}
                  {entry.note ? ` · ${entry.note}` : ""}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPendingDelete(entry)}
                aria-label={`Delete weight entry from ${entry.date}`}
                className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-red-500"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-1 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FiChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  aria-label={`Go to page ${page}`}
                  className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    currentPage === page
                      ? "bg-accent text-white"
                      : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Page count */}
        {totalPages > 1 && (
          <p className="mt-2 text-center text-[11px] text-text-secondary">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </Card>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this weight entry?"
        message={
          pendingDelete
            ? `${pendingDelete.weightKg} kg recorded on ${pendingDelete.date} will be removed. This can't be undone.`
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
