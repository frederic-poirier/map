import { createContext, useContext, createSignal, onMount } from 'solid-js';
const AuthContext = createContext();

export function AuthProvider(props) {
  const [user, setUser] = createSignal(null);
  const [loading, setLoading] = createSignal(true);

  const checkAuth = async () => {
    try {
      const response = await fetch('https://backend.frederic.dog/me', {
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

  const login = () => (window.location.href = 'https://backend.frederic.dog/login');
  const logout = () => (window.location.href = 'https://backend.frederic.dog/logout');

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
