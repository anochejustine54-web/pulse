import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import Body from "../components/Body";
import { ChatMessage, ContactItem, Avatar } from "../components/items";

const JUSTINE = "Justine James Bag-ao";
const SHINELY = "Shinely Casal";
const ELIZABETH = "Ma. Elizabeth Ann Sido";
const accounts = [JUSTINE, SHINELY, ELIZABETH];
const STORAGE_KEY = "pulse-chats";

// Both people share ONE key (names sorted), so each sees the same chat
const chatKey = (a, b) => [a, b].sort().join("|");

const seedChats = {
  [chatKey(JUSTINE, SHINELY)]: [
    { id: 1, from: SHINELY, text: "Hi! Did you finish the Layout part?", time: "9:02 AM" },
    { id: 2, from: JUSTINE, text: "Yes! Header and Footer are done.", time: "9:04 AM" },
    { id: 3, from: SHINELY, text: "Nice. How did you do the burger menu?", time: "9:05 AM" },
    { id: 4, from: JUSTINE, text: "A true/false useState toggles it.", time: "9:07 AM" },
    { id: 5, from: SHINELY, text: "That's simple. Thanks!", time: "9:08 AM" },
  ],
  [chatKey(JUSTINE, ELIZABETH)]: [
    { id: 1, from: JUSTINE, text: "Group meeting tomorrow at 1 PM.", time: "Yesterday" },
    { id: 2, from: ELIZABETH, text: "Got it. Where do we meet?", time: "Yesterday" },
    { id: 3, from: JUSTINE, text: "Library, second floor.", time: "Yesterday" },
    { id: 4, from: ELIZABETH, text: "See you there.", time: "Yesterday" },
    { id: 5, from: JUSTINE, text: "Bring the printed copy too.", time: "Yesterday" },
  ],
  [chatKey(SHINELY, ELIZABETH)]: [
    { id: 1, from: ELIZABETH, text: "Did you see the seminar photos?", time: "Mon" },
    { id: 2, from: SHINELY, text: "Yes, they came out great.", time: "Mon" },
    { id: 3, from: ELIZABETH, text: "Posting a few on Pulse tonight.", time: "Mon" },
    { id: 4, from: SHINELY, text: "Tag me please!", time: "Mon" },
    { id: 5, from: ELIZABETH, text: "Will do.", time: "Mon" },
  ],
};

const loadChats = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seedChats;
  } catch {
    return seedChats;
  }
};

const timeNow = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function Messages() {
  const { user } = useOutletContext();
  const others = accounts.filter((name) => name !== user);

  const [chats, setChats] = useState(loadChats);
  const [activeName, setActiveName] = useState(others[0]);
  const [mobileChat, setMobileChat] = useState(false); // true = show conversation on phones
  const [text, setText] = useState("");
  const endRef = useRef(null);

  const key = chatKey(user, activeName);
  const conversation = chats[key] ?? [];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch {
      /* storage unavailable */
    }
  }, [chats]);

  // Another tab (signed in as someone else) sent a message
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) setChats(JSON.parse(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.length, activeName]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const message = { id: Date.now(), from: user, text: text.trim(), time: timeNow() };
    setChats((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), message] }));
    setText("");
  };

  const contacts = others.map((name) => {
    const msgs = chats[chatKey(user, name)] ?? [];
    return { id: name, name, online: true, messages: msgs.length ? msgs : [{ text: "Say hi 👋" }] };
  });

  return (
    <Body title="Messages" subtitle="Chat with the other Pulse accounts.">
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        {/* Contacts (hidden on phones while a chat is open) */}
        <ul className={`menu bg-base-100 rounded-box w-full shadow-sm ${mobileChat ? "hidden" : "block"} md:block`}>
          {contacts.map((c) => (
            <ContactItem
              key={c.id}
              chat={c}
              active={c.name === activeName}
              onSelect={() => { setActiveName(c.name); setMobileChat(true); }}
            />
          ))}
        </ul>

        {/* Conversation */}
        <div className={`card bg-base-100 h-[32rem] overflow-hidden shadow-sm ${mobileChat ? "flex" : "hidden"} md:flex`}>
          <div className="flex items-center gap-3 border-b border-base-300 p-3">
            <button className="btn btn-ghost btn-sm md:hidden" onClick={() => setMobileChat(false)} aria-label="Back to contacts">←</button>
            <Avatar name={activeName} online />
            <div>
              <div className="font-bold">{activeName}</div>
              <div className="text-xs opacity-60">Online</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-base-200/60 p-4">
            {conversation.length === 0 && <p className="text-sm opacity-60">No messages yet. Say hi!</p>}
            {conversation.map((m) => (
              <ChatMessage key={m.id} message={{ ...m, from: m.from === user ? "me" : "them" }} />
            ))}
            <div ref={endRef}></div>
          </div>

          <form className="flex gap-2 border-t border-base-300 p-3" onSubmit={handleSend}>
            <input className="input w-full" value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${activeName}`} aria-label="Message" />
            <button type="submit" className="btn btn-primary" disabled={!text.trim()}>Send</button>
          </form>
        </div>
      </div>
    </Body>
  );
}