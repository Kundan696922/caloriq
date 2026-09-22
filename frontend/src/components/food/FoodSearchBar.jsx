export default function FoodSearchBar({
  value,
  onChange,
  placeholder = 'Search foods, e.g. "chicken breast"',
}) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search foods"
        className="w-full rounded-2xl border border-border bg-card px-5 py-3 pr-12 text-base text-foreground placeholder:text-muted-foreground outline-none transition focus:ring-2 focus:ring-ring"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-xl leading-none text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          ×
        </button>
      )}
    </div>
  );
}
