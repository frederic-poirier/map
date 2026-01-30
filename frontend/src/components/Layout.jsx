import { onCleanup, onMount, createSignal, Show } from "solid-js";
import { BottomSheet } from "./BottomSheet";
import { SheetProvider } from "../context/SheetProvider";
import { Toaster } from "solid-sonner";
import AuthGate from "./AuthGate";
import Map from "../Map";

export default function Layout(props) {
  const [isSmallScreen, setIsSmallScreen] = createSignal(false)

  const updateScreenSize = () => setIsSmallScreen(window.innerWidth < 600)
  onMount(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
  });
  onCleanup(() => window.removeEventListener('resize', updateScreenSize));


  return (
    <AuthGate>
      <SheetProvider>
        <Toaster />
        <Map>
          <Show
            when={isSmallScreen()}
            fallback={<Container>{props.children}</Container>}
          >
            <BottomSheet
              index={1}
            >
              {props.children}
            </BottomSheet>
          </Show>
        </Map>
      </SheetProvider>
    </AuthGate>
  )
}

function Container(props) {
  return (
    <div class="fixed h-fit w-96 top-4 left-4 bg-white rounded-xl shadow-lg text-gray-900 overflow-hidden">
      {props.children}
    </div>
  )
} 
