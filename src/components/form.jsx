// form.jsx - sign-up form that checks the credentials and shows an alert
import { useState } from "react";
import { useNavigate } from "react-router";
import { Toast } from "./items";

const allowedUsers = ["Justine James Bag-ao", "Shinely Casal", "Ma. Elizabeth Ann Sido"];
const allowedEmail = "pulse@gmail.com";
const allowedPassword = "norsusection-a";

export default function Form({ onSuccess }) {
  const navigate = useNavigate();
  const [data, setData] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const closeAlert = () => setAlert({ show: false, type: "", message: "" });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(closeAlert, 4000);
  };

  const handleChange = (e) => setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = data.username.trim().toLowerCase();
    const email = data.email.trim().toLowerCase();

    if (!username || !email || !data.password) {
      return showAlert("warning", "Please fill in all fields.");
    }
    const matchedUser = allowedUsers.find((u) => u.toLowerCase() === username);
    if (!matchedUser || email !== allowedEmail) {
      return showAlert("error", "Sign in unsuccessful. Username or email is not recognized.");
    }
    if (data.password !== allowedPassword) {
      setData((prev) => ({ ...prev, password: "" }));
      return showAlert("error", "Wrong password. Please try again.");
    }

    // Success: show the alert first, then open the main app after 1.5 seconds
    showAlert("success", `Sign in successful! Welcome to Pulse, ${matchedUser}.`);
    setTimeout(() => {
      onSuccess(matchedUser);
      navigate("/");
    }, 1500);
  };

  return (
    <>
      <Toast alert={alert} onClose={closeAlert} />
      <form className="card form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" placeholder="Your full name" value={data.username} onChange={handleChange} autoComplete="username" />

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" value={data.email} onChange={handleChange} autoComplete="email" />

        <label htmlFor="password">Password</label>
        <div className="password-row">
          <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={data.password} onChange={handleChange} autoComplete="current-password" />
          <button type="button" className="ghost" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button type="submit" className="primary">Sign up</button>
      </form>
    </>
  );
}