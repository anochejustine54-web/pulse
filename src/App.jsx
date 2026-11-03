// App.jsx - logo intro, then sign in, then the PET TABLE, then the real app.
import { Routes, Route } from "react-router";
import { useState } from "react";
import Layout from "./components/Layout";
import AuthScreen from "./components/AuthScreen";
import Splash from "./components/Splash";
import PetPicker from "./components/PetPicker";
import PetAssistant from "./components/PetAssistant";
import Home from "./pages/Home";
import People from "./pages/People";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import "./App.css";

export default function App() {
  const [showSplash, setShowSplash] = useState(true); // true = intro is playing
  const [user, setUser] = useState("");                // "" = signed out
  const [petReady, setPetReady] = useState(false);     // true after the pet is confirmed

  // Logging out also sends the account back to the pet table at the next sign-in
  const handleUser = (name) => {
    setUser(name);
    if (!name) setPetReady(false);
  };

  if (showSplash) return <Splash onDone={() => setShowSplash(false)} />;
  if (!user) return <AuthScreen onSuccess={handleUser} />;
  if (!petReady) return <PetPicker user={user} onConfirm={() => setPetReady(true)} />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout user={user} setUser={handleUser} />}>
          <Route index element={<Home />} />
          <Route path="people" element={<People />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <PetAssistant user={user} onChangePet={() => setPetReady(false)} />
    </>
  );
}