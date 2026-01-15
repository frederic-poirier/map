import {
  createContext,
  useContext,
  createSignal,
  onMount,
  onCleanup,
} from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import { BACKEND_URL } from "~/config";

const AuthContext = createContext();

const AUTH_CACHE_KEY = "auth_user";
const AUTH_CACHE_TIMESTAMP_KEY = "auth_timestamp";
const REFRESH_INTERVAL = 1000 * 60 * 60; // Check every hour


// Get cached auth from localStorage
const getCachedAuth = () => {
  try {
    const cached = localStorage.getItem(AUTH_CACHE_KEY);
    const timestamp = localStorage.getItem(AUTH_CACHE_TIMESTAMP_KEY);
    if (!cached) return null;

    // Return cached data with timestamp
    return {
      user: JSON.parse(cached),
      timestamp: timestamp ? parseInt(timestamp, 10) : null,
    };
  } catch {
    return null;
  }
};

// Save auth to localStorage with timestamp
const setCachedAuth = (user) => {
  try {
    if (user) {
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } else {
      localStorage.removeItem(AUTH_CACHE_KEY);
      localStorage.removeItem(AUTH_CACHE_TIMESTAMP_KEY);
    }
  } catch {
    // Ignore storage errors
  }
};

export function AuthProvider(props) {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize with cached value for optimistic UI
  const cached = getCachedAuth();
  const [user, setUser] = createSignal(cached?.user || null);
  const [isVerifying, setIsVerifying] = createSignal(true);

  // Loading only shows if no cache AND still verifying
  const loading = () => !cached?.user && isVerifying();

  // Hard redirect to /login
  const redirectToLogin = () => {
    if (location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  };

  // Verify session with backend
  const verifyAuth = async (options = {}) => {
    const { silent = false } = options;

    if (!silent) {
      setIsVerifying(true);
    }

    try {
      const response = await fetch(`${BACKEND_URL}/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.email);
        setCachedAuth(data.email);
        return true;
      } else {
        // Auth failed - clear everything and redirect
        setUser(null);
        setCachedAuth(null);
        redirectToLogin();
        return false;
      }
    } catch (error) {
      console.error("Auth verification failed:", error);
      // Network error - if we have cache, keep it (optimistic)
      // If no cache, redirect to login
      if (!cached?.user) {
        redirectToLogin();
      }
      return false;
    } finally {
      if (!silent) {
        setIsVerifying(false);
      }
    }
  };

  // Silent refresh - renews the session cookie
  const silentRefresh = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/refresh`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        // Update cache timestamp
        setCachedAuth(data.email);
        console.log("Session refreshed silently");
        return true;
      } else {
        // Refresh failed - session might be expired
        // Do a full verification
        return verifyAuth({ silent: true });
      }
    } catch (error) {
      console.error("Silent refresh failed:", error);
      return false;
    }
  };

  // Setup refresh interval
  let refreshInterval;

  onMount(() => {
    // Initial auth check
    verifyAuth();

    // Setup periodic refresh check
    refreshInterval = setInterval(() => {
      if (user()) {
        silentRefresh();
      }
    }, REFRESH_INTERVAL);
  });

  onCleanup(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });

  const login = () => {
    window.location.href = `${BACKEND_URL}/login`;
  };

  const logout = () => {
    setCachedAuth(null);
    setUser(null);
    window.location.href = `${BACKEND_URL}/logout`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isVerifying,
        login,
        logout,
        verifyAuth,
        silentRefresh,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
