import Body from "../components/Body";

export default function About() {
  return (
    <Body title="About Pulse" subtitle="A friendly place to share and chat.">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body gap-2">
          <p>Pulse lets you post updates, like what your friends share, and message them in one place.</p>
          <p>Built with React, useState, React Router (Layout, Outlet, NavLink) and daisyUI.</p>
        </div>
      </div>
    </Body>
  );
}