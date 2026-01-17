import { createSignal, createResource, createMemo } from "solid-js";
import { BACKEND_URL } from "~/config";
import { useMap } from "~/context/MapContext";
import { usePlace } from "~/context/PlaceContext";

export function useSearch(options = {}) {
  const { savedPlaces } = usePlace();
  const { getCenter } = useMap();
  const [query, setQueryInternal] = createSignal(options.initialQuery || "");

  // Wrapper to call onQueryChange callback
  const setQuery = (q) => {
    setQueryInternal(q);
    options.onQueryChange?.(q);
  };

  // Fetch from Photon API
  const [photonResults, { refetch }] = createResource(
    () => (query().length >= 3 ? query() : null),
    async (q) => {
      const center = getCenter();
      const response = await fetch(
        `${BACKEND_URL}/api/search?q=${encodeURIComponent(q)}&lon=${center.lon}&lat=${center.lat}&location_bias_scale=0.5`,
        { credentials: "include" }
      );
      const data = await response.json();
      return data.features || [];
    }
  );

  // Merge saved locations and search results into navigable items
  const navigableItems = createMemo(() => {
    const saved = savedPlaces() || [];
    const q = query();
    const photon = photonResults() || [];

    // Filter saved locations that match query (2+ chars)
    const matchingSavedByName =
      q.length >= 2
        ? saved.filter((loc) =>
            loc.name.toLowerCase().includes(q.toLowerCase())
          )
        : [];

    const matchingSavedByAddress =
      q.length >= 2
        ? saved.filter((loc) => {
            const addr =
              loc.properties?.street + " " + loc.properties?.housenumber || "";
            return addr.toLowerCase().includes(q.toLowerCase());
          })
        : [];

    // Combine: saved first, then search results
    return [...matchingSavedByName, ...matchingSavedByAddress, ...photon];
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
    refetch,
  };
}
