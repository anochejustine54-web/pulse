// Messages.jsx - chat with the people you follow each other with.
// Send text, photos, videos and files; react with emojis; delete your own messages.
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useOutletContext } from "react-router";
import Body from "../components/Body";
import { ContactItem, Avatar } from "../components/items";
import MessageBubble from "../components/MessageBubble";
import { useFollows } from "../components/social";
import { saveFile, deleteFile } from "../components/fileStore";

const STORAGE_KEY = "pulse-chats-v2";
const MAX_FILE = 25 * 1024 * 1024; // 25 MB

// Both people share ONE key (names sorted), so each sees the same chat
const chatKey = (a, b) => [a, b].sort().join("|");

const loadChats = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
};

const timeNow = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function Messages() {
  const { user } = useOutletContext();
  const { friends } = useFollows(user); // people who follow me and I follow back
  const requested = useLocation().state?.with ?? ""; // set by the "Message" button on the People page

  const [chats, setChats] = useState(loadChats); // { "A|B": [messages] }
  const [pickedName, setPickedName] = useState(requested);
  const [mobileChat, setMobileChat] = useState(Boolean(requested)); // true = show conversation on phones
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  const activeName = friends.includes(pickedName) ? pickedName : friends[0] ?? "";
  const key = activeName ? chatKey(user, activeName) : "";
  const conversation = chats[key] ?? [];

  // Save every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch {
      /* storage unavailable */
    }
  }, [chats]);

  // Another tab (another account) sent, reacted or deleted
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) setChats(JSON.parse(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Scroll to the newest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.length, activeName]);

  // Add a message to one conversation (a NEW array each time)
  const addMessage = (targetKey, extra) => {
    const message = {
      id: Date.now(),
      from: user,
      text: "",
      time: timeNow(),
      reactions: {}, // { "👍": ["Shinely Casal"], ... }
      attachment: null, // { id, kind, name, size }
      deleted: false,
      ...extra,
    };
    setChats((prev) => ({ ...prev, [targetKey]: [...(prev[targetKey] ?? []), message] }));
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeName) return;
    addMessage(key, { text: text.trim() });
    setText("");
  };

  // Send a photo, video or any file (kept in IndexedDB, only its id goes in the message)
  const handleFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file || !activeName) return;
    if (file.size > MAX_FILE) {
      setError("That file is over 25 MB. Please choose a smaller one.");
      return;
    }
    setError("");
    setSending(true);
    const sendKey = key;
    try {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await saveFile(id, file);
      const kind = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file";
      addMessage(sendKey, { text: text.trim(), attachment: { id, kind, name: file.name, size: file.size } });
      setText("");
    } catch {
      setError("Could not send that file. Please try another one.");
    }
    setSending(false);
  };

  // Change one message inside the current conversation
  const updateMessage = (id, change) =>
    setChats((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).map((m) => (m.id === id ? change(m) : m)),
    }));

  // Add my emoji, or remove it if I already used it (toggle)
  const handleReact = (id, emoji) =>
    updateMessage(id, (m) => {
      const users = m.reactions?.[emoji] ?? [];
      const nextUsers = users.includes(user) ? users.filter((u) => u !== user) : [...users, user];
      const reactions = { ...m.reactions };
      if (nextUsers.length) reactions[emoji] = nextUsers;
      else delete reactions[emoji];
      return { ...m, reactions };
    });

  // Delete for everyone. Only my own messages.
  const handleDelete = (id) => {
    const target = conversation.find((m) => m.id === id);
    if (!target || target.from !== user) return;
    if (!window.confirm("Delete this message for everyone?")) return;
    if (target.attachment) deleteFile(target.attachment.id).catch(() => {});
    updateMessage(id, (m) => ({ ...m, text: "", attachment: null, reactions: {}, deleted: true }));
  };

  // Contact list rows (ContactItem shows the last message as a preview)
  const preview = (name) => {
    const msgs = chats[chatKey(user, name)] ?? [];
    const last = msgs[msgs.length - 1];
    if (!last) return "Say hi 👋";
    if (last.deleted) return "🚫 Message deleted";
    return last.text || `📎 ${last.attachment?.name ?? "Attachment"}`;
  };
  const contacts = friends.map((name) => ({ id: name, name, online: true, messages: [{ text: preview(name) }] }));

  // Nobody to chat with yet
  if (friends.length === 0) {
    return (
      <Body title="Messages" subtitle="Chat with people you follow each other with.">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body items-start gap-3">
            <p>You can message someone after you follow each other.</p>
            <p className="text-sm opacity-70">Follow a person, then wait for them to follow you back (or follow back when they follow you).</p>
            <Link to="/people" className="btn btn-primary">Find people</Link>
          </div>
        </div>
      </Body>
    );
  }

  return (
    <Body title="Messages" subtitle="Photos, videos, files and emoji reactions.">
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        {/* Contacts (hidden on phones while a chat is open) */}
        <ul className={`menu bg-base-100 rounded-box w-full shadow-sm ${mobileChat ? "hidden" : "block"} md:block`}>
          {contacts.map((c) => (
            <ContactItem
              key={c.id}
              chat={c}
              active={c.name === activeName}
              onSelect={() => {
                setPickedName(c.name);
                setMobileChat(true);
              }}
            />
          ))}
        </ul>

        {/* Conversation */}
        <div className={`card bg-base-100 h-128 overflow-hidden shadow-sm ${mobileChat ? "flex" : "hidden"} md:flex`}>
          <div className="flex items-center gap-3 border-b border-base-300 p-3">
            <button className="btn btn-ghost btn-sm md:hidden" onClick={() => setMobileChat(false)} aria-label="Back to contacts">←</button>
            <Avatar name={activeName} online />
            <div>
              <div className="font-bold">{activeName}</div>
              <div className="text-xs opacity-60">Friends · press and hold a message to react</div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-base-200/60 p-4">
            {conversation.length === 0 && <p className="text-sm opacity-60">No messages yet. Say hi!</p>}
            {conversation.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                mine={m.from === user}
                user={user}
                onReact={handleReact}
                onDelete={handleDelete}
              />
            ))}
            <div ref={endRef}></div>
          </div>

          {error && <div role="alert" className="alert alert-error alert-soft mx-3 mb-1 py-2 text-sm">{error}</div>}

          <form className="flex items-center gap-2 border-t border-base-300 p-3" onSubmit={handleSend}>
            <label htmlFor="chat-file" className="btn btn-ghost btn-circle" title="Send a photo, video or file" aria-label="Attach a file">📎</label>
            <input id="chat-file" type="file" hidden onChange={handleFile} />
            <input
              className="input w-full"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Message ${activeName}`}
              aria-label="Message"
            />
            <button type="submit" className="btn btn-primary" disabled={!text.trim() || sending}>
              {sending ? "..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </Body>
  );
}