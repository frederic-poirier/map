
import { createStore } from "solid-js/store";
import usePhoton from "./usePhoton";
import { getIconForFeature } from "../features/place/PlaceIcon";
import { decodeGeohash, encodeGeohash } from "../utils/geohash";
import { createMemo, createResource } from "solid-js";


const [placesCache, setPlacesCache] = createStore({});


function encodePlaceId(place) {
  const [lng, lat] = place.geometry.coordinates;
  return encodeGeohash(lat, lng, 10)

}

function decodePlaceId(id) {
  const { lat, lng } = decodeGeohash(id);
  return {
    lat: Number(lat),
    lng: Number(lng),
  };
}

function addPlaceCache(place) {
  const id = encodePlaceId(place);
  setPlacesCache(id, place);
  return id
}

function hasPlaceCache(id) {
  return id in placesCache;
}

function getPlaceCache(id) {
  return placesCache[id];
}

function fetchPlace(id) {
  const { reverseResult } = usePhoton()
  return reverseResult(decodePlaceId(id))
}

function getPlaceName(place) {
  const name = place.properties.name
  if (!name) return getPlaceAddress(place)
  return place.properties.name
}

function getPlaceCoords(place) {
  return [lng, lat] = place.geometry.coordinates;
}

function getPlaceAddress(place) {
  const { street, housenumber } = place.properties ?? {};

  if (street && housenumber) {
    return `${housenumber} ${street}`;
  }

  if (street) return street;
  if (housenumber) return housenumber;

  return "No additionnal information" // Modifier plus tard, comportement differents selon le POI, eg: rue, ville..
}

function getPlaceIcon(place) {
  return getIconForFeature(place.properties)
}

export function usePlaces() {
  return {
    placesCache,
    addPlaceCache,
    hasPlaceCache,
    getPlaceCache,
    encodePlaceId,
    decodePlaceId,
    fetchPlace,
    getPlaceAddress,
    getPlaceName,
    getPlaceIcon,
    getPlaceCoords,
  };
}

export function usePlaceById(id) {
  const { getPlaceCache } = usePlaces()
  const { reverseResult } = usePhoton()

  const cached = createMemo(() => typeof id === "function" ? getPlaceCache(id()) : getPlaceCache(id))

  const [fetched] = createResource(
    () => {
      const value = typeof id === "function" ? id() : id;
      return value && !cached() ? value : null;
    },
    reverseResult
  )

  return createMemo(() => cached() ?? fetched())
}
