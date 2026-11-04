// petSounds.js - the pets' voices, played from real recordings.
// Put the files in the public/sounds folder with these exact names:
//   dog.mp3, cat.mp3, bird.mp3

export const isMuted = () => {
  try {
    return localStorage.getItem("pulse-pet-muted") === "1";
  } catch {
    return false;
  }
};

export const setMuted = (value) => {
  try {
    localStorage.setItem("pulse-pet-muted", value ? "1" : "0");
  } catch {
    /* storage unavailable */
  }
};

const files = {
  bark: "sounds/dog.mp3",
  meow: "sounds/cat.mp3",
  chirp: "sounds/bird.mp3",
};

// kind is "bark", "meow" or "chirp"
export const playPetSound = (kind) => {
  if (isMuted() || !files[kind]) return;
  const audio = new Audio(`${import.meta.env.BASE_URL}${files[kind]}`);
  audio.volume = 0.8;
  audio.play().catch(() => {
    /* the file is missing or the browser blocked it: stay silent */
  });
};