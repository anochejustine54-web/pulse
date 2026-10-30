// Footer.jsx
import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="footer">
      <p>© 2026 Pulse. Share what moves you.</p>
      <p>
        <Link to="/about">About</Link> · <Link to="/messages">Messages</Link>
      </p>
    </footer>
  );
}
