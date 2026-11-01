import { useCallback, useEffect, useRef, useState } from "react";
import { getPet, loadPet, savePet, lineFor } from "./pets";
import { playPetSound, isMuted, setMuted } from "./petSounds";

export default function PetAssistant({ user, onChangePet }) {
  const [info, setInfo] = useState(() => loadPet(user)); // { id, name }
  const pet = info ? getPet(info.id) : null;

  const [speech, setSpeech] = useState(null);         // text in the speech bubble
  const [alertMode, setAlertMode] = useState(false);  // true = alert pose + icon bubble
  const [hopping, setHopping] = useState(false);
  const [unread, setUnread] = useState(0);            // new messages shown on the red chat icon
  const [hidden, setHidden] = useState(false);
  const [editing, setEditing] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const timer = useRef(null);

  // The pet reacts: speaks, switches pose, jumps and uses its voice
  const trigger = useCallback(
    (type, vars = {}) => {
      if (!pet || !info) return;
      setSpeech(lineFor(pet, type, { user: user.split(" ")[0], pet: info.name, ...vars }));
      setAlertMode(type !== "touch");
      setHopping(true);
      setTimeout(() => setHopping(false), 500);
      if (type === "message") {
        setUnread((n) => n + 1);
        setHidden(false);
      }
      playPetSound(pet.sound);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setSpeech(null);
        setAlertMode(false);
      }, 5000);
    },
    [pet, info, user]
  );

  // Say hello once when the pet appears
  useEffect(() => {
    const t = setTimeout(() => trigger("greet"), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Other pages call notifyPet("post" | "like" | "comment")
  useEffect(() => {
    const onPet = (e) => trigger(e.detail.type, e.detail.vars);
    window.addEventListener("pulse-pet", onPet);
    return () => window.removeEventListener("pulse-pet", onPet);
  }, [trigger]);

  // A message sent from another tab (another account) to you
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== "pulse-chats" || !e.newValue) return;
      try {
        const next = JSON.parse(e.newValue);
        const prev = e.oldValue ? JSON.parse(e.oldValue) : {};
        Object.keys(next).forEach((key) => {
          if (!key.split("|").includes(user)) return;
          const added = next[key].slice(prev[key]?.length ?? 0);
          const incoming = added.filter((m) => m.from !== user).pop();
          if (incoming) trigger("message", { who: incoming.from.split(" ")[0] });
        });
      } catch {
        /* ignore unreadable data */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [trigger, user]);

  if (!pet || !info) return null;

  // Touching the pet: it makes its sound. The bird gives a tip.
  const touch = () => {
    setUnread(0);
    trigger(pet.id === "bird" ? "tip" : "touch");
  };

  const saveName = (value) => {
    const next = { ...info, name: value.trim() || pet.defaultName };
    setInfo(next);
    savePet(user, next);
    setEditing(false);
  };

  const toggleMute = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };

  if (hidden) {
    return (
      <button
        className="btn btn-circle btn-primary fixed bottom-4 right-4 z-40 shadow-lg"
        onClick={() => setHidden(false)}
        aria-label={`Show ${info.name}`}
      >
        🐾
      </button>
    );
  }

  return (
    <div className="fixed bottom-3 right-3 z-40 flex max-w-[16rem] flex-col items-end gap-1 select-none sm:bottom-5 sm:right-5">
      {speech && (
        <div role="status" className="bubble-pop relative rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-stone-800 shadow-lg">
          {speech}
          <span className="absolute -bottom-1.5 right-10 size-3 rotate-45 border-b border-r border-amber-300 bg-amber-50"></span>
        </div>
      )}

      <div className="relative">
        {/* Red chat icon with the unread count (the pet sits in front of it) */}
        {unread > 0 && (
          <span className="absolute -left-5 bottom-3 grid size-14 place-items-center rounded-2xl bg-red-500 text-2xl shadow-lg" aria-label={`${unread} new messages`}>
            💬
            <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border-2 border-white bg-red-700 text-xs font-bold text-white">{unread}</span>
          </span>
        )}

        {/* Alert icon: bell for the dog, envelope for the cat, light bulb for the bird */}
        {alertMode && (
          <span className="bubble-pop absolute -left-3 -top-3 z-20 grid size-10 place-items-center rounded-full border border-base-300 bg-base-100 text-xl shadow-lg" aria-hidden="true">
            {pet.icon}
          </span>
        )}

        <button type="button" onClick={touch} aria-label={`Touch ${info.name} the ${pet.breed}`} className="relative z-10 block cursor-pointer">
          <img
            src={alertMode ? pet.alert : pet.rest}
            alt=""
            className={`w-24 drop-shadow-xl sm:w-32 ${hopping ? "pet-hop" : "pet-float"}`}
          />
        </button>
        <div className="mx-auto h-2 w-16 rounded-full bg-black/20 blur-[2px]"></div>
      </div>

      {/* Name tag (tap to rename), mute, change pet, hide */}
      <div className="flex items-center gap-1">
        {editing ? (
          <input
            className="input input-xs w-28"
            defaultValue={info.name}
            maxLength={14}
            autoFocus
            aria-label="Pet name"
            onBlur={(e) => saveName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          />
        ) : (
          <button type="button" className="badge badge-neutral cursor-pointer gap-1" onClick={() => setEditing(true)} title="Rename">
            {info.name} ✎
          </button>
        )}
        <button type="button" className="btn btn-circle btn-xs" onClick={toggleMute} aria-label={muted ? "Unmute pet" : "Mute pet"}>
          {muted ? "🔇" : "🔊"}
        </button>
        <button type="button" className="btn btn-xs" onClick={onChangePet}>Change</button>
        <button type="button" className="btn btn-circle btn-xs" onClick={() => setHidden(true)} aria-label="Hide pet">–</button>
      </div>
    </div>
  );
}