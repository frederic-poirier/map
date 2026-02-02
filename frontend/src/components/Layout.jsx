import { Show } from "solid-js";
import { BottomSheet } from "./BottomSheet";
import { SheetProvider } from "../context/SheetProvider";
import { Toaster } from "solid-sonner";
import AuthGate from "./AuthGate";
import Map from "../Map";
import AppLoader from "./AppLoader";
import { initParameters, isSmallScreen } from "../hooks/useScreen";

export default function Layout(props) {
  initParameters()

  return (
    <AppLoader>
      <AuthGate>
        <SheetProvider>
          <Toaster />
          <Map>
            <Show
              when={isSmallScreen()}
              fallback={<Container>{props.children}</Container>}
            >
              <BottomSheet index={1}>
                <div class="px-4">
                  {props.children}
                </div>
              </BottomSheet>
            </Show>
          </Map>
        </SheetProvider>
      </AuthGate>
    </AppLoader>
  )
}

function Container(props) {
  return (
    <div class="fixed h-fit w-96 top-4 left-4 p-3 bg-neutral-950/80 backdrop-blur-xl rounded-3xl border border-neutral-800/50 shadow-2xl">
      {props.children}
    </div>
  )
}

export function State(props) {
  return (
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <h3 class="text-sm font-medium text-neutral-400 mb-1">
        {props.title}
      </h3>
      <p class="text-xs text-neutral-600">
        {props.text}
      </p>
    </div>
  )
}

export function Header(props) {
  return (
    <Show
      when={isSmallScreen()}
      fallback={<header>{props.children}</header>}
    >
      <BottomSheet.Header>{props.children}</BottomSheet.Header>
    </Show>
  )
}
