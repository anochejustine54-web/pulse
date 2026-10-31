// Splash.jsx - animated logo intro shown once before the sign-in screen
import { useEffect, useState } from "react";

export default function Splash({ onDone }) {
  const [leaving, setLeaving] = useState(false); // true = fade out

  useEffect(() => {
    const fade = setTimeout(() => setLeaving(true), 3200); // start fading
    const done = setTimeout(onDone, 3800);                 // then show the sign-in screen
    return () => {
      clearTimeout(fade);
      clearTimeout(done);
    };
  }, [onDone]);

  const skip = () => {
    setLeaving(true);
    setTimeout(onDone, 400);
  };

  return (
    <div className={`splash fixed inset-0 z-200 grid place-items-center ${leaving ? "splash-out" : ""}`}>
      <div className="flex flex-col items-center gap-4 px-4">
        {/* Heartbeat line draws itself */}
        <svg viewBox="0 0 400 120" className="w-80 max-w-[85vw]" aria-hidden="true">
          <path
            className="splash-ecg"
            pathLength="100"
            d="M0 60 H120 L140 60 L160 18 L185 102 L205 38 L222 60 H400"
          />
        </svg>

        {/* Pulsing dot + letters appearing one by one */}
        <div className="flex items-center gap-3">
          <span className="splash-dot" aria-hidden="true"></span>
          <h1 className="splash-title text-5xl font-extrabold tracking-tight" aria-label="Pulse">
            {"Pulse".split("").map((letter, i) => (
              <span key={i} aria-hidden="true" style={{ animationDelay: `${1.2 + i * 0.12}s` }}>
                {letter}
              </span>
            ))}
          </h1>
        </div>

        <p className="splash-tag text-sm">Share what moves you.</p>
      </div>

      <button className="btn btn-ghost btn-sm absolute bottom-6 text-white/70" onClick={skip}>
        Skip
      </button>
    </div>
  );
}