import { useState } from "react";
import { FiHeart, FiPlus, FiTrash2 } from "react-icons/fi";

import Card from "../common/Card";
import Button from "../common/Button";
import MealCard from "./MealCard";
import useMealHistory from "../../hooks/useMealHistory";

const TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border text-text-secondary hover:border-text-secondary hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <div className="h-4 w-1/3 animate-pulse rounded bg-border/60" />
          <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-border/60" />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((__, j) => (
              <div
                key={j}
                className="h-12 animate-pulse rounded-xl bg-border/60"
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function HistoryItem({ meal, onLog, onFavorite, onDelete }) {
  const [busy, setBusy] = useState("");
  const [confirming, setConfirming] = useState(false);

  async function run(kind, fn) {
    setBusy(kind);
    try {
      await fn();
    } finally {
      setBusy("");
      setConfirming(false);
    }
  }

  const footer = (
    <>
      <Button
        variant="secondary"
        loading={busy === "log"}
        disabled={busy !== ""}
        onClick={() => run("log", () => onLog(meal))}
        className="px-3 py-2"
      >
        <FiPlus size={14} />
        Log to today
      </Button>

      <button
        type="button"
        aria-label={
          meal.isFavorite ? "Remove from favorites" : "Add to favorites"
        }
        aria-pressed={meal.isFavorite}
        disabled={busy !== ""}
        onClick={() => run("fav", () => onFavorite(meal))}
        className={`rounded-lg p-2 transition-colors hover:bg-white/5 disabled:opacity-50 ${
          meal.isFavorite ? "text-red-400" : "text-text-secondary"
        }`}
      >
        <FiHeart size={16} fill={meal.isFavorite ? "currentColor" : "none"} />
      </button>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-text-secondary">
          {new Date(meal.createdAt).toLocaleDateString()}
        </span>

        {confirming ? (
          <>
            <Button
              variant="secondary"
              loading={busy === "delete"}
              onClick={() => run("delete", () => onDelete(meal))}
              className="px-3 py-1.5 text-xs"
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              disabled={busy === "delete"}
              onClick={() => setConfirming(false)}
              className="px-3 py-1.5 text-xs"
            >
              Cancel
            </Button>
          </>
        ) : (
          <button
            type="button"
            aria-label="Delete meal"
            disabled={busy !== ""}
            onClick={() => setConfirming(true)}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-red-400 disabled:opacity-50"
          >
            <FiTrash2 size={16} />
          </button>
        )}
      </div>
    </>
  );

  return <MealCard meal={meal} footer={footer} />;
}

/**
 * Saved-meal history. `onFlash(type, text, link?)` shows a page-level message.
 */
export default function MealHistory({ onFlash }) {
  const {
    meals,
    total,
    totalPages,
    page,
    filters,
    loading,
    error,
    setPage,
    changeFilters,
    reload,
    toggleFavorite,
    remove,
    log,
  } = useMealHistory();

  async function handleLog(meal) {
    try {
      await log(meal);
      onFlash("success", `"${meal.title}" added to today's log.`, "/dashboard");
    } catch (err) {
      onFlash("error", err.message || "Could not log that meal.");
    }
  }

  async function handleFavorite(meal) {
    try {
      await toggleFavorite(meal);
    } catch (err) {
      onFlash("error", err.message || "Could not update favorite.");
    }
  }

  async function handleDelete(meal) {
    try {
      await remove(meal);
      onFlash("success", "Meal deleted.");
    } catch (err) {
      onFlash("error", err.message || "Could not delete that meal.");
    }
  }

  const isFiltered = filters.mealType !== "" || filters.favorite;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {TYPE_FILTERS.map((f) => (
          <FilterChip
            key={f.label}
            active={filters.mealType === f.value}
            onClick={() => changeFilters({ mealType: f.value })}
          >
            {f.label}
          </FilterChip>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
        <FilterChip
          active={filters.favorite}
          onClick={() => changeFilters({ favorite: !filters.favorite })}
        >
          Favorites
        </FilterChip>
      </div>

      {loading && <ListSkeleton />}

      {!loading && error && (
        <Card>
          <p className="text-sm text-red-400">{error}</p>
          <Button variant="secondary" onClick={reload} className="mt-3">
            Try again
          </Button>
        </Card>
      )}

      {!loading && !error && meals.length === 0 && (
        <Card>
          <p className="text-sm font-medium text-text-primary">
            {isFiltered
              ? "No meals match these filters."
              : "No saved meals yet."}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {isFiltered
              ? "Try a different filter."
              : "Generate a meal and tap Save to keep the ones you like."}
          </p>
        </Card>
      )}

      {!loading && !error && meals.length > 0 && (
        <>
          <div className="space-y-4">
            {meals.map((meal) => (
              <HistoryItem
                key={meal._id}
                meal={meal}
                onLog={handleLog}
                onFavorite={handleFavorite}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2"
              >
                Previous
              </Button>
              <span className="text-xs text-text-secondary">
                Page {page} of {totalPages} · {total} meals
              </span>
              <Button
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
