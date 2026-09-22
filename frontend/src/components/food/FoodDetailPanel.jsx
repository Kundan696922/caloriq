import { useEffect, useState } from "react";
import { FiX, FiTag, FiBarChart2 } from "react-icons/fi";
import { LuUtensils } from "react-icons/lu";

import Card from "../common/Card";
import NutrientTable from "./NutrientTable";
import { fetchFoodById } from "../../services/foodService";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded bg-muted ${className}`}
      aria-hidden="true"
    />
  );
}

export default function FoodDetailPanel({ fdcId, onClose }) {
  const [food, setFood] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fdcId) return;

    let isCancelled = false;

    setIsLoading(true);
    setError(null);
    setFood(null);

    fetchFoodById(fdcId)
      .then((data) => {
        if (!isCancelled) {
          setFood(data);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [fdcId]);

  if (!fdcId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
        <Card className="max-h-[85vh] w-full overflow-y-auto border-border bg-card p-0 shadow-2xl sm:rounded-2xl">
          {/* HEADER */}
          <div className="border-b border-border px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                {/* FOOD ICON */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <LuUtensils size={21} />
                </div>

                <div className="min-w-0">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-52" />
                      <Skeleton className="h-3.5 w-24" />
                    </div>
                  ) : (
                    food && (
                      <>
                        <h2 className="truncate text-lg font-semibold leading-6 text-foreground">
                          {food.description}
                        </h2>

                        {food.brandOwner && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <FiTag size={12} />
                            {food.brandOwner}
                          </div>
                        )}
                      </>
                    )
                  )}
                </div>
              </div>

              {/* CLOSE */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
              >
                <FiX size={17} />
              </button>
            </div>

            {/* SERVING */}
            {!isLoading && food && food.servingSize && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                <FiBarChart2 size={15} className="text-accent" />

                <span className="text-xs text-muted-foreground">
                  Serving size
                </span>

                <span className="ml-auto text-sm font-medium text-foreground">
                  {food.servingSize}
                  {food.servingSizeUnit || ""}
                </span>
              </div>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="px-5 py-5">
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            </div>
          )}

          {/* NUTRITION */}
          {!error && (
            <div className="px-5 py-5">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                  Nutrition
                </p>

                <h3 className="mt-1 text-base font-semibold text-foreground">
                  Nutrition facts
                </h3>
              </div>

              <NutrientTable
                nutrients={food?.nutrients}
                servingSize={food?.servingSize}
                servingSizeUnit={food?.servingSizeUnit}
                isLoading={isLoading}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
