export default function Pagination({ pageNumber, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={pageNumber <= 1}
        onClick={() => onPageChange(pageNumber - 1)}
        className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-primary"
      >
        Previous
      </button>
      <span className="text-sm text-muted-foreground">
        Page {pageNumber} of {totalPages}
      </span>
      <button
        type="button"
        disabled={pageNumber >= totalPages}
        onClick={() => onPageChange(pageNumber + 1)}
        className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-primary"
      >
        Next
      </button>
    </div>
  );
}
