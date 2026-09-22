export default function SelectField({ label, value, onChange, options, error }) {
  return (
    <label className="block">
      <span className="text-sm text-text-secondary">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1.5 w-full rounded-xl bg-black/20 border ${
          error ? 'border-red-500' : 'border-border'
        } px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors appearance-none cursor-pointer`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-card">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}
