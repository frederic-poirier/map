import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect, onMount } from "solid-js";
import { initAuth, auth } from '../hooks/useAuth'
import { setAuthLoading } from "../context/LoadingContext";

export const PUBLIC_PATHS = ["/login", "/callback", "/auth/login"];

export default function AuthGate(props) {
  const navigate = useNavigate();
  const location = useLocation();

  onMount(() => initAuth());

  createEffect(() => {
    const currentAuth = auth();
    setAuthLoading(currentAuth.loading);

    if (currentAuth.loading) return;

    const isPublic = PUBLIC_PATHS.some((path) =>
      location.pathname.startsWith(path)
    );

    if (!currentAuth.user && !isPublic) {
      navigate("/login", { replace: true });
      return;
    }
  });

  return props.children;
}
