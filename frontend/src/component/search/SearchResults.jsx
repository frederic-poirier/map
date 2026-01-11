import { Show, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useMap } from "../../context/MapContext";
import { usePlace } from "../../context/PlaceContext";
import { useSearch } from "../../context/SearchContext";
import { useLocation } from "../../context/LocationContext";
import MapPin from "lucide-solid/icons/map-pin";
import Navigation from "lucide-solid/icons/navigation";
import Bookmark from "lucide-solid/icons/bookmark";
import useCoordinates from "../../utils/useCoordinates";

export default function SearchResults() {
  const navigate = useNavigate();
  const { getDistance, getAngle } = useCoordinates();
  const { mapCenter, flyTo, addMarker } = useMap();
  const { selectPlace } = usePlace();
  const { locations } = useLocation();
  const {
    reset,
    results,
    selectedIndex,
    setSelectedIndex,
    isSearchFocused,
    query,
  } = useSearch();

  // Filter saved locations that match the query
  const matchingSavedLocations = () => {
    const locs = locations();
    const q = query();
    if (!locs || q.length < 2) return [];
    const qLower = q.toLowerCase();
    return locs.filter((loc) => loc.name.toLowerCase().includes(qLower));
  };

  const handleSelect = (feature) => {
    const [lon, lat] = feature.geometry.coordinates;
    const props = feature.properties;
    flyTo({ lat, lon });
    addMarker({ lat, lon });
    
    const placeId = selectPlace({
      name: props.name,
      latitude: lat,
      longitude: lon,
      address: props.street,
      city: props.city,
      district: props.district,
      postcode: props.postcode,
      housenumber: props.housenumber,
      osmKey: props.osm_key,
      osmValue: props.osm_value,
      type: "search",
    });
    
    // Navigate to place page
    navigate(`/place/${placeId}`);
  };

  const handleSelectSaved = (loc) => {
    flyTo({ lat: loc.latitude, lon: loc.longitude });
    addMarker({ lat: loc.latitude, lon: loc.longitude });
    
    const placeId = selectPlace({
      name: loc.name,
      latitude: loc.latitude,
      longitude: loc.longitude,
      type: "saved",
    });
    
    navigate(`/place/${placeId}`);
  };

  const hasResults = () => (results()?.length > 0) || (matchingSavedLocations().length > 0);

  return (
    <div class="overflow-y-auto pt-3">
      <Show
        when={hasResults()}
        fallback={
          <div class="flex flex-col items-center justify-center gap-4 px-4">
            <p class="text-center text-[var(--text-tertiary)]">
              No results found. Try adjusting your search terms.
            </p>
            <button
              onClick={reset}
              class="px-4 py-2 border border-neutral-700 hover:bg-[var(--bg-hover)] rounded text-sm text-[var(--text-primary)] transition-colors"
            >
              Reset Search
            </button>
          </div>
        }
      >
        {/* Saved Locations Section */}
        <Show when={matchingSavedLocations().length > 0}>
          <span class="text-xs font-medium px-1 text-[var(--text-tertiary)] tracking-tight flex items-center gap-1.5">
            <Bookmark size={12} />
            Saved Places
          </span>
          <ul>
            <For each={matchingSavedLocations()}>
              {(loc, i) => (
                <li
                  class="search-item-enter"
                  style={{ "animation-delay": `${i() * 20}ms` }}
                >
                  <button
                    class="flex items-center transition-colors cursor-pointer text-left w-full hover:bg-[var(--bg-hover)]"
                    onClick={() => handleSelectSaved(loc)}
                  >
                    <div class="flex-1 px-2 py-2.5 flex items-center gap-3 min-w-0">
                      <Bookmark
                        size={16}
                        strokeWidth={1.5}
                        class="flex-shrink-0 text-[var(--accent-primary)]"
                      />
                      <div class="flex-1 min-w-0 mr-3">
                        <p class="text-sm text-[var(--text-secondary)] truncate">
                          {loc.name}
                        </p>
                      </div>
                      <div class="flex-shrink-0 flex items-center gap-1.5 text-[var(--text-tertiary)]">
                        <Navigation
                          size={11}
                          strokeWidth={2}
                          style={{
                            transform: `rotate(${getAngle([loc.longitude, loc.latitude], mapCenter())}deg)`,
                          }}
                        />
                        <span class="text-xs tabular-nums">
                          {getDistance([loc.longitude, loc.latitude], mapCenter())}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              )}
            </For>
          </ul>
        </Show>

        {/* Search Results Section */}
        <Show when={results()?.length > 0}>
          <span class="text-xs font-medium px-1 text-[var(--text-tertiary)] tracking-tight mt-2 block">
            Results
          </span>
          <ul>
            <For each={results()}>
              {(item, i) => (
                <li
                  class="search-item-enter"
                  style={{ "animation-delay": `${(i() + matchingSavedLocations().length) * 20}ms` }}
                >
                  <button
                    class="flex items-center transition-colors cursor-pointer text-left w-full"
                    classList={{
                      "bg-[var(--bg-hover)]": selectedIndex() === i(),
                    }}
                    onMouseEnter={() => setSelectedIndex(i())}
                    onClick={() => handleSelect(item)}
                  >
                    <div class="flex-1 px-2 py-2.5 flex items-center gap-3 min-w-0">
                      <MapPin
                        size={16}
                        strokeWidth={1.5}
                        class="flex-shrink-0"
                        classList={{
                          "text-[var(--text-primary)]": selectedIndex() === i(),
                          "text-[var(--text-tertiary)]": selectedIndex() !== i(),
                        }}
                      />
                      <div class="flex-1 min-w-0 mr-3">
                        <p
                          class="text-sm truncate"
                          classList={{
                            "text-[var(--text-primary)] font-medium":
                              selectedIndex() === i(),
                            "text-[var(--text-secondary)]":
                              selectedIndex() !== i(),
                          }}
                        >
                          {item.properties.name}
                        </p>
                        <Show when={item.properties.street}>
                          <p class="text-xs text-[var(--text-tertiary)] truncate">
                            {item.properties.street}
                          </p>
                        </Show>
                      </div>
                      <div class="flex-shrink-0 flex items-center gap-1.5 text-[var(--text-tertiary)]">
                        <Navigation
                          size={11}
                          strokeWidth={2}
                          style={{
                            transform: `rotate(${getAngle(item.geometry.coordinates, mapCenter())}deg)`,
                          }}
                        />
                        <span class="text-xs tabular-nums">
                          {getDistance(item.geometry.coordinates, mapCenter())}
                        </span>
                      </div>
                    </div>
                    <div
                      class="pr-3 transition-opacity"
                      classList={{
                        "opacity-100": selectedIndex() === i(),
                        "opacity-0": selectedIndex() !== i(),
                      }}
                    ></div>
                  </button>
                </li>
              )}
            </For>
          </ul>
        </Show>

        <ShortcutHint />
      </Show>
    </div>
  );
}

export function ShortcutHint() {
  const details = [
    { key: "↑↓", action: "navigate" },
    { key: "tab", action: "complete" },
    { key: "↵", action: "select" },
  ];

  return (
    <div class="px-4 pb-2 pt-3 border-neutral-800 border-t-1 text-xs text-[var(--text-tertiary)] flex items-center justify-between gap-3">
      <For each={details}>
        {(detail) => (
          <span class="flex items-center gap-1">
            <kbd class="px-1.5 py-0.5 bg-[var(--bg-secondary)] rounded text-[10px]">
              {detail.key}
            </kbd>
            {detail.action}
          </span>
        )}
      </For>
    </div>
  );
}
