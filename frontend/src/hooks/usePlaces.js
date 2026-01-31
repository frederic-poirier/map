
import { createStore } from "solid-js/store";
import usePhoton from "./usePhoton";
import { getIconForFeature } from "../features/place/PlaceIcon";

const [placesCache, setPlacesCache] = createStore({});

const PRECISION = 5;

function encodeId(place) {
  const [lng, lat] = place.geometry.coordinates;
  return `${lat.toFixed(PRECISION)},${lng.toFixed(PRECISION)}`;
}

function parseId(id) {
  const [lat, lng] = id.split(",");
  return {
    lat: Number(lat),
    lng: Number(lng),
  };
}

function addCache(place) {
  const id = encodeId(place);
  setPlacesCache(id, place);
  return id
}

function hasCache(id) {
  return id in placesCache;
}

function getCache(id) {
  return placesCache[id];
}

function fetchPlace(id) {
  const { reverseResult } = usePhoton()
  return reverseResult(parseId(id))
}

function getPlaceName(place) {
  return place.properties.name
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

export default function usePlaces() {
  return {
    placesCache,
    addCache,
    hasCache,
    getCache,
    encodeId,
    parseId,
    fetchPlace,
    getPlaceAddress,
    getPlaceName,
    getPlaceIcon
  };
}

