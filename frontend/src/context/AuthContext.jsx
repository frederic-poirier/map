import { createContext, useContext, createSignal, onMount } from 'solid-js';
const AuthContext = createContext();

// Backend URL based on environment
const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:4000' : 'https://backend.frederic.dog';

export function AuthProvider(props) {
  const [user, setUser] = createSignal(null);
  const [loading, setLoading] = createSignal(true);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/me`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.email);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
    setLoading(false);
  };

  onMount(checkAuth);

  const login = () => (window.location.href = `${BACKEND_URL}/login`);
  const logout = () => (window.location.href = `${BACKEND_URL}/logout`);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
