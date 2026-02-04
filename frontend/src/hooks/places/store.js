import { createStore } from "solid-js/store";

const [placesCache, setPlacesCache] = createStore({});

export function addPlaceCache(place, id) {
  setPlacesCache(id, place);
}

export function hasPlaceCache(id) {
  return id in placesCache;
}

export function getPlaceCache(id) {
  return placesCache[id];
}

export { placesCache, setPlacesCache };
