
import { createSignal } from "solid-js";

export const [auth, setAuth] = createSignal({
  loading: true,
  user: null,
});

export async function initAuth() {
  const token = localStorage.getItem("token");

  if (!token) {
    setAuth({ loading: false, user: null });
    return;
  }

  try {
    const res = await fetch("/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error();

    const user = await res.json();
    setAuth({ loading: false, user });
  } catch {
    localStorage.removeItem("token");
    setAuth({ loading: false, user: null });
  }
}

