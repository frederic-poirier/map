import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  createResource,
  onCleanup,
} from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { useMap } from "../../context/MapContext";
import { usePlace } from "../../context/PlaceContext";

const SearchContext = createContext();
const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_DELAY = 0;
const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : "https://backend.frederic.dog";

export function SearchProvider(props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { mapCenter, flyTo, addMarker } = useMap();
  const { selectPlace } = usePlace();

  const [query, setQuery] = createSignal(searchParams.q || "");
  const [selectedIndex, setSelectedIndex] = createSignal(-1);
  const [isSearchFocused, setIsSearchFocused] = createSignal(false);

  const isSearchMode = () => query().length >= MIN_QUERY_LENGTH;

  // Synchro URL
  createEffect(() => {
    const currentQuery = query();
    const timeoutID = setTimeout(() => {
      setSearchParams(
        {
          q: currentQuery.length >= MIN_QUERY_LENGTH ? currentQuery : undefined,
        },
        { replace: true }
      );
    }, DEBOUNCE_DELAY);
    onCleanup(() => clearTimeout(timeoutID));
  });

  // Fetching centralisé
  const [results] = createResource(
    () => ({ q: searchParams.q, center: mapCenter() }),
    async (source) => {
      if (!source.q || source.q.length < MIN_QUERY_LENGTH || !source.center)
        return [];
      const response = await fetch(
        `${BACKEND_URL}/api/search?q=${encodeURIComponent(source.q)}&lon=${source.center[0]}&lat=${source.center[1]}&location_bias_scale=0.5`,
        { credentials: "include" }
      );
      const data = await response.json();
      return data.features || [];
    }
  );

  const reset = () => {
    setQuery("");
    setSelectedIndex(-1);
  };

  const selectLocation = (feature) => {
    const [lon, lat] = feature.geometry.coordinates;
    setQuery(feature.properties.name);
    setSelectedIndex(-1);
    flyTo({ lat, lon });
    addMarker({ lat, lon });
    selectPlace({
      name: feature.properties.name,
      latitude: lat,
      longitude: lon,
      type: "search",
    });
  };

  const value = {
    query,
    setQuery,
    results,
    isSearchMode,
    selectedIndex,
    setSelectedIndex,
    isSearchFocused,
    setIsSearchFocused,
    selectLocation,
    reset,
  };

  return (
    <SearchContext.Provider value={value}>
      {props.children}
    </SearchContext.Provider>
  );
}

// Hook pour consommer le cerveau
export function useSearch() {
  return useContext(SearchContext);
}
