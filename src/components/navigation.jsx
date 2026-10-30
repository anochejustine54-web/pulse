import { NavLink } from "react-router";

export default function Navigation({ className = "", onNavigate }) {
  const linkClass = ({ isActive }) => (isActive ? "menu-active" : "");
  return (
    <ul className={className}>
      <li><NavLink to="/" end onClick={onNavigate} className={linkClass}>Home</NavLink></li>
      <li><NavLink to="/messages" onClick={onNavigate} className={linkClass}>Messages</NavLink></li>
      <li><NavLink to="/profile" onClick={onNavigate} className={linkClass}>Profile</NavLink></li>
      <li><NavLink to="/about" onClick={onNavigate} className={linkClass}>About</NavLink></li>
    </ul>
  );
}