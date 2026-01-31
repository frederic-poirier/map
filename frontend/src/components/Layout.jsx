import { onCleanup, onMount, createSignal, Show } from "solid-js";
import { BottomSheet } from "./BottomSheet";
import { SheetProvider } from "../context/SheetProvider";
import { Toaster } from "solid-sonner";
import AuthGate from "./AuthGate";
import Map from "../Map";
import { initParameters, isSmallScreen } from "../hooks/useScreen";

export default function Layout(props) {
  initParameters()

  return (
    <AuthGate>
      <SheetProvider>
        <Toaster />
        <Map>
          <Show
            when={isSmallScreen()}
            fallback={<Container>{props.children}</Container>}
          >
            <BottomSheet index={1}>
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
    <div class="fixed h-fit w-96 top-4 left-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-2xl overflow-hidden">
      {props.children}
    </div>
  )
} 
