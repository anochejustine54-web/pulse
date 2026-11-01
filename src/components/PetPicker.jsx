// PetPicker.jsx - the "Choose your assistant pet" table shown after signing in
import { useState } from "react";
import { PETS, loadPet, savePet } from "./pets";
import { playPetSound } from "./petSounds";

export default function PetPicker({ user, onConfirm }) {
  const saved = loadPet(user); // the pet this account picked before (if any)
  const [selected, setSelected] = useState(saved?.id ?? "");
  const [names, setNames] = useState(() => {
    const start = Object.fromEntries(PETS.map((p) => [p.id, p.defaultName]));
    if (saved) start[saved.id] = saved.name;
    return start;
  });
  const [bounce, setBounce] = useState(""); // id of the pet that is jumping
  const [showPets, setShowPets] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Touching a pet makes it jump and use its voice
  const touch = (pet) => {
    playPetSound(pet.sound);
    setBounce(pet.id);
    setTimeout(() => setBounce(""), 500);
  };

  const confirm = () => {
    const pet = PETS.find((p) => p.id === selected);
    if (!pet) return;
    savePet(user, { id: pet.id, name: names[pet.id].trim() || pet.defaultName });
    onConfirm();
  };

  return (
    <div className="flex min-h-screen flex-col items-center gap-4 p-4 pb-10">
      <div className="flex items-center gap-2 pt-2 text-2xl font-extrabold text-primary">
        <span className="status status-error animate-pulse" aria-hidden="true"></span>Pulse
      </div>

      <h1 className="rounded-box bg-base-100/90 px-5 py-2 text-center text-2xl font-extrabold tracking-tight md:text-4xl">
        CHOOSE YOUR ASSISTANT PET
      </h1>

      <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm text-stone-700">
        Welcome, {user.split(" ")[0]}! Please select your companion. Tap a pet to hear it!
      </p>

      {/* The wooden table */}
      <div className="w-full max-w-4xl rounded-[2rem] border-4 border-amber-900/60 bg-linear-to-b from-amber-200 to-amber-400 p-4 shadow-2xl md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {PETS.map((pet, i) => (
            <div
              key={pet.id}
              className={`flex flex-col items-center gap-2 rounded-2xl p-3 ${selected === pet.id ? "bg-white/40 ring-4 ring-success" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-center gap-2 font-bold text-stone-800">
                <span>{i + 1}. {pet.label}</span>
                <span className="text-xs font-normal">({pet.breed})</span>
                <span className="badge badge-primary badge-sm">{pet.badge}</span>
              </div>

              {/* Pedestal: touch the pet to hear it */}
              <button
                type="button"
                onClick={() => touch(pet)}
                className="grid h-40 w-full cursor-pointer place-items-center rounded-xl border-4 border-slate-300 bg-sky-100 shadow-inner"
                aria-label={`Touch the ${pet.label.toLowerCase()} to hear it`}
              >
                <img
                  src={pet.rest}
                  alt={`${pet.breed} ${pet.label.toLowerCase()}`}
                  className={`max-h-32 ${bounce === pet.id ? "pet-hop" : "pet-float"}`}
                />
              </button>

              <label className="sr-only" htmlFor={`name-${pet.id}`}>Name your {pet.label.toLowerCase()}</label>
              <input
                id={`name-${pet.id}`}
                className="input input-sm w-full bg-white text-stone-800"
                value={names[pet.id]}
                maxLength={14}
                placeholder={`NAME: ${pet.defaultName}`}
                onChange={(e) => setNames((prev) => ({ ...prev, [pet.id]: e.target.value }))}
              />

              <button
                type="button"
                className={`btn btn-sm w-full ${selected === pet.id ? "btn-success" : "btn-outline btn-success"}`}
                onClick={() => setSelected(pet.id)}
              >
                {selected === pet.id ? "SELECTED ✓" : "SELECT"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons under the table */}
      <div className="flex flex-wrap justify-center gap-3">
        <button className="btn btn-success" disabled={!selected} onClick={confirm}>CONFIRM SELECTION</button>
        <button className="btn btn-outline bg-base-100" onClick={() => setShowPets((s) => !s)}>VIEW ALL PETS</button>
        <button className="btn btn-outline bg-base-100" onClick={() => setShowHelp(true)}>HELP / TUTORIAL</button>
      </div>

      {/* View all pets: what each one does */}
      {showPets && (
        <div className="card w-full max-w-4xl bg-base-100 shadow-lg">
          <div className="card-body gap-3">
            <h2 className="card-title">What each pet does</h2>
            {PETS.map((pet) => (
              <div key={pet.id} className="flex items-center gap-3">
                <img src={pet.rest} alt="" className="h-14 w-16 object-contain" />
                <p className="text-sm">
                  <strong>{pet.label} ({pet.breed}) {pet.icon}</strong><br />
                  {pet.job}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help / tutorial */}
      {showHelp && (
        <dialog className="modal modal-open" aria-label="Help">
          <div className="modal-box">
            <h2 className="text-lg font-bold">How your assistant pet works</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              <li>Tap a pet on the table to hear its voice.</li>
              <li>Type a name, press <strong>SELECT</strong>, then <strong>CONFIRM SELECTION</strong>.</li>
              <li>Your pet floats in the corner of every page. Tap it to hear it again.</li>
              <li>It shows an alert bubble when you post, like, comment or get a message.</li>
              <li>Tap the name tag to rename it, or <strong>Change</strong> to pick another pet.</li>
              <li>Use the 🔊 button to mute it.</li>
            </ul>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowHelp(false)}>Got it</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowHelp(false)}></div>
        </dialog>
      )}
    </div>
  );
}