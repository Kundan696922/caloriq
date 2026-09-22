export default function NumberField({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step = 1,
  error,
  ...rest
}) {
  return (
    <label className="block">
      {label && <span className="text-sm text-text-secondary">{label}</span>}

      <div className="mt-1.5 relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          className={`w-full rounded-xl bg-black/20 border ${
            error ? "border-red-500" : "border-border"
          } px-4 py-2.5 ${
            unit ? "pr-14" : ""
          } text-sm text-text-primary placeholder:text-text-secondary/50
          focus:outline-none focus:ring-2 focus:ring-accent/40
          focus:border-accent transition-colors
          [appearance:textfield]
          [&::-webkit-inner-spin-button]:appearance-none
          [&::-webkit-outer-spin-button]:appearance-none`}
          {...rest}
        />

        {unit && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
            {unit}
          </span>
        )}
      </div>

      {error && (
        <span className="mt-1 block text-xs text-red-400">{error}</span>
      )}
    </label>
  );
}
