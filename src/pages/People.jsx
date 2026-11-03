// People.jsx - search people, follow them, follow back, and start a chat when you follow each other
import { useState } from "react";
import { Link, useOutletContext } from "react-router";
import Body from "../components/Body";
import { Avatar } from "../components/items";
import { ACCOUNTS, useFollows } from "../components/social";

export default function People() {
  const { user } = useOutletContext();
  const { following, followers, isFollowing, followsMe, toggleFollow } = useFollows(user);
  const [query, setQuery] = useState("");

  // Everyone except me whose name contains the search text
  const results = ACCOUNTS.filter(
    (name) => name !== user && name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <Body title="People" subtitle="Search for people, follow them, and chat once you follow each other.">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body gap-3 py-4">
          <div className="flex gap-6 text-sm">
            <span><strong>{followers.length}</strong> followers</span>
            <span><strong>{following.length}</strong> following</span>
          </div>
          <input
            type="search"
            className="input w-full"
            placeholder="Search people by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search people"
          />
        </div>
      </div>

      {results.map((name) => {
        const iFollow = isFollowing(name);
        const theyFollow = followsMe(name);
        const friends = iFollow && theyFollow;
        const status = friends
          ? "Friends · you follow each other"
          : theyFollow
          ? "Follows you"
          : iFollow
          ? "Following"
          : "Not following";

        return (
          <div key={name} className="card bg-base-100 shadow-sm">
            <div className="card-body flex-row flex-wrap items-center gap-3 py-3">
              <Avatar name={name} />
              <div className="min-w-0 flex-1">
                <div className="font-bold">{name}</div>
                <div className="text-xs opacity-60">{status}</div>
              </div>

              <button
                className={`btn btn-sm ${iFollow ? "btn-outline" : "btn-primary"}`}
                onClick={() => toggleFollow(name)}
                title={iFollow ? "Click to unfollow" : ""}
              >
                {iFollow ? "Following ✓" : theyFollow ? "Follow back" : "Follow"}
              </button>

              {/* Messaging unlocks when you follow each other */}
              {friends && (
                <Link to="/messages" state={{ with: name }} className="btn btn-sm btn-secondary">
                  💬 Message
                </Link>
              )}
            </div>
          </div>
        );
      })}

      {results.length === 0 && (
        <div className="card bg-base-100 p-4 opacity-70">No one found for “{query}”.</div>
      )}
    </Body>
  );
}