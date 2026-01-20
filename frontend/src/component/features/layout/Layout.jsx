import { MapProvider } from "~/context/MapContext";
import { AuthProvider } from "~/context/AuthContext";
import { ThemeProvider } from "~/context/ThemeContext";
import { ItineraryProvider } from "~/context/ItineraryContext";
import { PlaceProvider } from "~/context/PlaceContext";
import { SheetLayoutProvider, useSheetLayout } from "~/context/SheetLayoutContext";
import { useNavigate } from "@solidjs/router";
import LocateMeButton from "../location/LocateMeButton";
import User from "lucide-solid/icons/user";
import ChevronLeft from "lucide-solid/icons/chevron-left";
import Map from "../../Map";
import { A } from "@solidjs/router";
import { Show, createSignal, onMount, onCleanup } from "solid-js";
import { useAuth } from "~/context/AuthContext";
import { BottomSheet } from "./BottomSheet";
import { Toaster } from 'solid-toast'
import "~/css/Sheet.css";

export default function Layout(props) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MapProvider>
          <Toaster />
          <div class="overflow-hidden">
            <Map />
            <LayoutContent>{props.children}</LayoutContent>
          </div>
        </MapProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function LayoutContent(props) {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = createSignal(false);

  onMount(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);

    const handleChange = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    onCleanup(() => mediaQuery.removeEventListener('change', handleChange));
  });

  return (
    <ItineraryProvider>
      <PlaceProvider>
        <SheetLayoutProvider>
          <Show when={isMobile()} fallback={<DesktopSidebar user={user}>{props.children}</DesktopSidebar>}>
            <MobileSheet user={user}>{props.children}</MobileSheet>
          </Show>
        </SheetLayoutProvider>
      </PlaceProvider>
    </ItineraryProvider>
  );
}

function MobileSheet(props) {
  const { stickyContent, footerContent } = useSheetLayout();

  const header = (
    <BottomSheet.Header>
      <div class="flex items-center gap-2">
        <h1 class="mr-auto text-lg font-semibold text-[var(--text-primary)]">Explore</h1>
        <Show when={props.user()} fallback={<HeaderSkeleton />}>
          <LocateMeButton />
          <A
            href="/profile"
            class="p-2 rounded-full hover:bg-[var(--bg-hover)] active:bg-[var(--bg-tertiary)] transition-colors"
          >
            <User size={18} class="text-[var(--text-secondary)]" />
          </A>
        </Show>
      </div>
    </BottomSheet.Header>
  );

  const sticky = (
    <Show when={stickyContent()}>
      <BottomSheet.Sticky>
        {stickyContent()}
      </BottomSheet.Sticky>
    </Show>
  );

  const footer = (
    <Show when={footerContent()}>
      <BottomSheet.Footer>
        {footerContent()}
      </BottomSheet.Footer>
    </Show>
  );

  return (
    <BottomSheet
      snapPoints={[15, 40, 90]}
      initialSnap={1}
      header={header}
      sticky={sticky}
      footer={footer}
    >
      <BottomSheet.Content>
        <Show when={props.user()} fallback={<ContentSkeleton />}>
          {props.children}
        </Show>
      </BottomSheet.Content>
    </BottomSheet>
  );
}

function DesktopSidebar(props) {
  const { stickyContent } = useSheetLayout();

  return (
    <div class="absolute bg-[var(--bg-primary)] left-3 top-3 rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/30 w-80 sidebar-enter max-h-[calc(100vh-1.5rem)] flex flex-col border border-[var(--border-primary)]">
      <header class="flex items-center gap-2 border-b border-[var(--border-primary)] px-4 py-3 flex-shrink-0">
        <h1 class="mr-auto text-lg font-semibold text-[var(--text-primary)]">Explore</h1>

        <Show when={props.user()} fallback={<HeaderSkeleton />}>
          <LocateMeButton />
          <A
            href="/profile"
            class="p-2 rounded-full hover:bg-[var(--bg-hover)] active:bg-[var(--bg-tertiary)] transition-colors"
          >
            <User size={18} class="text-[var(--text-secondary)]" />
          </A>
        </Show>
      </header>

      <Show when={stickyContent()}>
        <div class="px-3 pt-3 flex-shrink-0">
          {stickyContent()}
        </div>
      </Show>

      <main class="p-3 flex-1 overflow-y-auto">
        <Show when={props.user()} fallback={<ContentSkeleton />}>
          {props.children}
        </Show>
      </main>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 skeleton skeleton-circle" />
      <div class="w-8 h-8 skeleton skeleton-circle" />
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div class="space-y-3">
      {/* Search input skeleton */}
      <div class="h-10 skeleton rounded-lg" />

      {/* List items skeleton */}
      <div class="space-y-2">
        <div class="flex items-center gap-3 p-2">
          <div class="w-8 h-8 skeleton skeleton-circle" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3.5 skeleton w-3/4" />
            <div class="h-3 skeleton w-1/2" />
          </div>
        </div>
        <div class="flex items-center gap-3 p-2">
          <div class="w-8 h-8 skeleton skeleton-circle" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3.5 skeleton w-2/3" />
            <div class="h-3 skeleton w-2/5" />
          </div>
        </div>
        <div class="flex items-center gap-3 p-2">
          <div class="w-8 h-8 skeleton skeleton-circle" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3.5 skeleton w-4/5" />
            <div class="h-3 skeleton w-1/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LayoutHeader(props) {
  const navigate = useNavigate();

  return (
    <header>
      <button
        class="flex items-center font-medium tracking-tight text-[var(--text-secondary)]"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={16} color="var(--text-secondary)" />
        <h2>{props.title}</h2>
      </button>
    </header>
  );
}
