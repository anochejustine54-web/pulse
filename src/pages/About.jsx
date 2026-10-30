import Body from "../components/Body";

export default function About() {
  return (
    <Body title="About Pulse" subtitle="A friendly place to share and chat.">
      <div className="card prose">
        <p>Pulse lets you post updates, like what your friends share, and message them in one place.</p>
        <p>This project was built with React, useState and React Router (Layout, Outlet, NavLink).</p>
      </div>
    </Body>
  );
}
