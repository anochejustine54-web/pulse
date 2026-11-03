
import { useState } from "react";
import { useOutletContext } from "react-router";
import Body from "../components/Body";
import { PostCard, Avatar, Heartbeat, bpmOf } from "../components/items";
import { notifyPet } from "../components/pets";

// Pictures live in the public folder. BASE_URL adds "/pulse/" on GitHub Pages.
const pic = (name) => `${import.meta.env.BASE_URL}${name}`;

export default function Home() {
  const { user } = useOutletContext();

  // Start with an empty feed instead of displaying sample posts.
  const [posts, setPosts] = useState([]);

  const [draft, setDraft] = useState("");
  const [photo, setPhoto] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [sortBy, setSortBy] = useState("new");

  // Like a post and notify the pet.
  const handleLike = (id) => {
    const target = posts.find((p) => p.id === id);

    if (target && !target.liked) {
      notifyPet("like");
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  };

  // Add a comment.
  const handleComment = (postId, text) => {
    notifyPet("comment");

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              commentList: [
                ...p.commentList,
                {
                  id: Date.now(),
                  author: user,
                  text,
                  time: "Just now",
                },
              ],
            }
          : p
      )
    );
  };

  // Delete a comment.
  const handleDeleteComment = (postId, commentId) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              commentList: p.commentList.filter(
                (c) => c.id !== commentId
              ),
            }
          : p
      )
    );

  // Handle photo selection.
  const handleFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError(
        "Please choose an image file (JPG, PNG, GIF or WebP)."
      );
    } else if (file.size > 5 * 1024 * 1024) {
      setUploadError(
        "That picture is over 5 MB. Please choose a smaller one."
      );
    } else {
      setUploadError("");
      setPhoto(URL.createObjectURL(file));
    }

    e.target.value = "";
  };

  // Only the owner can delete a post.
  const handleDelete = (id) => {
    const target = posts.find((p) => p.id === id);

    if (!target || target.author !== user) return;

    if (!window.confirm("Delete this post?")) return;

    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  // Create a new post.
  const handlePost = (e) => {
    e.preventDefault();

    if (!draft.trim() && !photo) return;

    const newPost = {
      id: Date.now(),
      author: user,
      time: "Just now",
      hoursOld: 0,
      text: draft.trim(),
      image: "",
      photo,
      likes: 0,
      liked: false,
      commentList: [],
    };

    setPosts((prev) => [newPost, ...prev]);

    notifyPet("post");

    setDraft("");
    setPhoto("");
  };

  // Sort posts.
  const shownPosts =
    sortBy === "beat"
      ? [...posts].sort((a, b) => bpmOf(b) - bpmOf(a))
      : posts;

  // Calculate average feed heartbeat.
  const feedBpm = posts.length
    ? Math.round(
        posts.reduce((sum, p) => sum + bpmOf(p), 0) / posts.length
      )
    : 40;

  return (
    <Body
      title="Your feed"
      subtitle="Every post has a heartbeat. Likes and comments make it race."
    >
      {/* Feed heartbeat and sorting buttons */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body flex-row flex-wrap items-center justify-between gap-3 py-3">
          <div>
            <div className="text-xs font-semibold uppercase opacity-60">
              Feed heartbeat
            </div>
            <Heartbeat bpm={feedBpm} />
          </div>

          <div className="join" role="group" aria-label="Sort posts">
            <button
              className={`btn btn-sm join-item ${
                sortBy === "new" ? "btn-primary" : ""
              }`}
              onClick={() => setSortBy("new")}
            >
              Newest
            </button>

            <button
              className={`btn btn-sm join-item ${
                sortBy === "beat" ? "btn-primary" : ""
              }`}
              onClick={() => setSortBy("beat")}
            >
              Fastest heartbeat
            </button>
          </div>
        </div>
      </div>

      {/* Create post form */}
      <form
        className="card bg-base-100 shadow-sm"
        onSubmit={handlePost}
      >
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
              <img
                className="rounded-box max-h-64 w-full object-cover"
                src={photo}
                alt="Selected"
              />

              <button
                type="button"
                className="btn btn-sm absolute top-2 right-2"
                onClick={() => setPhoto("")}
              >
                Remove
              </button>
            </div>
          )}

          {uploadError && (
            <div
              role="alert"
              className="alert alert-error alert-soft py-2 text-sm"
            >
              {uploadError}
            </div>
          )}

          <div className="flex items-center justify-between">
            <label
              htmlFor="photo"
              className="btn btn-ghost btn-sm"
            >
              📷 Add photo
            </label>

            <input
              id="photo"
              type="file"
              accept="image/*"
              hidden
              onChange={handleFile}
            />

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!draft.trim() && !photo}
            >
              Post
            </button>
          </div>
        </div>
      </form>

      {/* Display posts */}
      {shownPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          user={user}
          onLike={handleLike}
          onDelete={handleDelete}
          canDelete={post.author === user}
          onComment={handleComment}
          onDeleteComment={handleDeleteComment}
        />
      ))}

      {/* Empty feed message */}
      {posts.length === 0 && (
        <div className="card bg-base-100 p-4 opacity-70">
          No posts yet. Share something above.
        </div>
      )}
    </Body>
  );
}
