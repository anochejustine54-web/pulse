
import { useState } from "react";
import { useNavigate } from "react-router";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";

import { auth, googleProvider } from "../firebase";
import { Toast } from "./items";

// Hidden sample login credentials.
// These accounts still work when entered manually.
const SAMPLE_ACCOUNTS = [
  {
    name: "Justine James Bag-ao",
    email: "justine@pulse.demo",
    password: "justine123",
  },
  {
    name: "Shinely Casal",
    email: "shinely@pulse.demo",
    password: "shinely123",
  },
  {
    name: "Ma. Elizabeth Ann Sido",
    email: "elizabeth@pulse.demo",
    password: "elizabeth123",
  },
];

export default function Form({ onSuccess }) {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [googleUser, setGoogleUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({
    show: false,
    type: "",
    message: "",
  });

  const closeAlert = () => {
    setAlert({
      show: false,
      type: "",
      message: "",
    });
  };

  const showAlert = (type, message) => {
    setAlert({
      show: true,
      type,
      message,
    });
  };

  const handleChange = (e) => {
    setData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Notify App.jsx after successful authentication.
  const finishLogin = (user) => {
    if (onSuccess) {
      onSuccess(user.displayName || user.email);
    }

    navigate("/");
  };

  // EMAIL AND PASSWORD LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!data.email.trim() || !data.password) {
      return showAlert(
        "warning",
        "Please enter your email and password."
      );
    }

    setLoading(true);
    closeAlert();

    const email = data.email.trim().toLowerCase();

    // Check hidden sample accounts first.
    const sampleAccount = SAMPLE_ACCOUNTS.find(
      (account) =>
        account.email === email &&
        account.password === data.password
    );

    if (sampleAccount) {
      showAlert(
        "success",
        `Welcome back, ${sampleAccount.name}!`
      );

      finishLogin({
        displayName: sampleAccount.name,
        email: sampleAccount.email,
      });

      setLoading(false);
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        data.password
      );

      showAlert("success", "Welcome back to Pulse!");

      finishLogin(result.user);
    } catch (error) {
      console.error("Login error:", error);

      const messages = {
        "auth/invalid-credential":
          "Incorrect email or password.",

        "auth/user-not-found":
          "No account found with this email.",

        "auth/wrong-password":
          "Incorrect password.",

        "auth/too-many-requests":
          "Too many attempts. Please try again later.",

        "auth/network-request-failed":
          "Network connection failed. Please try again.",
      };

      showAlert(
        "error",
        messages[error.code] || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE REGISTRATION USING POPUP
  const handleGoogleSignup = async () => {
    setLoading(true);
    closeAlert();

    try {
      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const user = result.user;

      // Check whether a Pulse email/password login
      // has already been linked to this Google account.
      const hasPassword = user.providerData.some(
        (provider) => provider.providerId === "password"
      );

      if (hasPassword) {
        showAlert("success", "Welcome back to Pulse!");

        finishLogin(user);
        return;
      }

      // Google authentication succeeded.
      // Keep the user on this form and ask them
      // to create their separate Pulse password.
      setGoogleUser(user);

      setData({
        email: user.email || "",
        password: "",
      });

      setNewPassword("");
      setConfirmPassword("");
      setMode("create-password");

    } catch (error) {
      console.error("Google popup error:", error);

      const messages = {
        "auth/popup-blocked":
          "Your browser blocked the Google popup. Allow popups for Pulse and try again.",

        "auth/popup-closed-by-user":
          "Google sign-in was closed before completion. Please try again.",

        "auth/unauthorized-domain":
          "This website is not authorized. Add localhost under Firebase Authorized domains.",

        "auth/operation-not-allowed":
          "Google sign-in is not enabled in Firebase.",

        "auth/network-request-failed":
          "Network connection failed. Please try again.",

        "auth/account-exists-with-different-credential":
          "An account already exists with this email using another sign-in method.",
      };

      showAlert(
        "error",
        messages[error.code] ||
          error.message ||
          "Google registration failed."
      );

    } finally {
      setLoading(false);
    }
  };

  // CREATE A SEPARATE PULSE PASSWORD
  const handleCreatePassword = async (e) => {
    e.preventDefault();

    if (!googleUser) {
      return showAlert(
        "error",
        "Please register with Google again."
      );
    }

    if (newPassword.length < 6) {
      return showAlert(
        "warning",
        "Your password must contain at least 6 characters."
      );
    }

    if (newPassword !== confirmPassword) {
      return showAlert(
        "warning",
        "Passwords do not match."
      );
    }

    setLoading(true);
    closeAlert();

    try {
      const credential = EmailAuthProvider.credential(
        googleUser.email,
        newPassword
      );

      // Link email/password authentication to the
      // SAME Firebase account used by Google.
      const result = await linkWithCredential(
        googleUser,
        credential
      );

      showAlert(
        "success",
        "Your Pulse account and password have been saved successfully!"
      );

      setGoogleUser(null);
      setNewPassword("");
      setConfirmPassword("");

      finishLogin(result.user);

    } catch (error) {
      console.error("Password creation error:", error);

      const messages = {
        "auth/weak-password":
          "Please choose a stronger password.",

        "auth/email-already-in-use":
          "This email already has a separate password account.",

        "auth/provider-already-linked":
          "A Pulse password is already linked to this account.",

        "auth/credential-already-in-use":
          "This password credential is already linked to another account.",

        "auth/requires-recent-login":
          "Please sign in with Google again before creating your password.",
      };

      showAlert(
        "error",
        messages[error.code] || error.message
      );

    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD
  const handleForgotPassword = async () => {
    if (!data.email.trim()) {
      return showAlert(
        "warning",
        "Please enter your Gmail address first."
      );
    }

    setLoading(true);
    closeAlert();

    try {
      await sendPasswordResetEmail(
        auth,
        data.email.trim()
      );

      showAlert(
        "success",
        "Password reset instructions have been sent to your email."
      );

    } catch (error) {
      console.error("Password reset error:", error);

      showAlert("error", error.message);

    } finally {
      setLoading(false);
    }
  };

  // GOOGLE PASSWORD CREATION SCREEN
  if (mode === "create-password") {
    return (
      <>
        <Toast alert={alert} onClose={closeAlert} />

        <form
          className="flex flex-col gap-2"
          onSubmit={handleCreatePassword}
          noValidate
        >
          <div className="mb-3">
            <h2 className="text-xl font-semibold">
              Create Your Pulse Password
            </h2>

            <p className="text-sm opacity-70 mt-1">
              Your Google account is connected. Create a
              password so you can log in to Pulse using
              your Gmail address.
            </p>
          </div>

          <label className="label">
            Gmail Address
          </label>

          <input
            type="email"
            className="input input-bordered w-full"
            value={googleUser?.email || ""}
            disabled
          />

          <label
            className="label"
            htmlFor="newPassword"
          >
            Create Password
          </label>

          <div className="join w-full">
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              className="input input-bordered join-item w-full"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              autoComplete="new-password"
            />

            <button
              type="button"
              className="btn join-item"
              onClick={() =>
                setShowNewPassword((prev) => !prev)
              }
            >
              {showNewPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label
            className="label"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            className="input input-bordered w-full"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            autoComplete="new-password"
          />

          <p className="text-xs opacity-60 mt-1">
            Your password will be linked to your Google
            account. You can use it for future Pulse logins.
          </p>

          <button
            type="submit"
            className="btn btn-primary mt-3 w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Create Pulse Account"
            )}
          </button>

          <button
            type="button"
            className="btn btn-ghost w-full"
            disabled={loading}
            onClick={async () => {
              try {
                await auth.signOut();

                setGoogleUser(null);
                setMode("login");
                setNewPassword("");
                setConfirmPassword("");

              } catch (error) {
                console.error("Cancel error:", error);

                showAlert("error", error.message);
              }
            }}
          >
            Cancel
          </button>
        </form>
      </>
    );
  }

  // MAIN LOGIN SCREEN
  return (
    <>
      <Toast alert={alert} onClose={closeAlert} />

      <form
        className="flex flex-col gap-2"
        onSubmit={handleLogin}
        noValidate
      >
        <label className="label" htmlFor="email">
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          className="input input-bordered w-full"
          placeholder="you@example.com"
          value={data.email}
          onChange={handleChange}
          autoComplete="email"
        />

        <label className="label" htmlFor="password">
          Password
        </label>

        <div className="join w-full">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="input input-bordered join-item w-full"
            placeholder="Enter your password"
            value={data.password}
            onChange={handleChange}
            autoComplete="current-password"
          />

          <button
            type="button"
            className="btn join-item"
            onClick={() =>
              setShowPassword((prev) => !prev)
            }
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="button"
          className="link link-primary text-sm self-end mt-1"
          onClick={handleForgotPassword}
          disabled={loading}
        >
          Forgot password?
        </button>

        <button
          type="submit"
          className="btn btn-primary mt-3 w-full"
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            "Sign in"
          )}
        </button>

        <div className="divider my-2">
          OR
        </div>

        <button
          type="button"
          className="btn btn-outline w-full"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <>
              <svg
                viewBox="0 0 48 48"
                className="w-5 h-5"
              >
                <path
                  fill="#4285F4"
                  d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7A19.9 19.9 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5Z"
                />
                <path
                  fill="#34A853"
                  d="M24 44c5.1 0 9.8-2 13.3-5.3l-6.2-5.2A12 12 0 0 1 12.9 29l-6.6 5.1A20 20 0 0 0 24 44Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.3 14.7 12.9 19A12 12 0 0 1 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7A19.9 19.9 0 0 0 24 4C16.3 4 9.6 8.3 6.3 14.7Z"
                />
                <path
                  fill="#EA4335"
                  d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.2 5.5l6.2 5.2C41.4 35.1 44 29.9 44 24c0-1.2-.1-2.4-.4-3.5Z"
                />
              </svg>

              Sign up with Google
            </>
          )}
        </button>

        <p className="text-center text-sm opacity-60 mt-2">
          New to Pulse? Sign up using your Google account.
        </p>
      </form>
    </>
  );
}
