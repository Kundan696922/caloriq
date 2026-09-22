import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const PUBLIC_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/calculators/maintenance", label: "Maintenance" },
  { to: "/calculators/goal", label: "Goal" },
  { to: "/foods", label: "Foods" },
];

const DASHBOARD_LINK = { to: "/dashboard", label: "Dashboard", end: true };

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setIsOpen(false);

  // Logged-in users get "Home" swapped for "Dashboard" — it's their home
  // base once they have an account, in the same nav slot Home occupied.
 const links = isAuthenticated
   ? [
       DASHBOARD_LINK,
       { to: "/progress", label: "Progress" },
       { to: "/meals", label: "AI Meals" },
       ...PUBLIC_LINKS.slice(1).filter(
         (link) => link.to !== "/calculators/goal",
       ),
     ]
   : PUBLIC_LINKS;

  const getInitials = (name) => {
    if (!name) return "P";

    const parts = name.trim().split(/\s+/);

    return parts
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  };

  async function handleLogout() {
    closeMenu();

    await logout();

    navigate("/", {
      replace: true,
      state: {
        toast: "Logged out successfully.",
      },
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <NavLink
          to="/"
          onClick={closeMenu}
          className="shrink-0 text-xl font-bold tracking-tight"
        >
          Calor<span className="text-accent">iq</span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-white/5 text-text-primary"
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 sm:flex">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                className="rounded-lg px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white/5"
              >
                {getInitials(user?.name) || "Profile"}
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white/5"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="inline-flex rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white/5"
              >
                Log in
              </NavLink>

              <NavLink
                to="/register"
                className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
              >
                Get Started
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-white/5 md:hidden"
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-border px-4 pb-5 md:hidden">
          <div className="flex flex-col gap-2 pt-4">
            {/* Mobile Links */}
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/5 text-text-primary"
                      : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Mobile Auth */}
            <div className="mt-3 flex flex-col gap-3 border-t border-border pt-4">
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/profile"
                    onClick={closeMenu}
                    className="flex w-full items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-white/5"
                  >
                    {getInitials(user?.name) || "Profile"}
                  </NavLink>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className="flex w-full items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-white/5"
                  >
                    Log in
                  </NavLink>

                  <NavLink
                    to="/register"
                    onClick={closeMenu}
                    className="flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
                  >
                    Get Started
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
