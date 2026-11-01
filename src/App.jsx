// App.jsx - intro, sign in, pet picking, smooth logout animation, and layout
import { Routes, Route } from "react-router";
import { useState } from "react";
import Layout from "./components/Layout";
import AuthScreen from "./components/AuthScreen";
import Splash from "./components/Splash";
import PetPicker from "./components/PetPicker";
import PetAssistant from "./components/PetAssistant";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import "./App.css";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState("");
  const [petReady, setPetReady] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Smooth log out sequence
  const handleUser = (name) => {
    if (!name) {
      setIsLoggingOut(true);
      setTimeout(() => {
        setUser("");
        setPetReady(false);
        setIsLoggingOut(false);
      }, 500);
    } else {
      setUser(name);
    }
  };

  if (showSplash) return <Splash onDone={() => setShowSplash(false)} />;

  return (
    <div className={`min-h-screen transition-all ${isLoggingOut ? "animating-logout" : ""}`}>
      {!user ? (
        <AuthScreen onSuccess={handleUser} />
      ) : !petReady ? (
        <PetPicker user={user} onConfirm={() => setPetReady(true)} />
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Layout user={user} setUser={handleUser} />}>
              <Route index element={<Home />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<Profile />} />
              <Route path="about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <PetAssistant user={user} onChangePet={() => setPetReady(false)} />
        </>
      )}
    </div>
  );
}