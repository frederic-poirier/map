
import { onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";

export default function Auth() {
  const navigate = useNavigate();

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
    }

    navigate("/", { replace: true });
  });

  return <div>Connexion…</div>;
}

