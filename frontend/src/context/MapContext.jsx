import { createContext, useContext } from "solid-js";

export const MapContext = createContext(null);

export function useMap() {
  const ctx = useContext(MapContext)
  if (!ctx) throw new Error('useMap must be used inside <MapProvider>')
  return ctx;
}
