import { createSignal, onMount, onCleanup } from "solid-js";

export const [isSmallScreen, setIsSmallScreen] = createSignal(false);
export const [theme, setTheme] = createSignal("dark");

export function initParameters() {
  
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const updateTheme = (e) => setTheme(e.matches ? "dark" : "light");
  const updateScreenSize = () => setIsSmallScreen(window.innerWidth < 600);
  
  onMount(() => {
    updateScreenSize();
    updateTheme(colorScheme);

    colorScheme.addEventListener("change", updateTheme);
    window.addEventListener("resize", updateScreenSize);
  });

  onCleanup(() => {
    colorScheme.removeEventListener("change", updateTheme);
    window.removeEventListener("resize", updateScreenSize);
  });
}
