import { decodeGeohash, encodeGeohash } from "../../utils/geohash";
import { getIconForFeature } from "../../features/place/PlaceIcon";

export function encodePlaceId(place) {
  const [lng, lat] = place.geometry.coordinates;
  return encodeGeohash(lat, lng, 10);
}

export function decodePlaceId(id) {
  const { lat, lng } = decodeGeohash(id);
  return {
    lat: Number(lat),
    lng: Number(lng),
  };
}

export function getPlaceName(place) {
  const name = place.properties?.name;
  if (!name) return getPlaceAddress(place);
  return name;
}

export function getPlaceCoords(place) {
  return place.geometry.coordinates;
}

export function getPlaceAddress(place) {
  const { street, housenumber } = place.properties ?? {};

  if (street && housenumber) {
    return `${housenumber} ${street}`;
  }

  if (street) return street;
  if (housenumber) return housenumber;

  return "No additional information";
}

export function getPlaceIcon(place) {
  return getIconForFeature(place.properties);
}
