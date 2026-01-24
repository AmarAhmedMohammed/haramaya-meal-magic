import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Security: Disable right-click context menu
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// Security: Disable keyboard shortcuts for developer tools
document.addEventListener("keydown", (e) => {
  // F12
  if (e.key === "F12") {
    e.preventDefault();
  }
  // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
  if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) {
    e.preventDefault();
  }
  // Ctrl+U (view source)
  if (e.ctrlKey && e.key.toUpperCase() === "U") {
    e.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
