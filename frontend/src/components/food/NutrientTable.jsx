const ROWS = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbohydrates", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
  { key: "fiber", label: "Fiber", unit: "g" },
  { key: "sugars", label: "Sugars", unit: "g" },
  { key: "sodium", label: "Sodium", unit: "mg" },
];

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

export default function NutrientTable({
  nutrients = {},
  servingSize,
  servingSizeUnit,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-3">
          <Skeleton className="h-4 w-28 sm:w-32" />
        </div>

        <dl className="w-full divide-y divide-border">
          {ROWS.map(({ key }) => (
            <div
              key={key}
              className="flex min-w-0 items-center justify-between gap-4 py-2.5"
            >
              <Skeleton className="h-4 w-20 sm:w-24" />
              <Skeleton className="h-4 w-14 shrink-0 sm:w-16" />
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <div className="w-full">
      {servingSize && (
        <p className="mb-3 text-sm text-muted-foreground">
          Per {servingSize}
          {servingSizeUnit ? ` ${servingSizeUnit}` : ""}
        </p>
      )}

      <dl className="w-full divide-y divide-border">
        {ROWS.map(({ key, label, unit }) => (
          <div
            key={key}
            className="flex min-w-0 items-center justify-between gap-4 py-2.5"
          >
            <dt className="min-w-0 flex-1 text-sm text-muted-foreground">
              {label}
            </dt>

            <dd className="shrink-0 whitespace-nowrap text-right text-sm font-medium text-foreground">
              {nutrients[key] === null || nutrients[key] === undefined
                ? "—"
                : `${nutrients[key]} ${unit}`}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}