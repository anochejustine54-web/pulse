
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router";
import Body from "../components/Body";

const ACCOUNTS = [
  "Justine James Bag-ao",
  "Shinely Casal",
  "Ma. Elizabeth Ann Sido",
];

const STORAGE_KEY = "pulse-follows";

function readFollows() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export default function People() {
  const context = useOutletContext();
  const user = context?.user;

  const currentUser =
    typeof user === "string"
      ? user
      : user?.displayName || user?.email || "";

  const [query, setQuery] = useState("");
  const [follows, setFollows] = useState(readFollows);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        setFollows(readFollows());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const following = follows[currentUser] || [];

  const followers = ACCOUNTS.filter(
    (name) =>
      name !== currentUser &&
      (follows[name] || []).includes(currentUser)
  );

  const friends = ACCOUNTS.filter(
    (name) =>
      name !== currentUser &&
      following.includes(name) &&
      (follows[name] || []).includes(currentUser)
  );

  function toggleFollow(name) {
    if (!currentUser) return;

    const latest = readFollows();
    const mine = latest[currentUser] || [];

    const updated = mine.includes(name)
      ? mine.filter((person) => person !== name)
      : [...mine, name];

    const next = {
      ...latest,
      [currentUser]: updated,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("Could not save follows:", error);
    }

    setFollows(next);
  }

  const results = ACCOUNTS.filter(
    (name) =>
      name !== currentUser &&
      name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Body
      title="People"
      subtitle="Search for people, follow them, and chat once you follow each other."
    >
      <div className="space-y-4">

        {/* Statistics */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body py-4">
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-2xl font-bold">
                  {followers.length}
                </p>
                <p className="text-sm opacity-60">Followers</p>
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {following.length}
                </p>
                <p className="text-sm opacity-60">Following</p>
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {friends.length}
                </p>
                <p className="text-sm opacity-60">Friends</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <input
          type="search"
          className="input input-bordered w-full"
          placeholder="Search people by name..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search people"
        />

        {/* Account list */}
        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((name) => {
              const isFollowing = following.includes(name);
              const followsYou = (follows[name] || []).includes(
                currentUser
              );
              const mutual = isFollowing && followsYou;

              return (
                <div
                  key={name}
                  className="card bg-base-100 shadow-sm"
                >
                  <div className="card-body flex-row items-center gap-3 p-4">

                    {/* Avatar */}
                    <div className="avatar placeholder">
                      <div className="w-12 rounded-full bg-primary text-primary-content">
                        <span className="text-lg font-bold">
                          {name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                      </div>
                    </div>

                    {/* User details */}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{name}</p>

                      <p className="text-xs opacity-60">
                        {mutual
                          ? "You follow each other"
                          : followsYou
                          ? "Follows you"
                          : isFollowing
                          ? "Following"
                          : "Pulse member"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          isFollowing
                            ? "btn-outline"
                            : "btn-primary"
                        }`}
                        onClick={() => toggleFollow(name)}
                      >
                        {isFollowing
                          ? "Following"
                          : followsYou
                          ? "Follow back"
                          : "Follow"}
                      </button>

                      {mutual && (
                        <Link
                          to="/messages"
                          className="btn btn-sm btn-primary"
                        >
                          Message
                        </Link>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card bg-base-100 p-6 text-center shadow-sm">
            <p className="opacity-60">No people found.</p>
          </div>
        )}

      </div>
    </Body>
  );
}
