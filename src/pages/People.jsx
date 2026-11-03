
import { useState } from "react";
import Body from "../components/Body";

export default function People() {
  const [query, setQuery] = useState("");

  // No fake/demo accounts are displayed.
  const results = [];

  return (
    <Body
      title="People"
      subtitle="Search for people, follow them, and chat once you follow each other."
    >
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body gap-3 py-4">
          <div className="flex gap-6 text-sm">
            <span>
              <strong>0</strong> followers
            </span>
            <span>
              <strong>0</strong> following
            </span>
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

      {results.length === 0 && (
        <div className="card bg-base-100 p-4 opacity-70">
          No people available yet.
        </div>
      )}
    </Body>
  );
}
