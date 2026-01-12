import { Show, onCleanup, onMount, createMemo } from "solid-js";
import { useMap } from "~/context/MapContext";
import { useLocation } from "~/context/LocationContext";
import { typeMap } from "./placeTypeMap";
import MapPin from "lucide-solid/icons/map-pin";
import Bookmark from "lucide-solid/icons/bookmark";

// Extract display properties from raw place (handles both saved locations and search features)
const extractPlaceInfo = (place) => {
  if (!place) return null;

  // Check if it's a GeoJSON feature (search result)
  const props = place.properties || {};

  return {
    name: place.name || props.name,
    latitude: place.latitude,
    longitude: place.longitude,
    street: place.street || props.street,
    housenumber: place.housenumber || props.housenumber,
    city: place.city || props.city,
    district: place.district || props.district,
    postcode: place.postcode || props.postcode,
    osmKey: place.osmKey || props.osm_key,
    osmValue: place.osmValue || props.osm_value,
    id: place.id,
  };
};

const getPlaceTypeInfo = (info, isSaved) => {
  if (isSaved) {
    return {
      icon: Bookmark,
      label: "Saved Place",
      color: "text-[var(--accent-primary)]",
    };
  }

  const key = info.osmKey;
  const value = info.osmValue;

  // Category mappings


  // Try specific match first
  const specificKey = `${key}:${value}`;
  if (typeMap[specificKey]) {
    return typeMap[specificKey];
  }

  // Fall back to key-only match
  if (key && typeMap[key]) {
    // Use the value as label if available
    const info = { ...typeMap[key] };
    if (value) {
      info.label =
        value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
    }
    return info;
  }

  // Default fallback
  return {
    icon: MapPin,
    label: "Location",
    color: "text-[var(--text-tertiary)]",
  };
};

export default function PlaceDetail(props) {
  const { place } = props;
  const { flyTo, addMarker, removeMarker } = useMap();
  const { locations } = useLocation();

  // Extract normalized info from raw place data
  const info = createMemo(() => extractPlaceInfo(place));

  const isSaved = () => {
    const locs = locations();
    const i = info();
    if (!locs || !i?.id) return false;
    return locs.some((l) => l.placeId === i.id);
  };

  // Center map and add marker when details render
  onMount(() => {
    const i = info();
    if (i?.latitude != null && i?.longitude != null) {
      flyTo({ lat: i.latitude, lon: i.longitude });
      addMarker({ lat: i.latitude, lon: i.longitude });
    }
  });

  onCleanup(() => removeMarker());

  const typeInfo = () => getPlaceTypeInfo(info(), isSaved());
  const IconComponent = () => typeInfo().icon;

  return (
    <Show when={info()}>
      {(i) => (
        <div class="space-y-2">
          <div class="flex items-start gap-3">
            <div
              class={`p-2 rounded-lg bg-[var(--bg-secondary)] flex-shrink-0 ${typeInfo().color}`}
            >
              <IconComponent size={18} />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-[var(--text-primary)] leading-tight">
                {i().name}
              </h3>
              <Show when={i().street}>
                <p class="text-sm text-[var(--text-secondary)] mt-0.5">
                  {i().street}
                  <Show when={i().housenumber}> {i().housenumber}</Show>
                </p>
              </Show>
            </div>
          </div>

          {/* Type badge and location */}
          <div class="flex items-center gap-2 flex-wrap">
            <span
              class={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--bg-secondary)] ${typeInfo().color}`}
            >
              {typeInfo().label}
            </span>
            <Show when={i().city || i().district}>
              <span class="text-xs text-[var(--text-tertiary)]">
                {[i().district, i().city].filter(Boolean).join(", ")}
              </span>
            </Show>
          </div>

          {/* Coordinates */}
          <div class="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
            <span>
              {i().latitude?.toFixed(5)}, {i().longitude?.toFixed(5)}
            </span>
            <Show when={i().postcode}>
              <span>{i().postcode}</span>
            </Show>
          </div>
        </div>
      )}
    </Show>
  );
}
