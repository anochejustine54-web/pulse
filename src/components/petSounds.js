// petSounds.js - the pets' voices, made with the browser's Web Audio API (no sound files)
let ctx;

const getCtx = () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

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

// One bark: a falling rough tone plus a short burst of noise
const bark = (c, t) => {
  const osc = c.createOscillator();
  const filter = c.createBiquadFilter();
  const gain = c.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(520, t);
  osc.frequency.exponentialRampToValueAtTime(190, t + 0.14);
  filter.type = "bandpass";
  filter.frequency.value = 900;
  filter.Q.value = 1.2;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.5, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  osc.connect(filter).connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.18);

  const length = Math.floor(c.sampleRate * 0.08);
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const noise = c.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = c.createGain();
  noiseGain.gain.value = 0.25;
  noise.connect(noiseGain).connect(c.destination);
  noise.start(t);
};

// "Arf arf!"
const playBark = () => {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + 0.01;
  bark(c, t);
  bark(c, t + 0.22);
};

// "Mee-ow": pitch rises then falls, with a moving vowel filter and a little vibrato
const playMeow = () => {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + 0.01;
  const d = 0.75;
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(420, t);
  osc.frequency.linearRampToValueAtTime(780, t + 0.2);
  osc.frequency.linearRampToValueAtTime(600, t + 0.5);
  osc.frequency.linearRampToValueAtTime(380, t + d);

  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 6;
  lfoGain.gain.value = 14;
  lfo.connect(lfoGain).connect(osc.frequency);

  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 3;
  filter.frequency.setValueAtTime(900, t);
  filter.frequency.linearRampToValueAtTime(2200, t + 0.22);
  filter.frequency.linearRampToValueAtTime(1000, t + d);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.7, t + 0.08);
  gain.gain.setValueAtTime(0.7, t + 0.45);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + d);

  osc.connect(filter).connect(gain).connect(c.destination);
  lfo.start(t);
  osc.start(t);
  lfo.stop(t + d + 0.05);
  osc.stop(t + d + 0.05);
};

// "Chirp chirp chirp!": three quick high sweeps
const playChirp = () => {
  const c = getCtx();
  if (!c) return;
  const start = c.currentTime + 0.01;
  [0, 0.16, 0.32].forEach((offset, i) => {
    const t = start + offset;
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(2300 + i * 150, t);
    osc.frequency.exponentialRampToValueAtTime(3600 + i * 150, t + 0.07);
    osc.frequency.exponentialRampToValueAtTime(2800, t + 0.12);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  });
};

// kind is "bark", "meow" or "chirp"
export const playPetSound = (kind) => {
  if (isMuted()) return;
  if (kind === "bark") playBark();
  else if (kind === "meow") playMeow();
  else if (kind === "chirp") playChirp();
};