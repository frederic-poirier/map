import { createSignal, createResource, createMemo, createEffect } from "solid-js";
import { useMap } from "../../context/MapContext";
import { getPlaceCache } from "./store";
import { reverseResult, searchResults } from "./api";

export function usePlaceById(id) {
  const cached = createMemo(() =>
    typeof id === "function" ? getPlaceCache(id()) : getPlaceCache(id)
  );

  const [fetched] = createResource(
    () => {
      const value = typeof id === "function" ? id() : id;
      return value && !cached() ? value : null;
    },
    reverseResult
  );

  return createMemo(() => cached() ?? fetched());
}

export function useSearchPlace(options = {}) {
  const { debounce = 300 } = options;
  const map = useMap();

  const [query, setQueryRaw] = createSignal("");
  const [debouncedQuery, setDebouncedQuery] = createSignal("");
  const [bias, setBias] = createSignal(map.getCamera());

  let timeoutId;
  const setQuery = (value) => {
    setQueryRaw(value);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      setDebouncedQuery(value);
    }, debounce);
  };

  const searchParams = createMemo(() => {
    const q = debouncedQuery();
    const b = bias();

    if (!q || !b || q.length < 3) return null;

    return {
      query: q,
      bias: b,
    };
  });

  const [results, { refetch }] = createResource(searchParams, searchResults);

  const state = createMemo(() => {
    const q = query();
    const dq = debouncedQuery();
    const r = results();
    const loading = results.loading;

    if (!q || q.length === 0) return "idle";
    if (q !== dq) return "typing";
    if (loading) return "loading";
    if (!r || r.length === 0) return "empty";
    return "results";
  });

  const clear = () => {
    setQueryRaw("");
    setDebouncedQuery("");
    clearTimeout(timeoutId);
  };

  return {
    query,
    setQuery,
    debouncedQuery,
    bias,
    setBias,
    results: () => results() ?? [],
    refetch,
    state,
    isIdle: () => state() === "idle",
    isTyping: () => state() === "typing",
    isLoading: () => state() === "loading",
    isEmpty: () => state() === "empty",
    hasResults: () => state() === "results",
    clear,
  };
}
