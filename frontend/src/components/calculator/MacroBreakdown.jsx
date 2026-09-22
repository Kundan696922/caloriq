const MACRO_META = {
  protein: { label: 'Protein', color: 'bg-accent' },
  carbs: { label: 'Carbs', color: 'bg-blue-400' },
  fat: { label: 'Fat', color: 'bg-amber-400' },
};

export default function MacroBreakdown({ macros, calorieTarget }) {
  const total = macros.protein.calories + macros.carbs.calories + macros.fat.calories || 1;

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-black/30">
        {Object.entries(MACRO_META).map(([key, meta]) => {
          const pct = (macros[key].calories / total) * 100;
          return <div key={key} className={meta.color} style={{ width: `${pct}%` }} />;
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {Object.entries(MACRO_META).map(([key, meta]) => (
          <div key={key} className="rounded-xl border border-border bg-black/20 p-3">
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${meta.color}`} />
              <span className="text-xs text-text-secondary">{meta.label}</span>
            </div>
            <p className="mt-1.5 text-lg font-bold">{macros[key].grams}g</p>
            <p className="text-xs text-text-secondary">{macros[key].calories} kcal</p>
          </div>
        ))}
      </div>

      {calorieTarget && (
        <p className="mt-3 text-xs text-text-secondary">
          Macro totals are calculated from your {calorieTarget.toLocaleString()} kcal/day target.
        </p>
      )}
    </div>
  );
}
