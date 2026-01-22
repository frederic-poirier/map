
import { onMount, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Map from "lucide-solid/icons/map";
import AlertCircle from "lucide-solid/icons/alert-circle";

export default function Auth() {
  const navigate = useNavigate();
  const [status, setStatus] = createSignal("Vérification de la session...");
  const [error, setError] = createSignal(null);

  onMount(async () => {
    try {
      const res = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setStatus("Connexion réussie! Redirection...");
          setTimeout(() => navigate("/", { replace: true }), 500);
        } else {
          setStatus("Session non authentifiée");
          setTimeout(() => navigate("/login", { replace: true }), 1500);
        }
      } else {
        setError("Erreur d'authentification");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    } catch (e) {
      setError("Erreur de connexion");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    }
  });

  return (
    <div class="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="bg-white rounded-3xl shadow-xl p-8">
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
              {error() ? (
                <AlertCircle class="w-6 h-6 text-red-500" />
              ) : (
                <Map class="w-6 h-6 text-zinc-400 animate-pulse" />
              )}
            </div>
            <p class="text-zinc-600 font-medium">{status()}</p>
            {error() && (
              <p class="text-red-500 text-sm mt-3 text-center bg-red-50 px-4 py-2 rounded-xl">
                {error()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

