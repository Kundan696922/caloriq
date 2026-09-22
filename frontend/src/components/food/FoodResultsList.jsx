import FoodCard from "./FoodCard";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded bg-muted ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
}

function FoodCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />

        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

function FoodResultsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <FoodCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function FoodResultsList({
  foods,
  isLoading,
  error,
  hasSearched,
  onSelect,
}) {
  if (error) {
    return (
      <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
        {error}
      </p>
    );
  }

  // Only show skeleton while an actual search is happening.
  if (isLoading) {
    return <FoodResultsSkeleton />;
  }

  // Don't show anything before the user searches.
  if (!hasSearched) {
    return null;
  }

  if (foods.length === 0) {
    return (
      <p className="px-1 py-4 text-sm text-muted-foreground">
        No foods matched that search. Try a different term.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {foods.map((food) => (
        <FoodCard key={food.fdcId} food={food} onSelect={onSelect} />
      ))}
    </div>
  );
}
