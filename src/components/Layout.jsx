// Layout.jsx - parent route. Header and Footer show on every page,
// and <Outlet /> is where the matching child page appears.
import { Outlet } from "react-router";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ user, setUser }) {
  return (
    <div className="app-shell">
      <Header user={user} onLogout={() => setUser("")} />
      <main className="main">
        {/* Child pages can read user/setUser with useOutletContext() */}
        <Outlet context={{ user, setUser }} />
      </main>
      <Footer />
    </div>
  );
}
