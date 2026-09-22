import { useCallback, useEffect, useState } from "react";
import {
  fetchDashboard,
  logFoodEntry,
  updateFoodEntry,
  deleteFoodEntry,
} from "../services/dashboardService";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Loads the personalized dashboard (target + today's log + totals + remaining)
 * and exposes actions that keep local state in sync with the server response,
 * without needing a full reload after every add/delete.
 */
export default function useDashboard(date = todayStr()) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchDashboard(date);
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  async function addEntry(entry) {
    const result = await logFoodEntry({ ...entry, date });
    setData((prev) => ({
      ...prev,
      entries: result.entries,
      totals: result.totals,
      remaining: result.remaining,
    }));
  }

  async function updateEntry(entryId, quantity) {
  const result = await updateFoodEntry(entryId, quantity, date);

  setData((prev) => ({
    ...prev,
    entries: result.entries,
    totals: result.totals,
    remaining: result.remaining,
  }));
}

  async function removeEntry(entryId) {
    const result = await deleteFoodEntry(entryId, date);
    setData((prev) => ({
      ...prev,
      entries: result.entries,
      totals: result.totals,
      remaining: result.remaining,
    }));
  }

  return { data, loading, error, reload: load, addEntry, removeEntry, updateEntry };
}
