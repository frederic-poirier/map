import { createSignal, createContext, useContext } from "solid-js";

export const [loadingState, setLoadingState] = createSignal({
  auth: true,
  map: true,
});

export const isAppReady = () => {
  const state = loadingState();
  return !state.auth && !state.map;
};

export function setAuthLoading(loading) {
  setLoadingState(prev => ({ ...prev, auth: loading }));
}

export function setMapLoading(loading) {
  setLoadingState(prev => ({ ...prev, map: loading }));
}
