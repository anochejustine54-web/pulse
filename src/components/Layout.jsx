import { Outlet } from "react-router";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ user, setUser }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onLogout={() => setUser("")} />
      <main className="flex-1 w-full max-w-4xl mx-auto p-4">
        <Outlet context={{ user, setUser }} />
      </main>
      <Footer />
    </div>
  );
}