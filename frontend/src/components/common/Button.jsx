const VARIANTS = {
  primary: 'bg-accent hover:bg-accent-hover text-black font-semibold',
  secondary: 'bg-transparent border border-border hover:border-text-secondary text-text-primary',
  ghost: 'bg-transparent hover:bg-white/5 text-text-secondary',
};

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}
