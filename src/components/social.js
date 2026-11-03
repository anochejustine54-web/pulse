// social.js - who follows whom. Saved in the browser (localStorage) and synced between tabs.
import { useEffect, useState } from "react";

export const ACCOUNTS = ["Justine James Bag-ao", "Shinely Casal", "Ma. Elizabeth Ann Sido"];

const KEY = "pulse-follows"; // { "Shinely Casal": ["Justine James Bag-ao"], ... } = who each account follows

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
};

export function useFollows(user) {
  const [follows, setFollows] = useState(read);

  // Another tab (another account) followed or unfollowed someone
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY) setFollows(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const following = follows[user] ?? [];                                   // people I follow
  const followers = ACCOUNTS.filter((n) => n !== user && (follows[n] ?? []).includes(user)); // people who follow me

  const isFollowing = (name) => following.includes(name);
  const followsMe = (name) => followers.includes(name);

  // People who follow each other can message each other
  const friends = ACCOUNTS.filter((n) => n !== user && isFollowing(n) && followsMe(n));

  // Follow or unfollow. Always start from the latest saved data so other tabs are not overwritten.
  const toggleFollow = (name) => {
    const latest = read();
    const mine = latest[user] ?? [];
    const next = { ...latest, [user]: mine.includes(name) ? mine.filter((n) => n !== name) : [...mine, name] };
    setFollows(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  return { following, followers, friends, isFollowing, followsMe, toggleFollow };
}