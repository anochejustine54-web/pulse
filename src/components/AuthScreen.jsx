// AuthScreen.jsx - the ONLY thing shown until sign-in succeeds
import Form from "./form";

export default function AuthScreen({ onSuccess }) {
  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="logo auth-logo">
          <span className="logo-dot" aria-hidden="true"></span>Pulse
        </div>
        <h1>Welcome to Pulse</h1>
        <p className="muted">Sign up to see your feed and messages.</p>
        <Form onSuccess={onSuccess} />
      </div>
    </div>
  );
}