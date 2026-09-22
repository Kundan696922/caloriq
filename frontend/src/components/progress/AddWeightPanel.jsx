import { useEffect, useState } from "react";
import { FiPlus, FiSave } from "react-icons/fi";
import Card from "../common/Card";
import Button from "../common/Button";

function formatLabel(dateStr, todayStr) {
  if (dateStr === todayStr) return "Log today's weight";
  const d = new Date(`${dateStr}T00:00:00`);
  return `Log weight for ${d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export default function AddWeightPanel({
  date,
  todayStr,
  existingEntry,
  onAdd,
}) {
  const [weightKg, setWeightKg] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Re-sync the form whenever the selected date (or its existing entry)
  // changes, so picking a past logged day shows that day's values.
  useEffect(() => {
    setWeightKg(existingEntry ? String(existingEntry.weightKg) : "");
    setNote(existingEntry?.note ?? "");
    setError("");
  }, [date, existingEntry]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const parsed = Number(weightKg);
    if (!weightKg || Number.isNaN(parsed) || parsed < 25 || parsed > 300) {
      setError("Enter a weight between 25 and 300 kg.");
      return;
    }

    setSaving(true);
    try {
      await onAdd({ weightKg: parsed, date, note: note.trim() || undefined });
      if (date === todayStr && !existingEntry) {
        setWeightKg("");
        setNote("");
      }
    } catch (err) {
      setError(err.message || "Unable to log your weight.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        {formatLabel(date, todayStr)}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-500">
            {error}
          </div>
        )}

        <label className="block">
          <span className="text-sm font-medium text-text-primary">
            Weight (kg)
          </span>
          <input
            type="number"
            step="0.1"
            min="25"
            max="300"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            required
            placeholder="e.g. 78.4"
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-text-primary">
            Note (optional)
          </span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={280}
            placeholder="e.g. after workout"
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>

        <Button type="submit" disabled={saving} className="w-auto px-5">
          <span className="inline-flex items-center gap-2">
            {existingEntry ? <FiSave size={16} /> : <FiPlus size={16} />}
            {saving
              ? "Saving..."
              : existingEntry
                ? "Update entry"
                : "Log weight"}
          </span>
        </Button>
      </form>
    </Card>
  );
}
