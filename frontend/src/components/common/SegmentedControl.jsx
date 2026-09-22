export default function SegmentedControl({ label, value, onChange, options }) {
  return (
    <div>
      {label && <span className="text-sm text-text-secondary">{label}</span>}
      <div className={`${label ? 'mt-1.5' : ''} flex flex-wrap gap-2`}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-xl px-4 py-2 text-sm border transition-colors ${
                active
                  ? 'bg-accent text-black border-accent font-semibold'
                  : 'bg-black/20 text-text-secondary border-border hover:border-text-secondary'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
