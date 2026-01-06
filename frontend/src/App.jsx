import { ProtectedRoute } from './component/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <header>
        <h1>Map</h1>
        <UserMenu />
      </header>
      <ProtectedRoute>
        <h2>Welcome to the Map</h2>
      </ProtectedRoute>
    </AuthProvider>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  return (
    <Show when={user()}>
      <span>{user().email}</span>
      <button className="bg-neutral-100 dark:bg-neutral-900" onClick={logout}>
        Déconnexion
      </button>
    </Show>
  );
}
