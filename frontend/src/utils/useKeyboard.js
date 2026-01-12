import { onCleanup, onMount } from "solid-js";

export default function useKeyboard(config) {
  const handleKeydown = (e) => {
    const activeElement = document.activeElement;
    const isTyping =
      activeElement.tagName === "INPUT" ||
      activeElement === "TEXTAREA" ||
      activeElement.isContentEditable;

    if (isTyping) return;
    if (e.key === "Escape") document.blur();

    const key = e.key.toLowerCase();
    const action = config[key] || config[e.key];

    if (action) {
      e.preventDefault();
      action(e);
    }
  };

  onMount(() => window.addEventListener("keydown", handleKeydown));
  onCleanup(() => window.removeEventListener("keydown", handleKeydown));
}
