
import { onMount, createEffect, Show, createSignal, onCleanup } from "solid-js";
import { auth, initAuth, refreshSession } from "../hooks/useAuth";
import { useNavigate, useLocation } from "@solidjs/router";
import Clock from "lucide-solid/icons/clock";
import RefreshCw from "lucide-solid/icons/refresh-cw";

export const PUBLIC_PATHS = ["/login", "/callback", "/auth/google"];

export default function AuthGate(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTimeoutWarning, setShowTimeoutWarning] = createSignal(false);
  const [timeRemaining, setTimeRemaining] = createSignal(null);

  onMount(() => {
    initAuth();
  });

  createEffect(() => {
    const currentAuth = auth();

    if (currentAuth.loading) return;

    const isPublicPath = PUBLIC_PATHS.some((path) =>
      location.pathname.startsWith(path)
    );

    if (!currentAuth.user && !isPublicPath) {
      navigate("/login", { replace: true });
    }
  });

  createEffect(() => {
    const currentAuth = auth();

    if (!currentAuth.user || !currentAuth.expiresAt) {
      setShowTimeoutWarning(false);
      return;
    }

    const checkTimeout = () => {
      const now = Date.now();
      const expiresAt = currentAuth.expiresAt;
      const timeLeft = expiresAt - now;

      if (timeLeft > 0 && timeLeft < 120000) {
        setShowTimeoutWarning(true);
        setTimeRemaining(Math.floor(timeLeft / 1000));
      } else {
        setShowTimeoutWarning(false);
      }
    };

    checkTimeout();
    const interval = setInterval(checkTimeout, 10000);

    onCleanup(() => clearInterval(interval));
  });

  return (
    <Show when={!auth().loading} fallback={
      <div class="fixed inset-0 bg-zinc-100 flex items-center justify-center z-50">
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 border-2 border-zinc-200 border-t-zinc-400 rounded-full animate-spin"></div>
          <p class="text-zinc-400 mt-4 text-sm">Chargement…</p>
        </div>
      </div>
    }>
      <Show when={showTimeoutWarning()}>
        <div class="fixed bottom-4 right-4 bg-zinc-900 text-white px-4 py-2.5 rounded-xl shadow-lg z-50 flex items-center gap-2.5 text-sm">
          <Clock class="w-4 h-4 text-zinc-400" />
          <span>Session dans {timeRemaining()}s</span>
          <button
            onClick={() => refreshSession()}
            class="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors"
          >
            <RefreshCw class="w-3 h-3" />
            Rafraîchir
          </button>
        </div>
      </Show>
      {props.children}
    </Show>
  );
}

