// Footer.jsx
import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="footer footer-center bg-base-100 text-base-content p-4">
      <aside>
        <p>© 2026 Pulse. Share what moves you.</p>
        <p className="text-sm opacity-70">
          <Link to="/people" className="link link-hover">People</Link> ·{" "}
          <Link to="/messages" className="link link-hover">Messages</Link>
        </p>
      </aside>
    </footer>
  );
}