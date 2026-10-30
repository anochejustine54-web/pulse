// form.jsx - sign-up form (daisyUI inputs) that checks the credentials
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

    showAlert("success", `Sign in successful! Welcome to Pulse, ${matchedUser}.`);
    setTimeout(() => {
      onSuccess(matchedUser);
      navigate("/");
    }, 1500);
  };

  return (
    <>
      <Toast alert={alert} onClose={closeAlert} />
      <form className="flex flex-col gap-2" onSubmit={handleSubmit} noValidate>
        <label className="label" htmlFor="username">Username</label>
        <input id="username" name="username" className="input w-full" placeholder="Your full name" value={data.username} onChange={handleChange} autoComplete="username" />

        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input w-full" placeholder="you@example.com" value={data.email} onChange={handleChange} autoComplete="email" />

        <label className="label" htmlFor="password">Password</label>
        <div className="join w-full">
          <input id="password" name="password" type={showPassword ? "text" : "password"} className="input join-item w-full" placeholder="Enter your password" value={data.password} onChange={handleChange} autoComplete="current-password" />
          <button type="button" className="btn join-item" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button type="submit" className="btn btn-primary mt-3 w-full">Sign up</button>
      </form>
    </>
  );
}