
import { useEffect, useState } from "react";

export const ACCOUNTS = [
  "Justine James Bag-ao",
  "Shinely Casal",
  "Ma. Elizabeth Ann Sido",
];

const KEY = "pulse-follows";

export function getAccountName(user) {
  if (typeof user === "string") return user;
  return user?.displayName || user?.email || "";
}

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function useFollows(user) {
  const currentUser = getAccountName(user);
  const [follows, setFollows] = useState(read);

  useEffect(() => {
    const refresh = (event) => {
      if (!event || event.key === KEY) {
        setFollows(read());
      }
    };

    window.addEventListener("storage", refresh);
    window.addEventListener("pulse-follows-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("pulse-follows-updated", refresh);
    };
  }, []);

  const following = follows[currentUser] || [];

  const followers = ACCOUNTS.filter(
    (name) =>
      name !== currentUser &&
      (follows[name] || []).includes(currentUser)
  );

  const isFollowing = (name) => following.includes(name);
  const followsMe = (name) => followers.includes(name);

  const friends = ACCOUNTS.filter(
    (name) =>
      name !== currentUser &&
      following.includes(name) &&
      (follows[name] || []).includes(currentUser)
  );

  function toggleFollow(name) {
    if (!currentUser || !ACCOUNTS.includes(name)) return;

    const latest = read();
    const mine = latest[currentUser] || [];

    const next = {
      ...latest,
      [currentUser]: mine.includes(name)
        ? mine.filter((person) => person !== name)
        : [...mine, name],
    };

    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setFollows(next);
      window.dispatchEvent(new Event("pulse-follows-updated"));
    } catch (error) {
      console.error("Could not save follows:", error);
    }
  }

  return {
    following,
    followers,
    friends,
    isFollowing,
    followsMe,
    toggleFollow,
  };
}
