import { Show, For } from "solid-js";
import { useMap } from "../../context/MapContext";
import { usePlace } from "../../context/PlaceContext";
import { useSearch } from "./SearchProvider";
import MapPin from "lucide-solid/icons/map-pin";
import Navigation from "lucide-solid/icons/navigation";
import useCoordinates from "../../utils/useCoordinates";
import { LocationList } from "../location/LocationList";

export default function SearchResults() {
  const { getDistance, getAngle } = useCoordinates();
  const { mapCenter, flyTo, addMarker } = useMap();
  const { selectPlace } = usePlace();
  const {
    reset,
    results,
    selectedIndex,
    setSelectedIndex,
    isSearchFocused,
    query,
  } = useSearch();

  const handleSelect = (feature) => {
    const [lon, lat] = feature.geometry.coordinates;
    flyTo({ lat, lon });
    addMarker({ lat, lon });
    selectPlace({
      name: feature.properties.name,
      latitude: lat,
      longitude: lon,
      type: "search",
    });
  };

  return (
    <div class="max-h-80 overflow-y-auto pt-3">
      {console.log(isSearchFocused())}
      <Show
        when={query().length >= 3}
        fallback={
          <div
            class={`${isSearchFocused() ? "blur-xs" : ""} transition-all`}
          >
            <LocationList />
          </div>
        }
      >
        <Show
          when={results()?.length > 0}
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
          <span class="text-xs font-medium px-1 text-[var(--text-tertiary)] tracking-tight">
            Result
          </span>
          <ul>
            <For each={results()}>
              {(item, i) => (
                <li
                  class="search-item-enter"
                  style={{ "animation-delay": `${i() * 20}ms` }}
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
                          "text-[var(--text-tertiary)]":
                            selectedIndex() !== i(),
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
          <ShortcutHint />
        </Show>
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
