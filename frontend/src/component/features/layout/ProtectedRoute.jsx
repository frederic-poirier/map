import { Show } from "solid-js";
import { useAuth } from "../../../context/AuthContext";

/**
 * ProtectedRoute - wraps content that requires authentication.
 * With the new auth flow:
 * - If user has cached auth, content shows immediately (optimistic)
 * - Skeleton loading is handled at the Layout level
 * - Redirect to /login is handled by AuthContext
 */
export function ProtectedRoute(props) {
  const auth = useAuth();

  return <Show when={auth.user()}>{props.children}</Show>;
}
