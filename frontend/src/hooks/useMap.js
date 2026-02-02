import { useContext } from "solid-js";
import { MapContext } from "../context/MapContext";

export default function useMap() {
  const api = useContext(MapContext);

  if (!api) {
    throw new Error("useMap must be used inside <Map>");
  }

  return api;
}
