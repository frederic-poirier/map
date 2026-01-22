import { createSignal, createEffect, onCleanup } from "solid-js";

export const [auth, setAuth] = createSignal({
  loading: true,
  user: null,
  expiresAt: null,
});

let refreshInterval = null;
let visibilityHandler = null;

export async function initAuth() {
  console.log("[useAuth] initAuth called");
  
  try {
    const res = await fetch("/api/me", {
      method: "GET",
      credentials: "include",
    });

    console.log("[useAuth] /api/me response", { status: res.status, ok: res.ok });

    if (res.ok) {
      const user = await res.json();
      console.log("[useAuth] User data", user);
      
      setAuth({
        loading: false,
        user: user.authenticated ? user : null,
        expiresAt: user.expiresAt || null,
      });
      
      if (user.authenticated) {
        startRefreshTimer();
      }
    } else {
      console.log("[useAuth] Not authenticated");
      setAuth({ loading: false, user: null, expiresAt: null });
      stopRefreshTimer();
    }
  } catch (error) {
    console.log("[useAuth] Error", error.message);
    setAuth({ loading: false, user: null, expiresAt: null });
    stopRefreshTimer();
  }
}

export async function refreshSession() {
  console.log("[useAuth] Refreshing session...");
  
  try {
    const res = await fetch("/api/refresh", {
      method: "POST",
      credentials: "include",
    });

    console.log("[useAuth] Refresh response", { status: res.status, ok: res.ok });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        await initAuth();
      }
    } else {
      setAuth({ loading: false, user: null, expiresAt: null });
      stopRefreshTimer();
    }
  } catch (error) {
    console.log("[useAuth] Refresh error", error.message);
    setAuth({ loading: false, user: null, expiresAt: null });
    stopRefreshTimer();
  }
}

function startRefreshTimer() {
  stopRefreshTimer();

  refreshInterval = setInterval(() => {
    const currentAuth = auth();
    if (currentAuth.user) {
      const expiresAt = currentAuth.expiresAt || Date.now() + 14 * 60 * 1000;
      const timeUntilExpiry = expiresAt - Date.now();

      console.log("[useAuth] Timer check", { 
        hasExpiresAt: !!currentAuth.expiresAt,
        timeUntilExpiry,
      });

      if (timeUntilExpiry < 2 * 60 * 1000) {
        refreshSession();
      }
    }
  }, 30000);

  visibilityHandler = () => {
    if (document.visibilityState === "visible") {
      console.log("[useAuth] Tab visible, revalidating...");
      initAuth();
    }
  };
  document.addEventListener("visibilitychange", visibilityHandler);
}

function stopRefreshTimer() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  if (visibilityHandler) {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }
}

export async function logout() {
  console.log("[useAuth] Logout called");
  
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.log("[useAuth] Logout fetch error", error.message);
  }
  
  setAuth({ loading: false, user: null, expiresAt: null });
  stopRefreshTimer();
}

onCleanup(() => {
  stopRefreshTimer();
});

export function getAuth() {
  return auth();
}

