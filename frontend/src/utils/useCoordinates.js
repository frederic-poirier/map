import { LngLat } from "maplibre-gl";

export default function useCoordinates() {
  const getDistance = (itemCoordinates, center, formatted = true) => {
    if (!center) return null;
    const centerLngLat = new LngLat(center.lon, center.lat);
    const itemLngLat = new LngLat(itemCoordinates.lon, itemCoordinates.lat);
    const dist = centerLngLat.distanceTo(itemLngLat);
    if (!formatted) return dist;
    if (dist < 1000) return `${Math.round(dist)}m`;
    return `${(dist / 1000).toFixed(1)}km`;
  };

  const getAngle = (itemCoordinates, center) => {
    if (!center) return null;
    const centerLngLat = new LngLat(center.lon, center.lat);
    const itemLngLat = new LngLat(itemCoordinates.lon, itemCoordinates.lat);

    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const toDegrees = (radians) => radians * (180 / Math.PI);

    const dLon = toRadians(itemLngLat.lng - centerLngLat.lng);
    const y = Math.sin(dLon) * Math.cos(toRadians(itemLngLat.lat));
    const x =
      Math.cos(toRadians(centerLngLat.lat)) *
        Math.sin(toRadians(itemLngLat.lat)) -
      Math.sin(toRadians(centerLngLat.lat)) *
        Math.cos(toRadians(itemLngLat.lat)) *
        Math.cos(dLon);
    let bearing = toDegrees(Math.atan2(y, x));
    bearing = (bearing + 360) % 360;
    return bearing.toFixed(0);
  };
  return { getDistance, getAngle };
}
