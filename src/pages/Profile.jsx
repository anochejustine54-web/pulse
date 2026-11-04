
import { useState } from "react";
import { useOutletContext } from "react-router";
import { updateProfile } from "firebase/auth";

import { auth } from "../firebase";
import Body from "../components/Body";
import { Avatar } from "../components/items";
import { useAvatars } from "../components/avatars";

// Crops to a square and shrinks to 256x256.
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

        ctx.drawImage(
          img,
          (img.width - side) / 2,
          (img.height - side) / 2,
          side,
          side,
          0,
          0,
          size,
          size
        );

        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });

export default function Profile() {
  const { user, setUser } = useOutletContext();

  const {
    avatars,
    setAvatar,
    removeAvatar,
  } = useAvatars();

  const [username, setUsername] = useState(user || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // SAVE USERNAME
  const handleSaveUsername = async (e) => {
    e.preventDefault();

    const newUsername = username.trim();

    if (!newUsername) {
      setMessage({
        type: "error",
        text: "Username cannot be empty.",
      });
      return;
    }

    if (newUsername.length < 3) {
      setMessage({
        type: "error",
        text: "Username must contain at least 3 characters.",
      });
      return;
    }

    if (newUsername.length > 30) {
      setMessage({
        type: "error",
        text: "Username cannot exceed 30 characters.",
      });
      return;
    }

    if (newUsername === user) {
      setEditing(false);
      setMessage({
        type: "success",
        text: "Your username has not changed.",
      });
      return;
    }

    setSaving(true);

    try {
      const firebaseUser = auth.currentUser;

      if (firebaseUser) {
        // Save the new username to Firebase Authentication.
        await updateProfile(firebaseUser, {
          displayName: newUsername,
        });
      } else {
        // Save the new name for a hidden sample account.
        sessionStorage.setItem(
          "pulse-demo-user",
          newUsername
        );
      }

      // Keep the profile picture associated with the new name.
      if (avatars[user]) {
        setAvatar(newUsername, avatars[user]);
        removeAvatar(user);
      }

      // Immediately update the app's username.
      setUser(newUsername);

      setUsername(newUsername);
      setEditing(false);

      setMessage({
        type: "success",
        text: "Your username has been updated successfully!",
      });

    } catch (error) {
      console.error("Username update error:", error);

      setMessage({
        type: "error",
        text: error.message || "Could not update your username.",
      });

    } finally {
      setSaving(false);
    }
  };

  // CANCEL EDITING
  const handleCancel = () => {
    setUsername(user || "");
    setEditing(false);

    setMessage({
      type: "",
      text: "",
    });
  };

  // CHANGE PROFILE PICTURE
  const handleFile = async (e) => {
    const file = e.target.files[0];

    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Please choose an image file (JPG, PNG, GIF or WebP).",
      });
      return;
    }

    try {
      setAvatar(user, await resizeImage(file));

      setMessage({
        type: "success",
        text: "Profile picture updated.",
      });

    } catch {
      setMessage({
        type: "error",
        text: "Could not read that picture. Try another one.",
      });
    }
  };

  // REMOVE PROFILE PICTURE
  const handleRemove = () => {
    removeAvatar(user);

    setMessage({
      type: "success",
      text: "Profile picture removed.",
    });
  };

  return (
    <Body
      title="Your profile"
      subtitle="Manage your username and profile picture."
    >
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body items-center text-center gap-3">

          {/* PROFILE PICTURE */}
          <Avatar name={user} size="large" />

          {/* USERNAME */}
          {!editing ? (
            <>
              <strong className="text-xl">
                {user}
              </strong>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setUsername(user);
                  setEditing(true);
                  setMessage({
                    type: "",
                    text: "",
                  });
                }}
              >
                ✏️ Edit username
              </button>
            </>
          ) : (
            <form
              onSubmit={handleSaveUsername}
              className="w-full max-w-sm flex flex-col gap-3"
            >
              <label
                htmlFor="username"
                className="label justify-center"
              >
                New username
              </label>

              <input
                id="username"
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter your username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                maxLength={30}
                minLength={3}
                autoFocus
                required
              />

              <div className="flex justify-center gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Save username"
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* PROFILE PICTURE CONTROLS */}
          <div className="divider">
            Profile picture
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <label
              htmlFor="profile-pic"
              className="btn btn-outline btn-sm"
            >
              📷 Choose picture
            </label>

            <input
              id="profile-pic"
              type="file"
              accept="image/*"
              hidden
              onChange={handleFile}
            />

            {avatars[user] && (
              <button
                type="button"
                className="btn btn-ghost btn-sm text-error"
                onClick={handleRemove}
              >
                Remove picture
              </button>
            )}
          </div>

          {/* STATUS MESSAGE */}
          {message.text && (
            <div
              role="status"
              className={`alert alert-soft py-2 text-sm ${
                message.type === "error"
                  ? "alert-error"
                  : "alert-success"
              }`}
            >
              {message.text}
            </div>
          )}

        </div>
      </div>
    </Body>
  );
}
