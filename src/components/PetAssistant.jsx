// PetAssistant.jsx - compact floating nametag above head, hidden settings, safe wandering, and drag-and-drop
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
  const [showSettings, setShowSettings] = useState(false); // Controls visibility of mute/change/hide settings
  const [muted, setMutedState] = useState(() => isMuted());
  const timer = useRef(null);

  // ---------- Safe Position & Dragging State ----------
  const [pos, setPos] = useState({ x: window.innerWidth - 160, y: window.innerHeight - 180 });
  const [facingLeft, setFacingLeft] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragOffset = useRef({ x: 0, y: 0 });

  // ---------- Safe Autonomous Wandering (Side Margins Only) ----------
  useEffect(() => {
    if (alertMode || unread > 0 || hidden || isDragging) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const isLeftMargin = Math.random() > 0.5;
        const nextX = isLeftMargin 
          ? Math.floor(Math.random() * (window.innerWidth * 0.12)) + 20 
          : Math.floor(Math.random() * (window.innerWidth * 0.15)) + (window.innerWidth - 220);

        const nextY = Math.floor(Math.random() * (window.innerHeight - 300)) + 100;

        setFacingLeft(nextX < pos.x);
        setIsWalking(true);
        setPos({ x: nextX, y: nextY });

        setTimeout(() => setIsWalking(false), 1800);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [pos.x, alertMode, unread, hidden, isDragging]);

  // Reset to default position when notifications arrive
  useEffect(() => {
    if ((alertMode || unread > 0) && !isDragging) {
      setPos({ x: window.innerWidth - 180, y: window.innerHeight - 180 });
      setFacingLeft(false);
    }
  }, [alertMode, unread, isDragging]);

  // ---------- Drag and Drop Handlers ----------
  const handleStartDrag = (clientX, clientY) => {
    setIsDragging(true);
    setAlertMode(false);
    dragOffset.current = {
      x: clientX - pos.x,
      y: clientY - pos.y,
    };
    setSpeech("Wheee! 💖");
    playPetSound(pet.sound);
    clearTimeout(timer.current);
  };

  const handleMoveDrag = (clientX, clientY) => {
    if (!isDragging) return;
    const newX = Math.max(10, Math.min(window.innerWidth - 120, clientX - dragOffset.current.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 150, clientY - dragOffset.current.y));
    setFacingLeft(newX < pos.x);
    setPos({ x: newX, y: newY });
  };

  const handleEndDrag = () => {
    if (isDragging) {
      setIsDragging(false);
      setSpeech("Hehe! ✨");
      timer.current = setTimeout(() => setSpeech(null), 2500);
    }
  };

  useEffect(() => {
    const onMouseMove = (e) => handleMoveDrag(e.clientX, e.clientY);
    const onMouseUp = () => handleEndDrag();

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const onTouchMove = (e) => {
      if (e.touches[0]) handleMoveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => handleEndDrag();

    if (isDragging) {
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);
    }
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging]);

  // ---------- Body Animation Helper ----------
  const getMovementAnimation = () => {
    if (isDragging) return "scale-110 rotate-12 drop-shadow-2xl";
    if (hopping) return "pet-hop";
    
    if (isWalking) {
      if (pet?.id === "bird") return "animate-bird-flap"; 
      if (pet?.id === "dog") return "animate-dog-trot";   
      if (pet?.id === "cat") return "animate-cat-prowl";   
    }
    
    return pet?.id === "bird" ? "animate-bird-flap" : "animate-breath";
  };

  // ---------- Triggers ----------
  const trigger = useCallback(
    (type, vars = {}) => {
      if (!pet || !info || isDragging) return;
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
    [pet, info, user, isDragging]
  );

  useEffect(() => {
    const t = setTimeout(() => trigger("greet"), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    const onPet = (e) => trigger(e.detail.type, e.detail.vars);
    window.addEventListener("pulse-pet", onPet);
    return () => window.removeEventListener("pulse-pet", onPet);
  }, [trigger]);

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
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [trigger, user]);

  if (!pet || !info) return null;

  const touch = () => {
    if (isDragging) return;
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
    const nextMuted = !muted;
    setMuted(nextMuted); 
    setMutedState(nextMuted);
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
    <div
      className="fixed z-40 flex max-w-[16rem] flex-col items-center select-none"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transition: isDragging ? "none" : "left 1.8s ease-in-out, top 1.8s ease-in-out",
      }}
    >
      {/* Floating Compact Nametag & Pen Button Above Head */}
      <div className="relative z-20 mb-1 flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 shadow-sm backdrop-blur-xs">
        {editing ? (
          <input
            className="input input-xs h-5 w-20 text-[10px]"
            defaultValue={info.name}
            maxLength={14}
            autoFocus
            aria-label="Pet name"
            onBlur={(e) => saveName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          />
        ) : (
          <span className="text-[11px] font-bold text-stone-700 cursor-pointer" onClick={() => setEditing(true)} title="Rename">
            {info.name}
          </span>
        )}

        <button
          type="button"
          className="btn btn-circle btn-xs btn-ghost h-4 w-4 min-h-0 text-[10px] text-stone-600 hover:bg-stone-200"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Toggle pet settings"
          title="Pet settings"
        >
          ✏️
        </button>
      </div>

      {/* Hidden Settings Panel (Pops up above head when pen is clicked) */}
      {showSettings && (
        <div className="absolute -top-9 z-30 flex items-center gap-1 rounded-lg bg-white/95 p-1 shadow-md backdrop-blur-xs animate-fade-in">
          <button
            type="button"
            className="btn btn-circle btn-xs h-5 w-5 min-h-0 text-[10px]"
            onClick={toggleMute}
            aria-label={muted ? "Unmute pet" : "Mute pet"}
            title={muted ? "Unmute sound" : "Mute sound"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            type="button"
            className="btn btn-xs h-5 min-h-0 px-1.5 text-[10px] btn-outline"
            onClick={() => { setShowSettings(false); onChangePet(); }}
            title="Choose a different pet"
          >
            Change
          </button>
          <button
            type="button"
            className="btn btn-circle btn-xs btn-ghost h-5 w-5 min-h-0 text-[10px]"
            onClick={() => { setShowSettings(false); setHidden(true); }}
            aria-label="Hide pet"
            title="Minimize pet"
          >
            –
          </button>
        </div>
      )}

      {/* Speech Bubble */}
      {speech && (
        <div
          role="status"
          className="bubble-pop absolute -top-16 z-30 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-stone-800 shadow-lg whitespace-nowrap"
          style={{ transform: facingLeft ? "scaleX(-1)" : "none" }}
        >
          <div style={{ transform: facingLeft ? "scaleX(-1)" : "none" }}>{speech}</div>
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-2.5 rotate-45 border-b border-r border-amber-300 bg-amber-50"></span>
        </div>
      )}

      {/* Pet Sprite & Notifications Container */}
      <div className="relative">
        {unread > 0 && !isDragging && (
          <span className="absolute -left-6 bottom-3 grid size-12 place-items-center rounded-2xl bg-red-500 text-xl shadow-lg z-20" aria-label={`${unread} new messages`}>
            💬
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-white bg-red-700 text-[10px] font-bold text-white">{unread}</span>
          </span>
        )}

        {alertMode && !isDragging && (
          <span className="bubble-pop absolute -left-2 -top-2 z-20 grid size-8 place-items-center rounded-full border border-base-300 bg-base-100 text-lg shadow-lg" aria-hidden="true">
            {pet.icon}
          </span>
        )}

        <button
          type="button"
          onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
          onTouchStart={(e) => e.touches[0] && handleStartDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onClick={touch}
          aria-label={`Drag or touch ${info.name} the ${pet.breed}`}
          className={`relative z-10 block cursor-grab active:cursor-grabbing transition-transform duration-200 ${
            facingLeft ? "scale-x-[-1]" : ""
          }`}
        >
          <img
            src={alertMode ? pet.alert : pet.rest}
            alt=""
            className={`w-20 drop-xl sm:w-28 transition-transform duration-300 pointer-events-none ${getMovementAnimation()}`}
          />
        </button>
        <div className="mx-auto h-1.5 w-12 rounded-full bg-black/20 blur-[2px]"></div>
      </div>
    </div>
  );
}