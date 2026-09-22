import { useState } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiInfo,
} from "react-icons/fi";

import Card from "../common/Card";

const STATUS = {
  verified: {
    label: "USDA-verified",
    className: "bg-accent/10 text-accent",
    Icon: FiCheckCircle,
  },
  partial: {
    label: "Partly verified",
    className: "bg-amber-400/10 text-amber-400",
    Icon: FiInfo,
  },
  estimated: {
    label: "AI estimate",
    className: "bg-white/5 text-text-secondary",
    Icon: FiInfo,
  },
};

const TYPE_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

function Macro({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-bg px-3 py-2 text-center">
      <p className="text-sm font-semibold text-text-primary">
        {Math.round(value || 0)}g
      </p>
      <p className="text-[11px] text-text-secondary">{label}</p>
    </div>
  );
}

/**
 * Displays one meal (a generated draft or a saved meal). Action buttons are
 * passed in via `footer` so the same card serves both the Generate and
 * Saved tabs.
 */
export default function MealCard({ meal, footer, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  const nutrients = meal.nutrients || {};
  const validation = meal.validation || {};
  const status = STATUS[validation.status] || STATUS.estimated;
  const StatusIcon = status.Icon;
  const totalMinutes =
    (meal.prepTimeMinutes || 0) + (meal.cookTimeMinutes || 0);
  const warnings = validation.warnings || [];

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            <span className="rounded-md bg-white/5 px-2 py-0.5">
              {TYPE_LABELS[meal.mealType] || "Meal"}
            </span>
            {totalMinutes > 0 && (
              <span className="inline-flex items-center gap-1">
                <FiClock size={12} />
                {totalMinutes} min
              </span>
            )}
          </div>

          <h3 className="text-base font-semibold text-text-primary">
            {meal.title}
          </h3>

          {meal.description && (
            <p className="mt-1 text-sm text-text-secondary">
              {meal.description}
            </p>
          )}
        </div>

        <span
          title={`${validation.verifiedCalorieShare ?? 0}% of calories matched to USDA data`}
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
        >
          <StatusIcon size={12} />
          {status.label}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <div className="rounded-xl border border-border bg-bg px-3 py-2 text-center">
          <p className="text-sm font-semibold text-accent">
            {Math.round(nutrients.calories || 0)}
          </p>
          <p className="text-[11px] text-text-secondary">kcal</p>
        </div>
        <Macro label="Protein" value={nutrients.protein} />
        <Macro label="Carbs" value={nutrients.carbs} />
        <Macro label="Fat" value={nutrients.fat} />
      </div>

      {warnings.length > 0 && (
        <ul className="mt-3 space-y-1">
          {warnings.map((warning, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs text-amber-400"
            >
              <FiAlertTriangle size={13} className="mt-0.5 shrink-0" />
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-4 flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <FiChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
        {open ? "Hide" : "Show"} ingredients &amp; steps
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          <div>
            <ul className="divide-y divide-border rounded-xl border border-border">
              {(meal.ingredients || []).map((ing, i) => (
                <li
                  key={`${ing.name}-${i}`}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-text-primary">
                      {ing.displayQuantity} {ing.displayUnit} {ing.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {ing.grams} g
                      {ing.source === "usda" && (
                        <span
                          title={ing.usdaDescription || "USDA FoodData Central"}
                          className="ml-2 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent"
                        >
                          USDA
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-text-secondary">
                    {Math.round(ing.nutrients?.calories || 0)} kcal
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-text-secondary">
              Values tagged USDA come from USDA FoodData Central; the rest are
              AI estimates. Amounts are approximate.
            </p>
          </div>

          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-text-secondary">
            {(meal.instructions || []).map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {footer && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          {footer}
        </div>
      )}
    </Card>
  );
}
