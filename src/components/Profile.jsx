import { useState } from "react";
import { useOutletContext } from "react-router";
import Body from "../components/Body";
import { Avatar } from "../components/items";
import { useAvatars } from "../components/avatars";

// Crops to a square and shrinks to 256x256 so it fits in browser storage
const resizeImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        const side = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

export default function Profile() {
  const { user } = useOutletContext();
  const { avatars, setAvatar, removeAvatar } = useAvatars();
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please choose an image file (JPG, PNG, GIF or WebP)." });
      return;
    }
    try {
      setAvatar(user, await resizeImage(file));
      setMessage({ type: "success", text: "Profile picture updated." });
    } catch {
      setMessage({ type: "error", text: "Could not read that picture. Try another one." });
    }
  };

  const handleRemove = () => {
    removeAvatar(user);
    setMessage({ type: "success", text: "Profile picture removed." });
  };

  return (
    <Body title="Your profile" subtitle="Choose the picture others see next to your name.">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body items-center text-center gap-3">
          <Avatar name={user} size="large" />
          <strong>{user}</strong>
          <div className="flex flex-wrap justify-center gap-2">
            <label htmlFor="profile-pic" className="btn btn-outline btn-sm">📷 Choose picture</label>
            <input id="profile-pic" type="file" accept="image/*" hidden onChange={handleFile} />
            {avatars[user] && (
              <button type="button" className="btn btn-ghost btn-sm text-error" onClick={handleRemove}>Remove picture</button>
            )}
          </div>
          {message.text && (
            <div role="status" className={`alert alert-soft py-2 text-sm ${message.type === "error" ? "alert-error" : "alert-success"}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </Body>
  );
}


