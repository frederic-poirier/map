import "./css/index.css";
import { render } from "solid-js/web";
import { registerSheetElements } from "pure-web-bottom-sheet";

import App from "./App";

// Register bottom sheet web components
registerSheetElements();

// Enable VirtualKeyboard API for on-screen keyboard avoidance
if ("virtualKeyboard" in navigator) {
  navigator.virtualKeyboard.overlaysContent = true;
}

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(() => <App />, root);
