import { useState } from "react";
import {
  generateMeals,
  saveMeal,
  logMealToDashboard,
} from "../services/mealService";

// Same convention as useDashboard, so a meal logged "today" shows up on the
// dashboard's "today" view.
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Handles generating meal options and saving / logging one of them.
 * Generated meals are drafts (no _id) until saved, so saved ids are tracked
 * by the meal's index in the current result set.
 *
 * `save` and `logToToday` throw on failure; the page shows the message.
 */
export default function useMealGenerator() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState({}); // index -> saved meal _id
  const [savingIndex, setSavingIndex] = useState(null);
  const [loggingIndex, setLoggingIndex] = useState(null);

  async function generate(params) {
    setLoading(true);
    setError("");
    setResult(null);
    setSavedIds({});

    try {
      const data = await generateMeals({ ...params, date: todayStr() });
      setResult(data);
      return true;
    } catch (err) {
      setError(err.message || "Could not generate meals. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function save(index) {
    if (savedIds[index] || savingIndex !== null) return;

    setSavingIndex(index);
    try {
      const saved = await saveMeal(result.meals[index]);
      setSavedIds((prev) => ({ ...prev, [index]: saved._id }));
    } finally {
      setSavingIndex(null);
    }
  }

  async function logToToday(index) {
    const id = savedIds[index];
    if (!id || loggingIndex !== null) return;

    setLoggingIndex(index);
    try {
      await logMealToDashboard(id, { date: todayStr() });
    } finally {
      setLoggingIndex(null);
    }
  }

  return {
    result,
    loading,
    error,
    savedIds,
    savingIndex,
    loggingIndex,
    generate,
    save,
    logToToday,
  };
}
