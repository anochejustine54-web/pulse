import { useAvatars } from "./avatars";

const sizes = { "": "w-11", small: "w-8 text-xs", large: "w-28 text-4xl" };

// Profile picture if the account has one, otherwise the first letter
export const Avatar = ({ name, size = "", online = false }) => {
  const { avatars } = useAvatars();
  const picture = avatars[name];
  return (
    <div
      className={`avatar shrink-0 ${picture ? "" : "avatar-placeholder"} ${online ? "avatar-online" : ""}`}
      aria-hidden="true"
    >
      <div className={`${sizes[size]} rounded-full ${picture ? "" : "bg-primary text-primary-content"}`}>
        {picture ? <img src={picture} alt="" /> : <span>{name.trim()[0]?.toUpperCase()}</span>}
      </div>
    </div>
  );
};

export const PostCard = ({ post, onLike, onDelete, canDelete }) => (
  <article className="card bg-base-100 shadow-sm">
    <div className="card-body gap-3">
      <div className="flex items-center gap-3">
        <Avatar name={post.author} />
        <div>
          <div className="font-bold">{post.author}</div>
          <div className="text-xs opacity-60">{post.time}</div>
        </div>
        {/* Delete shows ONLY for the post's owner */}
        {canDelete && (
          <button className="btn btn-ghost btn-sm text-error ml-auto" onClick={() => onDelete(post.id)} aria-label="Delete post">
            🗑 Delete
          </button>
        )}
      </div>

      {post.text && <p>{post.text}</p>}
      {post.photo && <img className="rounded-box max-h-96 w-full object-cover" src={post.photo} alt="Shared by the author" />}
      {post.image && <div className="h-48 rounded-box" style={{ background: post.image }} role="img" aria-label="Post photo"></div>}

      <div className="flex items-center justify-between">
        <button
          className={`btn btn-sm rounded-full ${post.liked ? "btn-error btn-soft" : "btn-ghost"}`}
          onClick={() => onLike(post.id)}
          aria-pressed={post.liked}
          aria-label={post.liked ? "Unlike post" : "Like post"}
        >
          {post.liked ? "♥" : "♡"} {post.likes}
        </button>
        <span className="text-xs opacity-60">{post.comments} comments</span>
      </div>
    </div>
  </article>
);

// One row of the contacts list (rendered inside a daisyUI "menu")
export const ContactItem = ({ chat, active, onSelect }) => {
  const last = chat.messages[chat.messages.length - 1];
  return (
    <li>
      <button className={`flex items-center gap-3 ${active ? "menu-active" : ""}`} onClick={() => onSelect(chat.id)}>
        <Avatar name={chat.name} online={chat.online} />
        <span className="min-w-0 text-left">
          <span className="block font-bold truncate">{chat.name}</span>
          <span className="block text-xs opacity-60 truncate">{last.text}</span>
        </span>
      </button>
    </li>
  );
};

// daisyUI chat bubble: "me" on the right, "them" on the left
export const ChatMessage = ({ message }) => {
  const me = message.from === "me";
  return (
    <div className={`chat ${me ? "chat-end" : "chat-start"}`}>
      <div className={`chat-bubble ${me ? "chat-bubble-primary" : ""}`}>{message.text}</div>
      <div className="chat-footer text-xs opacity-60">{message.time}</div>
    </div>
  );
};

const alertClass = { success: "alert-success", error: "alert-error", warning: "alert-warning" };
const icons = { success: "✔", error: "⚠", warning: "ℹ" };

// Toast alert at the top of the screen
export const Toast = ({ alert, onClose }) =>
  alert.show ? (
    <div className="toast toast-top toast-center z-[100]">
      <div role="alert" className={`alert ${alertClass[alert.type]} shadow-lg`}>
        <span aria-hidden="true">{icons[alert.type]}</span>
        <span>{alert.message}</span>
        <button className="btn btn-ghost btn-xs" onClick={onClose} aria-label="Close alert">✕</button>
      </div>
    </div>
  ) : null;