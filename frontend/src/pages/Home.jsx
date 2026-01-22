import { createSignal, Show, onCleanup } from "solid-js";
import { auth, logout, initAuth } from "../hooks/useAuth";
import { useNavigate } from "@solidjs/router";
import MapIcon from "lucide-solid/icons/map";
import User from "lucide-solid/icons/user";
import LogOut from "lucide-solid/icons/log-out";
import Clock from "lucide-solid/icons/clock";

export default function Home() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = createSignal(false);
  const currentAuth = auth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleClickOutside(e) {
    if (showUserMenu() && !e.target.closest(".user-menu")) {
      setShowUserMenu(false);
    }
  }

  function refreshSession() {
    initAuth();
    setShowUserMenu(false);
  }

  onCleanup(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  return (
    <div class="fixed top-4 left-4 z-10">
      <div class="bg-zinc-50/90 backdrop-blur-sm border border-zinc-200/50 rounded-2xl shadow-sm p-3 min-w-56 transition-all duration-300 hover:shadow-md user-menu">
        <div class="flex items-center justify-between px-1 pb-2 border-b border-zinc-100 mb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-zinc-900 rounded-xl flex items-center justify-center">
              <MapIcon class="w-4 h-4 text-white" />
            </div>
            <span class="font-semibold text-zinc-800">Map</span>
          </div>
          <button
            onClick={() => {
              if (!showUserMenu()) {
                document.addEventListener("click", handleClickOutside);
              } else {
                document.removeEventListener("click", handleClickOutside);
              }
              setShowUserMenu(!showUserMenu());
            }}
            class="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <User class="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <div class="space-y-0.5">
          <button
            onClick={() => navigate("/map")}
            class="w-full flex items-center gap-2.5 px-2 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all duration-200"
          >
            <MapIcon class="w-4 h-4" />
            <span>Carte complète</span>
          </button>
        </div>

        <Show when={showUserMenu()}>
          <div class="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-zinc-100 py-2 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div class="px-3 py-2 border-b border-zinc-50">
              <p class="text-xs text-zinc-400 uppercase tracking-wider mb-0.5">Session</p>
              <p class="text-sm text-zinc-600 truncate">{currentAuth.user?.email}</p>
              <div class="flex items-center gap-1 mt-1 text-xs text-zinc-400">
                <Clock class="w-3 h-3" />
                <span>Expire dans 15min</span>
              </div>
            </div>
            <button
              onClick={refreshSession}
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              <Clock class="w-4 h-4" />
              <span>Prolonger la session</span>
            </button>
            <button
              onClick={handleLogout}
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut class="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}
