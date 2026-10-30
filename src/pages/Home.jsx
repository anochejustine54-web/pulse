// Home.jsx - the feed. Posts are stored in an array in state.
import { useState } from "react";
import { useOutletContext } from "react-router";
import Body from "../components/Body";
import { PostCard, Avatar } from "../components/items";

const samplePosts = [
  { id: 1, author: "Shinely Casal", time: "2h ago", text: "Finished our React Router activity today. NavLink and Outlet finally make sense!", image: "linear-gradient(135deg,#0e7c86,#7fd1d6)", photo: "", likes: 24, liked: false, comments: 6 },
  { id: 2, author: "Justine James Bag-ao", time: "3h ago", text: "Reminder: group meeting tomorrow after class. Bring your laptops.", image: "", photo: "", likes: 18, liked: true, comments: 4 },
  { id: 3, author: "Ma. Elizabeth Ann Sido", time: "5h ago", text: "Sunset after the seminar was unreal. Sharing a little calm for your feed.", image: "linear-gradient(135deg,#ff5a5f,#ffc371)", photo: "", likes: 41, liked: false, comments: 9 },
  { id: 4, author: "Carlo Mendez", time: "Yesterday", text: "Anyone up for a study session this weekend? Bringing snacks.", image: "", photo: "", likes: 12, liked: false, comments: 11 },
  { id: 5, author: "Aira Villanueva", time: "Yesterday", text: "My first useState counter works. Small win, big smile.", image: "linear-gradient(135deg,#6d5dfc,#a7c5ff)", photo: "", likes: 33, liked: false, comments: 5 },
  { id: 6, author: "Noel Cabrera", time: "2 days ago", text: "Tip: never push() into state. Spread a new array instead.", image: "", photo: "", likes: 29, liked: false, comments: 7 },
];

export default function Home() {
  const { user } = useOutletContext(); // signed-in username from Layout
  const [posts, setPosts] = useState(samplePosts);
  const [draft, setDraft] = useState("");
  const [photo, setPhoto] = useState(""); // preview URL of the chosen picture
  const [uploadError, setUploadError] = useState("");

  // Toggle liked (true/false) and adjust the count. map() returns a NEW array.
  const handleLike = (id) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );

  // Runs when the user picks a file
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file (JPG, PNG, GIF or WebP).");
    } else if (file.size > 5 * 1024 * 1024) {
      setUploadError("That picture is over 5 MB. Please choose a smaller one.");
    } else {
      setUploadError("");
      setPhoto(URL.createObjectURL(file)); // temporary link to the chosen file
    }
    e.target.value = ""; // lets you pick the same file again later
  };

  const removePhoto = () => setPhoto("");

  // Only the owner can delete. filter() returns a NEW array without the post.
  const handleDelete = (id) => {
    const target = posts.find((p) => p.id === id);
    if (!target || target.author !== user) return;
    if (!window.confirm("Delete this post?")) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  // Add the new post to the TOP with a new array (never push)
  const handlePost = (e) => {
    e.preventDefault();
    if (!draft.trim() && !photo) return;
    const newPost = {
      id: Date.now(),
      author: user,
      time: "Just now",
      text: draft.trim(),
      image: "",
      photo,
      likes: 0,
      liked: false,
      comments: 0,
    };
    setPosts((prev) => [newPost, ...prev]);
    setDraft("");
    setPhoto("");
  };

  return (
    <Body title="Your feed" subtitle="See what everyone is sharing.">
      <form className="card composer" onSubmit={handlePost}>
        <div className="composer-row">
          <Avatar name={user} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What's on your mind?"
            aria-label="Write a post"
          />
        </div>

        {photo && (
          <div className="preview">
            <img src={photo} alt="Selected" />
            <button type="button" className="ghost" onClick={removePhoto}>Remove</button>
          </div>
        )}
        {uploadError && <p className="upload-error" role="alert">{uploadError}</p>}

        <div className="composer-row end">
          <label htmlFor="photo" className="ghost upload-btn">📷 Add photo</label>
          <input id="photo" type="file" accept="image/*" hidden onChange={handleFile} />
          <button type="submit" className="primary" disabled={!draft.trim() && !photo}>Post</button>
        </div>
      </form>

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onDelete={handleDelete}
          canDelete={post.author === user}
        />
      ))}

      {posts.length === 0 && (
        <p className="card muted">No posts yet. Share something above.</p>
      )}
    </Body>
  );
}