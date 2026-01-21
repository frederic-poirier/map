
import { onMount, createEffect, Show } from "solid-js";
import { auth, initAuth } from "./useAuth";
import { useNavigate, useLocation } from "@solidjs/router";

export default function AuthGate(props) {
  const navigate = useNavigate();
  const location = useLocation();

  onMount(() => {
    initAuth();
  });

  createEffect(() => {
    if (auth().loading) return;

    if (!auth().user) {
      // routes publiques
      if (
        location.pathname === "/login" ||
        location.pathname === "/callback"
      ) {
        return;
      }

      navigate("/login", { replace: true });
    }
  });

  return (
    <Show
      when={!auth().loading}
      fallback={<div>Chargement…</div>}
    >
      {props.children}
    </Show>
  );
}

