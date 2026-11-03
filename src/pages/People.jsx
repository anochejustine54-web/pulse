
import { useState } from "react";
import { Link, useOutletContext } from "react-router";
import Body from "../components/Body";
import {
  ACCOUNTS,
  getAccountName,
  useFollows,
} from "../components/social";

export default function People() {
  const context = useOutletContext();
  const currentUser = getAccountName(context?.user);

  const [query, setQuery] = useState("");

  const {
    following,
    followers,
    friends,
    isFollowing,
    followsMe,
    toggleFollow,
  } = useFollows(currentUser);

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

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body py-4">
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-2xl font-bold">{followers.length}</p>
                <p className="text-sm opacity-60">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{following.length}</p>
                <p className="text-sm opacity-60">Following</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{friends.length}</p>
                <p className="text-sm opacity-60">Friends</p>
              </div>
            </div>
          </div>
        </div>

        <input
          type="search"
          className="input input-bordered w-full"
          placeholder="Search people by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((name) => {
              const followingPerson = isFollowing(name);
              const followsYou = followsMe(name);
              const mutual = followingPerson && followsYou;

              return (
                <div key={name} className="card bg-base-100 shadow-sm">
                  <div className="card-body flex-row items-center gap-3 p-4">

                    <div className="avatar placeholder">
                      <div className="w-12 rounded-full bg-primary text-primary-content">
                        <span className="font-bold">
                          {name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{name}</p>
                      <p className="text-xs opacity-60">
                        {mutual
                          ? "You follow each other"
                          : followsYou
                          ? "Follows you"
                          : followingPerson
                          ? "Following"
                          : "Pulse member"}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          followingPerson ? "btn-outline" : "btn-primary"
                        }`}
                        onClick={() => toggleFollow(name)}
                      >
                        {followingPerson
                          ? "Following"
                          : followsYou
                          ? "Follow back"
                          : "Follow"}
                      </button>

                      {mutual && (
                        <Link
                          to="/messages"
                          state={{ with: name }}
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
            No people found.
          </div>
        )}
      </div>
    </Body>
  );
}
