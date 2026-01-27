import { createSignal } from "solid-js";

export const [auth, setAuth] = createSignal({
  loading: true,
  user: null,
})

export async function initAuth() {
  try {
    const response = await fetch('/auth/me');
    if (!response.ok) return setAuth({ loading: false, user: null });
    const user = await response.json();
    setAuth({
      loading: false,
      user: user ? user : null,
    });
  } catch (error) {
    setAuth({ loading: false, user: null });
  }
}

export async function Logout() {
  try {
    await fetch("/auth/logout", { method: "POST" });
    setAuth({ loading: false, user: null });
  } catch { }
  setAuth({ loading: false, user: null });
}

export function getAuth() {
  return auth();
}
