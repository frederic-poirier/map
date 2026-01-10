import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";
import { createSignal } from "solid-js";

export default function LayoutContent(props) {
  const [isMobile, setIsMobile] = createSignal(
    typeof window !== "undefined" && window.innerWidth < 768,
  );

  onMount(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    onCleanup(() => window.removeEventListener("resize", checkMobile));
  });

  return (
    <Show
      when={isMobile()}
      fallback={<DesktopLayout>{props.children}</DesktopLayout>}
    >
      <MobileLayout>{props.children}</MobileLayout>
    </Show>
  );
}
