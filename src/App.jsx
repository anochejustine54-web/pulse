// App.jsx - if nobody is signed in, show ONLY the sign up form.
// After a successful sign-in, the real app (Layout + pages) appears.
import { Routes, Route } from "react-router";
import { useState } from "react";
import Layout from "./components/Layout";
import AuthScreen from "./components/AuthScreen";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(""); // "" = signed out

  if (!user) return <AuthScreen onSuccess={setUser} />;

  return (
    <Routes>
      <Route path="/" element={<Layout user={user} setUser={setUser} />}>
        <Route index element={<Home />} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}