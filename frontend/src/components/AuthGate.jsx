import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect, onMount } from "solid-js";
import { initAuth, auth } from '../hooks/useAuth'

export const PUBLIC_PATHS = ["/login", "/callback", "/auth/login"];

export default function AuthGate(props) {
  const navigate = useNavigate();
  const location = useLocation();

  onMount(() => initAuth());



  createEffect(() => {
    const currentAuth = auth();
    if (currentAuth.loading) return;

    const isPublic = PUBLIC_PATHS.some((path) =>
      location.pathname.startsWith(path)
    );

    if (!currentAuth.user && !isPublic) {
      navigate("/login", { replace: true });
      return;
    }

    console.log(currentAuth)
    if (!currentAuth.user.edgeToken) return; // ⬅️ CRITIQUE

    (async () => {
      try {
        console.log('salut mon chou')
        const res = await fetch('/edge/photon?q=montreal', {
          headers: {
            Authorization: `Bearer ${currentAuth.user.edgeToken}`
          }
        });

        if (!res.ok) {
          console.error('Photon HTTP error', res.status);
          return;
        }

        const data = await res.json();
        console.log(data);
      } catch (err) {
        console.error('Photon error', err);
      }
    })();
  });

  return (
    <Show
      when={!auth().loading}
      fallback={
        <div class="fixed inset-0 bg-zinc-100 flex items-center justify-center z-50">
          <div class="w-10 h-10 border-2 border-zinc-200 border-t-zinc-400 rounded-full animate-spin" />
        </div>
      }
    >
      {props.children}
    </Show>
  )
}
