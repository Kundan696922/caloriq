import { FiChevronRight, FiBarChart2 } from "react-icons/fi";
import { LuUtensils } from "react-icons/lu";

import Card from "../common/Card";

export default function FoodCard({ food, onSelect }) {
  const { description, servingSize, servingSizeUnit, nutrients } = food;

  return (
    <button
      type="button"
      onClick={() => onSelect(food)}
      className="group w-full text-left"
    >
      <Card className="flex items-center justify-between gap-4 border-border transition hover:border-accent hover:bg-accent/10">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">
          {/* ICON */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <LuUtensils size={18} />
          </div>

          {/* FOOD INFO */}
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {description}
            </p>

            {servingSize && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <FiBarChart2 size={12} />

                <span>
                  Per {servingSize}
                  {servingSizeUnit || ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold text-accent">
              {nutrients.calories ?? "—"}
              <span className="ml-1 text-xs font-medium text-muted-foreground">
                kcal
              </span>
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {nutrients.protein ?? "—"}g protein
            </p>
          </div>

          <FiChevronRight
            size={17}
            className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
          />
        </div>
      </Card>
    </button>
  );
}
