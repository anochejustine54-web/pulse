// navigation.jsx
import { NavLink } from "react-router";

export default function Navigation({ onNavigate }) {
  return (
    <ul className="nav-links">
      <li><NavLink to="/" end onClick={onNavigate}>Home</NavLink></li>
      <li><NavLink to="/messages" onClick={onNavigate}>Messages</NavLink></li>
      <li><NavLink to="/profile" onClick={onNavigate}>Profile</NavLink></li>
      <li><NavLink to="/about" onClick={onNavigate}>About</NavLink></li>
    </ul>
  );
}