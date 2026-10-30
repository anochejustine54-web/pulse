// Messages.jsx - real conversations between the three Pulse accounts.
// Chats are saved in the browser (localStorage), so they survive a refresh,
// and a second tab signed in as another account sees new messages live.
import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import Body from "../components/Body";
import { ChatMessage, ContactItem, Avatar } from "../components/items";

const JUSTINE = "Justine James Bag-ao";
const SHINELY = "Shinely Casal";
const ELIZABETH = "Ma. Elizabeth Ann Sido";
const accounts = [JUSTINE, SHINELY, ELIZABETH];

const STORAGE_KEY = "pulse-chats";

// Both people in a conversation share ONE key (names sorted), so what
// Justine sends to Shinely is the same chat Shinely sees with Justine.
const chatKey = (a, b) => [a, b].sort().join("|");

// Starter conversations so the page is never empty
const seedChats = {
  [chatKey(JUSTINE, SHINELY)]: [
    { id: 1, from: SHINELY, text: "Hi! Did you finish the Layout part?", time: "9:02 AM" },
    { id: 2, from: JUSTINE, text: "Yes! Header and Footer are done.", time: "9:04 AM" },
    { id: 3, from: SHINELY, text: "Nice. How did you do the burger menu?", time: "9:05 AM" },
    { id: 4, from: JUSTINE, text: "A true/false useState toggles an open class.", time: "9:07 AM" },
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

// Read saved chats, or fall back to the starter chats
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
  const { user } = useOutletContext(); // the signed-in account
  const others = accounts.filter((name) => name !== user); // people you can chat with

  const [chats, setChats] = useState(loadChats); // { "A|B": [messages] }
  const [activeName, setActiveName] = useState(others[0]);
  const [mobileChat, setMobileChat] = useState(false); // true = show conversation on phones
  const [text, setText] = useState("");
  const endRef = useRef(null);

  const key = chatKey(user, activeName);
  const conversation = chats[key] ?? [];

  // Save every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch {
      /* storage unavailable: chats just won't persist */
    }
  }, [chats]);

  // If another tab (signed in as someone else) sends a message, show it here
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

  const handleSend = (e) => {
    e.preventDefault(); // pressing Enter submits the form
    if (!text.trim()) return;
    const message = { id: Date.now(), from: user, text: text.trim(), time: timeNow() };
    // New array: copy old messages, add the new one at the end
    setChats((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), message] }));
    setText("");
  };

  // Contact list entries (ContactItem shows the last message as a preview)
  const contacts = others.map((name) => {
    const msgs = chats[chatKey(user, name)] ?? [];
    return {
      id: name,
      name,
      online: true,
      messages: msgs.length ? msgs : [{ text: "Say hi 👋" }],
    };
  });

  return (
    <Body title="Messages" subtitle="Chat with the other Pulse accounts.">
      <div className={`chat ${mobileChat ? "show-convo" : ""}`}>
        <aside className="chat-list card">
          {contacts.map((c) => (
            <ContactItem
              key={c.id}
              chat={c}
              active={c.name === activeName}
              onSelect={() => {
                setActiveName(c.name);
                setMobileChat(true);
              }}
            />
          ))}
        </aside>

        <div className="chat-convo card">
          <div className="convo-head">
            <button className="ghost back" onClick={() => setMobileChat(false)} aria-label="Back to contacts">←</button>
            <Avatar name={activeName} />
            <div>
              <strong>{activeName}</strong>
              <div className="muted">Online</div>
            </div>
          </div>

          <div className="convo-body">
            {conversation.length === 0 && <p className="muted">No messages yet. Say hi!</p>}
            {conversation.map((m) => (
              // "me" = sent by the signed-in account, "them" = the other person
              <ChatMessage key={m.id} message={{ ...m, from: m.from === user ? "me" : "them" }} />
            ))}
            <div ref={endRef}></div>
          </div>

          <form className="convo-input" onSubmit={handleSend}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Message ${activeName}`}
              aria-label="Message"
            />
            <button type="submit" className="primary" disabled={!text.trim()}>Send</button>
          </form>
        </div>
      </div>
    </Body>
  );
}