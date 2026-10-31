// Home.jsx - the Heartbeat Feed. Every post has a live BPM; sort by newest or fastest heartbeat.
import { useState } from "react";
import { useOutletContext } from "react-router";
import Body from "../components/Body";
import { PostCard, Avatar, Heartbeat, bpmOf } from "../components/items";

// hoursOld = how old the post is (used for its heartbeat)
const samplePosts = [
  { id: 1, author: "Shinely Casal", time: "2h ago", hoursOld: 2, text: "Finished our React Router activity today. NavLink and Outlet finally make sense!", image: "linear-gradient(135deg,#0e7c86,#7fd1d6)", photo: "", likes: 24, liked: false, comments: 6 },
  { id: 2, author: "Justine James Bag-ao", time: "3h ago", hoursOld: 3, text: "Reminder: group meeting tomorrow after class. Bring your laptops.", image: "", photo: "", likes: 18, liked: true, comments: 4 },
  { id: 3, author: "Ma. Elizabeth Ann Sido", time: "5h ago", hoursOld: 5, text: "Sunset after the seminar was unreal. Sharing a little calm for your feed.", image: "linear-gradient(135deg,#ff5a5f,#ffc371)", photo: "", likes: 41, liked: false, comments: 9 },
];

export default function Home() {
  const { user } = useOutletContext();
  const [posts, setPosts] = useState(samplePosts);
  const [draft, setDraft] = useState("");
  const [photo, setPhoto] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [sortBy, setSortBy] = useState("new"); // "new" or "beat"

  // map() returns a NEW array with the liked post updated
  const handleLike = (id) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file (JPG, PNG, GIF or WebP).");
    } else if (file.size > 5 * 1024 * 1024) {
      setUploadError("That picture is over 5 MB. Please choose a smaller one.");
    } else {
      setUploadError("");
      setPhoto(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  // Only the owner can delete. filter() returns a NEW array without the post.
  const handleDelete = (id) => {
    const target = posts.find((p) => p.id === id);
    if (!target || target.author !== user) return;
    if (!window.confirm("Delete this post?")) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePost = (e) => {
    e.preventDefault();
    if (!draft.trim() && !photo) return;
    const newPost = { id: Date.now(), author: user, time: "Just now", hoursOld: 0, text: draft.trim(), image: "", photo, likes: 0, liked: false, comments: 0 };
    setPosts((prev) => [newPost, ...prev]); // new post on top
    setDraft("");
    setPhoto("");
  };

  // "Fastest heartbeat" sorts a COPY of the array by BPM (highest first)
  const shownPosts = sortBy === "beat" ? [...posts].sort((a, b) => bpmOf(b) - bpmOf(a)) : posts;

  // Average heartbeat of the whole feed
  const feedBpm = posts.length ? Math.round(posts.reduce((sum, p) => sum + bpmOf(p), 0) / posts.length) : 40;

  return (
    <Body title="Your feed" subtitle="Every post has a heartbeat. Likes and comments make it race.">
      {/* Feed heartbeat + sort buttons */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body flex-row flex-wrap items-center justify-between gap-3 py-3">
          <div>
            <div className="text-xs font-semibold uppercase opacity-60">Feed heartbeat</div>
            <Heartbeat bpm={feedBpm} />
          </div>
          <div className="join" role="group" aria-label="Sort posts">
            <button className={`btn btn-sm join-item ${sortBy === "new" ? "btn-primary" : ""}`} onClick={() => setSortBy("new")}>Newest</button>
            <button className={`btn btn-sm join-item ${sortBy === "beat" ? "btn-primary" : ""}`} onClick={() => setSortBy("beat")}>Fastest heartbeat</button>
          </div>
        </div>
      </div>

      <form className="card bg-base-100 shadow-sm" onSubmit={handlePost}>
        <div className="card-body gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={user} />
            <input
              className="input w-full"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's on your mind?"
              aria-label="Write a post"
            />
          </div>

          {photo && (
            <div className="relative">
              <img className="rounded-box max-h-64 w-full object-cover" src={photo} alt="Selected" />
              <button type="button" className="btn btn-sm absolute top-2 right-2" onClick={() => setPhoto("")}>Remove</button>
            </div>
          )}
          {uploadError && <div role="alert" className="alert alert-error alert-soft py-2 text-sm">{uploadError}</div>}

          <div className="flex items-center justify-between">
            <label htmlFor="photo" className="btn btn-ghost btn-sm">📷 Add photo</label>
            <input id="photo" type="file" accept="image/*" hidden onChange={handleFile} />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim() && !photo}>Post</button>
          </div>
        </div>
      </form>

      {shownPosts.map((post) => (
        <PostCard key={post.id} post={post} onLike={handleLike} onDelete={handleDelete} canDelete={post.author === user} />
      ))}

      {posts.length === 0 && <div className="card bg-base-100 p-4 opacity-70">No posts yet. Share something above.</div>}
    </Body>
  );
}