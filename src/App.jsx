
import { Routes, Route } from "react-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "./firebase";

import Layout from "./components/Layout";
import AuthScreen from "./components/AuthScreen";
import Splash from "./components/Splash";
import PetPicker from "./components/PetPicker";
import PetAssistant from "./components/PetAssistant";

import Home from "./pages/Home";
import People from "./pages/People";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

import "./App.css";

const DEMO_USERS = [
  "Justine James Bag-ao",
  "Shinely Casal",
  "Ma. Elizabeth Ann Sido",
];

const DEMO_SESSION_KEY = "pulse-demo-user";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState("");
  const [petReady, setPetReady] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Listen for Firebase authentication changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        const demoUser = sessionStorage.getItem(
          DEMO_SESSION_KEY
        );

        if (
          demoUser &&
          DEMO_USERS.includes(demoUser)
        ) {
          setUser(demoUser);
        } else if (firebaseUser) {
          // Only allow accounts with a linked
          // email/password provider into Pulse.
          const hasPassword = firebaseUser.providerData.some(
            (provider) =>
              provider.providerId === "password"
          );

          if (hasPassword) {
            sessionStorage.removeItem(
              DEMO_SESSION_KEY
            );

            setUser(
              firebaseUser.displayName ||
              firebaseUser.email ||
              ""
            );
          } else {
            // Google authentication succeeded,
            // but the user still needs to create
            // a separate Pulse password.
            setUser("");
          }
        } else {
          setUser("");
        }

        setAuthChecked(true);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle successful login and logout.
  const handleUser = (name) => {
    if (!name) {
      sessionStorage.removeItem(
        DEMO_SESSION_KEY
      );

      setUser("");
      setPetReady(false);

      signOut(auth).catch((error) => {
        console.error("Logout error:", error);
      });

      return;
    }

    if (DEMO_USERS.includes(name)) {
      sessionStorage.setItem(
        DEMO_SESSION_KEY,
        name
      );
    } else {
      sessionStorage.removeItem(
        DEMO_SESSION_KEY
      );
    }

    setUser(name);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (showSplash) {
    return (
      <Splash
        onDone={() => setShowSplash(false)}
      />
    );
  }

  if (!user) {
    return (
      <AuthScreen onSuccess={handleUser} />
    );
  }

  if (!petReady) {
    return (
      <PetPicker
        user={user}
        onConfirm={() => setPetReady(true)}
      />
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              user={user}
              setUser={handleUser}
            />
          }
        >
          <Route index element={<Home />} />
          <Route
            path="people"
            element={<People />}
          />
          <Route
            path="messages"
            element={<Messages />}
          />
          <Route
            path="profile"
            element={<Profile />}
          />
          <Route
            path="*"
            element={<NotFound />}
          />
        </Route>
      </Routes>

      <PetAssistant
        user={user}
        onChangePet={() => setPetReady(false)}
      />
    </>
  );
}
