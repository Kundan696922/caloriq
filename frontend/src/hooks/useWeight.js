import { useCallback, useEffect, useState } from "react";
import {
  addWeightEntry,
  getWeightHistory,
  getWeightStats,
  deleteWeightEntry,
} from "../services/weightService";

/**
 * Loads weight stats (chart/changes/goal progress) and, optionally, the
 * raw entry history (needed for the delete-by-id list). Mirrors
 * useDashboard's load/add/remove-then-refresh pattern.
 */
export default function useWeight({ withHistory = true } = {}) {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsResult, historyResult] = await Promise.all([
        getWeightStats(),
        withHistory ? getWeightHistory() : Promise.resolve({ entries: [] }),
      ]);
      setStats(statsResult);
      setHistory(historyResult.entries);
    } catch (err) {
      setError(err.message || "Failed to load your weight data.");
    } finally {
      setLoading(false);
    }
  }, [withHistory]);

  useEffect(() => {
    load();
  }, [load]);

  async function addEntry(entry) {
    await addWeightEntry(entry);
    await load();
  }

  async function removeEntry(entryId) {
    await deleteWeightEntry(entryId);
    await load();
  }

  return {
    stats,
    history,
    loading,
    error,
    reload: load,
    addEntry,
    removeEntry,
  };
}
