import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Card from "../common/Card";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function WeightCalendar({
  entries = [],
  selectedDate,
  onSelectDate,
}) {
  const [viewDate, setViewDate] = useState(() => new Date());

  const entryByDate = useMemo(() => {
    const map = new Map();
    entries.forEach((e) => map.set(e.date, e));
    return map;
  }, [entries]);

  const today = toDateStr(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  function goMonth(delta) {
    setViewDate(new Date(year, month + delta, 1));
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          aria-label="Previous month"
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          <FiChevronLeft size={16} />
        </button>

        <h3 className="text-sm font-semibold text-text-primary">
          {viewDate.toLocaleString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </h3>

        <button
          type="button"
          onClick={() => goMonth(1)}
          aria-label="Next month"
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          <FiChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-text-secondary">
        {WEEKDAYS.map((w, i) => (
          <div key={`${w}-${i}`} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;

          const dateStr = toDateStr(date);
          const entry = entryByDate.get(dateStr);
          const isFuture = dateStr > today;
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isFuture}
              onClick={() => onSelectDate(dateStr)}
              className={`flex h-14 flex-col items-center justify-center rounded-lg border text-xs transition-colors ${
                isFuture
                  ? "cursor-not-allowed border-transparent text-text-secondary/30"
                  : isSelected
                    ? "border-accent bg-accent text-background"
                    : entry
                      ? "border-accent/40 bg-accent/10 text-text-primary hover:border-accent"
                      : "border-border text-text-secondary hover:border-accent/50 hover:text-text-primary"
              } ${isToday && !isSelected ? "ring-1 ring-accent/50" : ""}`}
            >
              <span>{date.getDate()}</span>
              {entry && (
                <span className="text-[10px] font-medium">
                  {entry.weightKg}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export { toDateStr };
