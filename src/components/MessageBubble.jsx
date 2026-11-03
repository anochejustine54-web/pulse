// MessageBubble.jsx - one chat message: text, photo/video/file, emoji reactions,
// a "..." button and long press (or right click) to react or delete.
import { useEffect, useRef, useState } from "react";
import { getFile } from "./fileStore";

export const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

// Loads the saved file from IndexedDB and shows it as a picture, video or download link
function Attachment({ att }) {
  const [url, setUrl] = useState("");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    getFile(att.id)
      .then((blob) => {
        if (!active) return;
        if (!blob) return setMissing(true);
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => active && setMissing(true));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [att.id]);

  if (missing) return <p className="text-sm italic opacity-70">📎 {att.name} (file not available on this device)</p>;
  if (!url) return <p className="text-sm opacity-70">Loading {att.name}…</p>;
  if (att.kind === "image") return <img src={url} alt={att.name} className="mb-1 max-h-64 rounded-xl" />;
  if (att.kind === "video") return <video src={url} controls className="mb-1 max-h-64 rounded-xl" />;
  return (
    <a href={url} download={att.name} className="mb-1 flex items-center gap-2 underline">
      <span aria-hidden="true">📎</span>
      <span className="break-all">{att.name}</span>
      <span className="text-xs opacity-70">({formatSize(att.size)})</span>
    </a>
  );
}

export default function MessageBubble({ message, mine, user, onReact, onDelete }) {
  const [menu, setMenu] = useState(false); // true = the reaction / delete window is open
  const pressTimer = useRef(null);

  // Long press (about half a second) opens the menu
  const startPress = () => {
    pressTimer.current = setTimeout(() => setMenu(true), 450);
  };
  const endPress = () => clearTimeout(pressTimer.current);

  // Deleted messages leave a small note instead of the content
  if (message.deleted) {
    return (
      <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
        <div className="rounded-2xl border border-dashed border-base-300 px-3 py-2 text-sm italic opacity-60">
          🚫 {mine ? "You deleted this message" : "This message was deleted"}
        </div>
      </div>
    );
  }

  const reactions = Object.entries(message.reactions ?? {});

  return (
    <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      <div className={`group flex max-w-full items-center gap-1 ${mine ? "flex-row-reverse" : ""}`}>
        {/* The message itself */}
        <div
          className={`max-w-[72vw] select-none rounded-2xl px-3 py-2 sm:max-w-md [-webkit-touch-callout:none] ${
            mine ? "bg-primary text-primary-content" : "border border-base-300 bg-base-100"
          }`}
          onPointerDown={startPress}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onPointerCancel={endPress}
          onContextMenu={(e) => {
            e.preventDefault();
            setMenu(true);
          }}
        >
          {message.attachment && <Attachment att={message.attachment} />}
          {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
        </div>

        {/* Three dots next to the message */}
        <button
          type="button"
          className="btn btn-ghost btn-circle btn-xs opacity-60 hover:opacity-100"
          onClick={() => setMenu(true)}
          aria-label="Message options"
        >
          ⋯
        </button>
      </div>

      {/* Reactions (tap one to add or remove yours) and the time */}
      <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs">
        {reactions.map(([emoji, users]) => (
          <button
            key={emoji}
            type="button"
            title={users.join(", ")}
            onClick={() => onReact(message.id, emoji)}
            className={`btn btn-xs rounded-full ${users.includes(user) ? "btn-primary btn-soft" : "btn-ghost"}`}
          >
            {emoji} {users.length}
          </button>
        ))}
        <span className="opacity-60">{message.time}</span>
      </div>

      {/* Reaction + delete window */}
      {menu && (
        <div className="fixed inset-0 z-60 grid place-items-center bg-black/40 p-4" onClick={() => setMenu(false)}>
          <div
            className="card w-full max-w-xs bg-base-100 shadow-2xl"
            role="dialog"
            aria-label="Message options"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-body gap-3">
              <p className="text-sm font-semibold">React to this message</p>
              <div className="flex flex-wrap justify-between gap-1">
                {EMOJIS.map((emoji) => {
                  const active = message.reactions?.[emoji]?.includes(user);
                  return (
                    <button
                      key={emoji}
                      type="button"
                      className={`btn btn-circle text-xl ${active ? "btn-primary" : "btn-ghost"}`}
                      aria-pressed={!!active}
                      aria-label={`React with ${emoji}`}
                      onClick={() => {
                        onReact(message.id, emoji);
                        setMenu(false);
                      }}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs opacity-60">Tap an emoji again to remove your reaction.</p>

              {/* Only the sender can delete */}
              {mine && (
                <button
                  type="button"
                  className="btn btn-outline btn-error btn-sm"
                  onClick={() => {
                    setMenu(false);
                    onDelete(message.id);
                  }}
                >
                  🗑 Delete message
                </button>
              )}
              <button type="button" className="btn btn-sm" onClick={() => setMenu(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}