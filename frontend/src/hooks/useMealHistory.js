import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchMeals,
  setMealFavorite,
  deleteMeal,
  logMealToDashboard,
} from "../services/mealService";

const PAGE_SIZE = 6;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Saved-meal history with filters + pagination. Mutations (favorite, delete,
 * log) throw on failure so the caller can show the message.
 */
export default function useMealHistory() {
  const [filters, setFilters] = useState({ mealType: "", favorite: false });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ meals: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ignore responses from superseded requests (fast filter changes).
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");

    try {
      const result = await fetchMeals({ page, limit: PAGE_SIZE, ...filters });
      if (id === requestId.current) setData(result);
    } catch (err) {
      if (id === requestId.current) {
        setError(err.message || "Failed to load your saved meals.");
      }
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  function changeFilters(patch) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  async function toggleFavorite(meal) {
    const updated = await setMealFavorite(meal._id, !meal.isFavorite);

    setData((prev) => {
      // In the "favorites only" view, an un-favorited meal leaves the list.
      if (filters.favorite && !updated.isFavorite) {
        return {
          ...prev,
          meals: prev.meals.filter((m) => m._id !== meal._id),
          total: Math.max(prev.total - 1, 0),
        };
      }
      return {
        ...prev,
        meals: prev.meals.map((m) =>
          m._id === meal._id ? { ...m, isFavorite: updated.isFavorite } : m,
        ),
      };
    });
  }

  async function remove(meal) {
    await deleteMeal(meal._id);

    // Deleting the last item on a later page steps back a page.
    if (data.meals.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      await load();
    }
  }

  async function log(meal) {
    return logMealToDashboard(meal._id, { date: todayStr() });
  }

  return {
    meals: data.meals,
    total: data.total,
    totalPages: data.totalPages,
    page,
    filters,
    loading,
    error,
    setPage,
    changeFilters,
    reload: load,
    toggleFavorite,
    remove,
    log,
  };
}
