import { Show } from 'solid-js';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute(props) {
  const auth = useAuth();

  return (
    <Show when={!auth.loading()} fallback={<div>Loading...</div>}>
      <Show
        when={auth.user()}
        fallback={
          <div class="text-center mt-12">
            <h1 class="font-bold">Accès réservé</h1>
            <p>Vous devez être connecté pour voir la carte.</p>
            <button
              class="border-1 border-neutral-200 dark:border-neutral-700 rounded-xl px-2 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 mt-4"
              onClick={() => auth.login()}
            >
              Se connecter avec Google
            </button>
          </div>
        }
      >
        {props.children}
      </Show>
    </Show>
  );
}
