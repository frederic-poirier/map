import { Show, createSignal, createEffect } from "solid-js";
import { isAppReady } from "../context/LoadingContext";

export default function AppLoader(props) {
  const [isVisible, setIsVisible] = createSignal(true);
  const [isFading, setIsFading] = createSignal(false);

  createEffect(() => {
    if (isAppReady() && isVisible()) {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 500);
    }
  });

  return (
    <>
      <Show when={isVisible()}>
        <div
          class={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 bg-white dark:bg-neutral-900 ${isFading() ? "opacity-0" : "opacity-100"
            }`}
        >
          <div class="w-3 h-3 rounded-full bg-neutral-400 dark:bg-neutral-600 animate-pulse" />
        </div>
      </Show>
      {props.children}
    </>
  );
}
