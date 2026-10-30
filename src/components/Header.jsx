import { useState } from "react";
import { Link } from "react-router";
import Navigation from "./navigation";
import { Avatar } from "./items";

const themes = ["light", "dark", "cupcake", "emerald"];

export default function Header({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <header className="navbar bg-base-100 shadow-sm sticky top-0 z-50 px-4">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl font-extrabold text-primary" onClick={close}>
          <span className="status status-error animate-pulse" aria-hidden="true"></span>
          Pulse
        </Link>
      </div>

      {/* Wide screens: links in a row */}
      <nav className="navbar-center hidden md:flex" aria-label="Main">
        <Navigation className="menu menu-horizontal gap-1" />
      </nav>

      <div className="navbar-end gap-2">
        {/* Theme picker */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
            🎨<span className="hidden sm:inline">Theme</span>
          </div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-10 w-40 p-2 shadow-lg">
            {themes.map((t) => (
              <li key={t}>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block btn-ghost justify-start capitalize"
                  aria-label={t}
                  value={t}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Wide screens: user and log out */}
        <div className="hidden md:flex items-center gap-2">
          <Avatar name={user} size="small" />
          <span className="font-semibold text-sm">{user}</span>
          <button className="btn btn-outline btn-error btn-sm" onClick={onLogout}>Log out</button>
        </div>

        {/* Small screens: burger button */}
        <button
          className="btn btn-square btn-ghost md:hidden text-xl"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Small screens: dropdown panel */}
      {menuOpen && (
        <div className="absolute right-4 top-full mt-1 w-64 rounded-box bg-base-100 p-3 shadow-lg md:hidden">
          <div className="flex items-center gap-2 border-b border-base-300 pb-2">
            <Avatar name={user} size="small" />
            <span className="font-semibold">{user}</span>
          </div>
          <Navigation className="menu w-full px-0" onNavigate={close} />
          <button
            className="btn btn-outline btn-error btn-sm w-full"
            onClick={() => { close(); onLogout(); }}
          >
            Log out
          </button>
        </div>
      )}
    </header>
  );
}