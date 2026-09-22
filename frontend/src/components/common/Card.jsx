export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}
