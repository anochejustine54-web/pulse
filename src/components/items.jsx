// items.jsx - small reusable pieces used by the pages
import { useAvatars } from "./avatars";

// Shows the profile picture if the account has one, otherwise the first letter
export const Avatar = ({ name, size = "" }) => {
  const { avatars } = useAvatars();
  const picture = avatars[name];
  return (
    <span className={`avatar ${size}`} aria-hidden="true">
      {picture ? <img src={picture} alt="" /> : name.trim()[0]?.toUpperCase()}
    </span>
  );
};

export const PostCard = ({ post, onLike, onDelete, canDelete }) => (
  <article className="card post">
    <div className="post-head">
      <Avatar name={post.author} />
      <div>
        <strong>{post.author}</strong>
        <div className="muted">{post.time}</div>
      </div>

      {/* Delete button shows ONLY for the post's owner */}
      {canDelete && (
        <button className="delete-btn" onClick={() => onDelete(post.id)} aria-label="Delete post">
          🗑 Delete
        </button>
      )}
    </div>

    {post.text && <p className="post-text">{post.text}</p>}

    {/* Picture uploaded by the user */}
    {post.photo && <img className="post-photo" src={post.photo} alt="Shared by the author" />}

    {/* Sample colored banner for the demo posts */}
    {post.image && (
      <div className="post-image" style={{ background: post.image }} role="img" aria-label="Post photo"></div>
    )}

    <div className="post-actions">
      <button
        className={`like-btn ${post.liked ? "liked" : ""}`}
        onClick={() => onLike(post.id)}
        aria-pressed={post.liked}
        aria-label={post.liked ? "Unlike post" : "Like post"}
      >
        {post.liked ? "♥" : "♡"} {post.likes}
      </button>
      <span className="muted">{post.comments} comments</span>
    </div>
  </article>
);

export const ContactItem = ({ chat, active, onSelect }) => {
  const last = chat.messages[chat.messages.length - 1];
  return (
    <button className={`contact ${active ? "active" : ""}`} onClick={() => onSelect(chat.id)}>
      <span className="avatar-wrap">
        <Avatar name={chat.name} />
        {chat.online && <span className="online-dot" aria-label="Online"></span>}
      </span>
      <span className="contact-text">
        <strong>{chat.name}</strong>
        <span className="muted ellipsis">{last.text}</span>
      </span>
    </button>
  );
};

export const ChatMessage = ({ message }) => (
  <div className={`bubble-row ${message.from === "me" ? "me" : "them"}`}>
    <div className="bubble">
      <p>{message.text}</p>
      <span className="bubble-time">{message.time}</span>
    </div>
  </div>
);

const icons = { success: "✔", error: "⚠", warning: "ℹ" };

export const Toast = ({ alert, onClose }) =>
  alert.show ? (
    <div className={`toast ${alert.type}`} role="alert">
      <span aria-hidden="true">{icons[alert.type]}</span>
      <span>{alert.message}</span>
      <button onClick={onClose} aria-label="Close alert">×</button>
    </div>
  ) : null;