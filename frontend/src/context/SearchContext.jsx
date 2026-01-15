import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  createResource,
  createMemo,
  onCleanup,
} from "solid-js";
import { useSearchParams, useNavigate } from "@solidjs/router";
import { usePlace } from "./PlaceContext";
import { useLocation } from "./SavedLocationsContext";
import useListNavigation from "../utils/useListNavigation";

const SearchContext = createContext();
const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_DELAY = 0;
const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : "https://backend.frederic.dog";

export function SearchProvider(props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectPlace } = usePlace();
  const { locations } = useLocation();

  const [query, setQuery] = createSignal(searchParams.q || "");
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

  // Fetching centralisé - uses default center, PlaceDetail handles map positioning
  const [results, { loading }] = createResource(
    () => searchParams.q,
    async (q) => {
      if (!q || q.length < MIN_QUERY_LENGTH) return [];
      // Default to Montreal center for search bias
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
    const res = results() || [];

    // Filter saved locations that match query (2+ chars)
    const matchingSaved = q.length >= 2
      ? locs.filter((loc) => loc.name.toLowerCase().includes(q.toLowerCase()))
      : [];

    // Combine: saved first, then search results - pass raw data
    return [...matchingSaved, ...res];
  });

  const handleSelectItem = (item) => {
    const name = item.properties?.name;
    setQuery(name);

    const placeId = selectPlace(item);
    navigate(`/place/${placeId}`);
  };

  // List navigation hook
  const listNav = useListNavigation({
    items: navigableItems,
    onSelect: handleSelectItem,
    handlers: {
      onTab: (item) => setQuery(item.name || item.properties?.name),
      onEscape: () => {
        if (query()) {
          setQuery("");
        } else {
          setIsSearchFocused(false);
        }
      },
    },
  });

  const reset = () => {
    setQuery("");
    setSearchParams({ q: undefined }, { replace: true });
    listNav.reset();
  };

  const value = {
    query,
    setQuery,
    results,
    loading,
    navigableItems,
    isSearchMode,
    isSearchFocused,
    setIsSearchFocused,
    ...listNav,
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
