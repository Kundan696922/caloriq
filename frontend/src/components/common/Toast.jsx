export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  const isError = type === "error";

  return (
    <div className="fixed left-1/2 top-5 z-[9999] -translate-x-1/2">
      <div
        className={`flex min-w-[280px] items-center justify-between gap-4 rounded-xl border px-5 py-3 shadow-xl backdrop-blur-md ${
          isError
            ? "border-red-500/40 bg-red-500/15 text-red-400"
            : "border-green-500/40 bg-green-500/15 text-green-400"
        }`}
      >
        <span className="text-sm font-medium">{message}</span>

        <button
          type="button"
          onClick={onClose}
          className="text-lg leading-none opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
}
