import { useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { LuUtensils } from "react-icons/lu";

import Card from "../common/Card";
import Button from "../common/Button";
import { searchFoodsForLog } from "../../services/dashboardService";

function ResultsSkeleton() {
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b border-border px-3 py-2 last:border-b-0"
        >
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-border/60" />
          <div className="h-3 flex-1 animate-pulse rounded bg-border/60" />
          <div className="h-3 w-12 shrink-0 animate-pulse rounded bg-border/60" />
        </div>
      ))}
    </div>
  );
}

function sanitizeNutrients(nutrients = {}) {
  const keys = [
    "calories",
    "protein",
    "fat",
    "carbs",
    "fiber",
    "sugars",
    "sodium",
  ];

  return Object.fromEntries(
    keys
      .map((key) => {
        const value = Number(nutrients[key]);

        if (!Number.isFinite(value) || value < 0) {
          return null;
        }

        return [key, value];
      })
      .filter(Boolean),
  );
}

export default function AddFoodPanel({ onAdd }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();

    if (!query.trim()) return;

    setSearching(true);
    setError("");
    setResults([]);

    try {
      const data = await searchFoodsForLog(query.trim());
      setResults(data.foods || []);
    } catch (err) {
      setError(err.message || "Search failed.");
    } finally {
      setSearching(false);
    }
  }

  function handleSelect(food) {
    setSelected(food);
    setResults([]);
    setQuery(food.description);
  }

  async function handleAdd() {
    if (!selected) return;

    setAdding(true);
    setError("");

    try {
      await onAdd({
        fdcId: String(selected.fdcId),
        description: selected.description,
        servingSize: selected.servingSize,
        servingSizeUnit: selected.servingSizeUnit,
        quantity: Number(quantity),
        nutrients: sanitizeNutrients(selected.nutrients),
      });

      setSelected(null);
      setQuery("");
      setQuantity(1);
    } catch (err) {
      setError(err.message || "Could not log that food.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-text-primary">
        Log a food
      </h3>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            size={14}
          />

          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            placeholder='Search a food, e.g. "grilled chicken breast"'
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
          />
        </div>

        <Button
          type="submit"
          loading={searching}
          className="w-auto px-4"
        >
          Search
        </Button>
      </form>

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}

      {searching && <ResultsSkeleton />}

      {!searching && results.length > 0 && (
        <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-border">
          {results.map((food) => (
            <button
              key={food.fdcId}
              type="button"
              onClick={() => handleSelect(food)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-text-primary hover:bg-border/60"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <LuUtensils size={14} />
              </div>

              <span className="min-w-0 flex-1 truncate">
                {food.description}
              </span>

              <span className="shrink-0 text-xs text-text-secondary">
                {food.nutrients.calories ?? "–"} kcal
              </span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <LuUtensils size={14} />
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">
              {selected.description}
            </p>

            <p className="text-xs text-text-secondary">
              Per {selected.servingSize}
              {selected.servingSizeUnit}:{" "}
              {selected.nutrients.calories ?? "–"} kcal
            </p>
          </div>

          <input
            type="number"
            min="0.1"
            step="0.1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-16 rounded-lg border border-border bg-card px-2 py-1 text-center text-sm text-text-primary focus:border-accent focus:outline-none"
          />

          <Button
            type="button"
            onClick={handleAdd}
            loading={adding}
            className="w-auto px-3"
          >
            <FiPlus size={15} />
          </Button>
        </div>
      )}
    </Card>
  );
}
