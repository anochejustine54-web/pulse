// main.jsx - BrowserRouter lets every component inside it use routing.
// AvatarProvider shares the profile pictures with every component.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import { AvatarProvider } from "./components/avatars";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AvatarProvider>
        <App />
      </AvatarProvider>
    </BrowserRouter>
  </StrictMode>
);