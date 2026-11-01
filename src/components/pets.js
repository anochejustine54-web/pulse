// pets.js - the three pets, what they say, and where each account's choice is saved
import dogRest from "../assets/pets/dog-rest.png";
import dogAlert from "../assets/pets/dog-alert.png";
import catRest from "../assets/pets/cat-rest.png";
import catAlert from "../assets/pets/cat-alert.png";
import birdRest from "../assets/pets/bird-rest.png";
import birdAlert from "../assets/pets/bird-alert.png";

export const PETS = [
  {
    id: "dog", label: "DOG", breed: "Corgi", badge: "P", defaultName: "My Buddy",
    icon: "🔔", sound: "bark", rest: dogRest, alert: dogAlert,
    job: "Reminder buddy: barks and rings a bell when something happens on Pulse (posts, likes, comments).",
  },
  {
    id: "cat", label: "CAT", breed: "Tabby", badge: "🐾", defaultName: "Mittens",
    icon: "✉️", sound: "meow", rest: catRest, alert: catAlert,
    job: "Message helper: meows and shows a message icon when a new chat message arrives.",
  },
  {
    id: "bird", label: "BIRD", breed: "Budgie", badge: "🪶", defaultName: "Sky",
    icon: "💡", sound: "chirp", rest: birdRest, alert: birdAlert,
    job: "Tip giver: chirps helpful ideas about using Pulse. Touch the bird for a new tip.",
  },
];

export const getPet = (id) => PETS.find((p) => p.id === id);

// What each pet says. {user}, {pet} and {who} are filled in automatically.
const lines = {
  dog: {
    greet: ["Arf! Hi {user}! I'm {pet}, your reminder buddy. 🐕"],
    post: ["Arf arf! Your post is live!", "Woof! Great post, {user}!"],
    like: ["Woof! You liked a post.", "Arf! Nice like!"],
    comment: ["Arf! Your comment was sent.", "Woof! Good comment!"],
    message: ["Arf! {who} sent you a message!"],
    touch: ["Arf! Arf!", "Woof! Need a reminder?", "Arf! I'm here, {user}!"],
  },
  cat: {
    greet: ["Meow~ Hi {user}! I'm {pet}. I'll tell you when messages arrive. 🐈"],
    post: ["Meow! Your post looks purrfect!", "Meow~ Nice post, {user}."],
    like: ["Meow! You liked a post.", "Purr... nice like."],
    comment: ["Meow! Comment sent.", "Meow~ Good comment!"],
    message: ["Meow! New message from {who}."],
    touch: ["Meow~", "Purr... pet me again.", "Meow! Any messages for me to find?"],
  },
  bird: {
    greet: ["Chirp! Hi {user}! I'm {pet}. I'll share tips with you. 🐦"],
    post: ["Chirp chirp! Your post is up!", "Tweet! Great post, {user}!"],
    like: ["Chirp! You liked a post.", "Tweet tweet! Nice like!"],
    comment: ["Chirp! Comment sent.", "Tweet! Good comment!"],
    message: ["Chirp! {who} wrote to you!"],
    touch: ["Chirp!", "Tweet tweet!", "Chirp chirp! Want a tip?"],
  },
};

const tips = [
  "Tip: tap “Fastest heartbeat” to see which posts are racing.",
  "Tip: change your profile picture on the Profile page.",
  "Tip: pick a new look with the 🎨 Theme button.",
  "Tip: you can delete only your own posts and comments.",
  "Tip: tap 💬 under a post to read and write comments.",
  "Tip: likes and comments make a post's heartbeat go faster.",
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// type: greet, post, like, comment, message, touch or tip
export const lineFor = (pet, type, vars = {}) => {
  const pool = type === "tip" ? tips : lines[pet.id][type] ?? lines[pet.id].touch;
  return pick(pool)
    .replaceAll("{user}", vars.user ?? "")
    .replaceAll("{pet}", vars.pet ?? "")
    .replaceAll("{who}", vars.who ?? "");
};

// ---------- saving each account's pet in the browser ----------
const KEY = "pulse-pets";

const readAll = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
};

export const loadPet = (user) => readAll()[user] ?? null; // { id, name } or null

export const savePet = (user, pet) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [user]: pet }));
  } catch {
    /* storage unavailable */
  }
};

// Any page can make the pet react: notifyPet("post"), notifyPet("like"), notifyPet("comment")
export const notifyPet = (type, vars = {}) =>
  window.dispatchEvent(new CustomEvent("pulse-pet", { detail: { type, vars } }));

