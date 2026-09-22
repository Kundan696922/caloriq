export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-8 text-center sm:px-6">
        <p className="text-xs text-text-secondary">
          © {new Date().getFullYear()} Calor
          <span className="text-accent">iq</span>. Estimates only, not medical
          advice.
        </p>
      </div>
    </footer>
  );
}
