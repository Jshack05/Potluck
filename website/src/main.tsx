import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App pathname={window.location.pathname} />
  </StrictMode>
);
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
