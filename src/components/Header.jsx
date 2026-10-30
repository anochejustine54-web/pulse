// Header.jsx - logo, burger button, links and log out
import { useState } from "react";
import { Link } from "react-router";
import Navigation from "./navigation";
import { Avatar } from "./items";

export default function Header({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout(); // sets user back to "", so App shows the sign up form again
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-dot" aria-hidden="true"></span>Pulse
        </Link>

        <button
          className="burger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav ${menuOpen ? "open" : ""}`} aria-label="Main">
          <div className="user-chip">
            <Avatar name={user} size="small" />
            <span>{user}</span>
          </div>
          <Navigation onNavigate={() => setMenuOpen(false)} />
          <button className="ghost logout" onClick={handleLogout}>Log out</button>
        </nav>
      </div>
    </header>
  );
}