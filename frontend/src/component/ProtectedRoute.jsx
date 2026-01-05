import { Show } from 'solid-js';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute(props) {
  const auth = useAuth();

  return (
    <Show when={!auth.loading()} fallback={<div>Loading...</div>}>
      <Show
        when={auth.user()}
        fallback={
          <div style="text-align: center; margin-top: 50px;">
            <h1>Accès réservé</h1>
            <p>Vous devez être connecté pour voir la carte.</p>
            <button onClick={() => auth.login()}>Se connecter avec Google</button>
          </div>
        }
      >
        {props.children}
      </Show>
    </Show>
  );
}
