// avatars.jsx - stores each account's profile picture and shares it with every component
import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "pulse-avatars";

const AvatarContext = createContext({
  avatars: {},
  setAvatar: () => {},
  removeAvatar: () => {},
});

const loadAvatars = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
};

export function AvatarProvider({ children }) {
  const [avatars, setAvatars] = useState(loadAvatars);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(avatars));
    } catch {
      /* storage unavailable: pictures just won't persist */
    }
  }, [avatars]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setAvatars(e.newValue ? JSON.parse(e.newValue) : {});
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setAvatar = (name, dataUrl) => setAvatars((prev) => ({ ...prev, [name]: dataUrl }));

  const removeAvatar = (name) =>
    setAvatars((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });

  return (
    <AvatarContext.Provider value={{ avatars, setAvatar, removeAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
}

export const useAvatars = () => useContext(AvatarContext);