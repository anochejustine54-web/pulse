import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import App from "./App";
import { AvatarProvider } from "./components/avatars";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <AvatarProvider>
        <App />
      </AvatarProvider>
    </HashRouter>
  </StrictMode>
);