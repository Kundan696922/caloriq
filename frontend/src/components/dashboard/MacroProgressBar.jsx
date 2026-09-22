export default function MacroProgressBar({
  label,
  consumed,
  target,
  unit = "g",
  colorClass = "bg-accent",
}) {
  const pct =
    target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-text-primary">{label}</span>
        <span className="text-text-secondary">
          {consumed}
          {unit} / {target}
          {unit}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
