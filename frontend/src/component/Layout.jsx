import { AuthProvider, useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { A } from '@solidjs/router';

export default function Layout(props) {
  return (
    <>
      <AuthProvider>
        <header>
          <nav class="flex justify-between align-center p-4 max-w-4xl mx-auto">
            <A href="/">Map</A>
            <UserMenu />
          </nav>
        </header>
        <main class="p-4 max-w-4xl mx-auto">
          <ProtectedRoute>{props.children}</ProtectedRoute>
        </main>
      </AuthProvider>
    </>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  return (
    <Show when={user()}>
      <span>{user().email}</span>
      <button className="text-neutral-500 text-sm bg-neutral-100 dark:bg-neutral-900" onClick={logout}>
        Déconnexion
      </button>
    </Show>
  );
}
