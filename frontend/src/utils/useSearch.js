import { createSignal, createResource, createMemo } from "solid-js";
import { useLocation } from "~/context/LocationContext";

const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : "https://backend.frederic.dog";

/**
 * useSearch - Multi-source search orchestrator
 * @param {Object} options
 * @param {string} options.initialQuery - Initial search query
 * @param {(query: string) => void} options.onQueryChange - Callback when query changes
 * @param {() => void} options.onReset - Callback when search is reset
 */
export function useSearch(options = {}) {
  const { locations } = useLocation();

  const [query, setQueryInternal] = createSignal(options.initialQuery || "");

  // Wrapper to call onQueryChange callback
  const setQuery = (q) => {
    setQueryInternal(q);
    options.onQueryChange?.(q);
  };

  // Fetch from Photon API
  const [photonResults] = createResource(
    () => (query().length >= 3 ? query() : null),
    async (q) => {
      const response = await fetch(
        `${BACKEND_URL}/api/search?q=${encodeURIComponent(q)}&lon=-73.5674&lat=45.5019&location_bias_scale=0.5`,
        { credentials: "include" }
      );
      const data = await response.json();
      return data.features || [];
    }
  );

  // Merge saved locations and search results into navigable items
  const navigableItems = createMemo(() => {
    const locs = locations() || [];
    const q = query();
    const photon = photonResults() || [];

    // Filter saved locations that match query (2+ chars)
    const matchingSaved =
      q.length >= 2
        ? locs.filter((loc) => loc.name.toLowerCase().includes(q.toLowerCase()))
        : [];

    // Combine: saved first, then search results
    return [...matchingSaved, ...photon];
  });

  const isLoading = () => photonResults.loading;

  // Reset function
  const reset = () => {
    setQueryInternal("");
    options.onReset?.();
  };

  return {
    query,
    setQuery,
    navigableItems,
    isLoading,
    reset,
  };
}
