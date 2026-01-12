import { Show, For } from "solid-js";
import { useSearch } from "../../context/SearchContext";
import { useMap } from "~/context/MapContext";
import MapPin from "lucide-solid/icons/map-pin";
import Navigation from "lucide-solid/icons/navigation";
import Bookmark from "lucide-solid/icons/bookmark";
import useCoordinates from "../../utils/useCoordinates";

// Helper to check if item is a saved location (has placeId) vs search result (has geometry)
const isSavedLocation = (item) => !!item.placeId;

// Extract display info from either saved location or search result
const getItemInfo = (item) => {
  if (isSavedLocation(item)) {
    return {
      name: item.name,
      street: null,
      latitude: item.latitude,
      longitude: item.longitude,
    };
  }
  // Search result (GeoJSON feature)
  const props = item.properties || {};
  return {
    name: props.name,
    street: props.street,
    latitude: item.geometry?.coordinates[1],
    longitude: item.geometry?.coordinates[0],
  };
};

export default function SearchResults() {
  console.log('SearchResults rendering');

  const {
    navigableItems,
    loading,
    setSelectedIndex,
    isSelected,
    selectCurrent,
  } = useSearch();

  const handleSelect = (index) => {
    setSelectedIndex(index);
    selectCurrent();
  };

  const hasResults = () => navigableItems().length > 0;

  const getItemIcon = (item, index) => {
    if (isSavedLocation(item)) {
      return (
        <Bookmark
          size={16}
          strokeWidth={1.5}
          class="flex-shrink-0 text-[var(--accent-primary)]"
        />
      );
    }
    return (
      <MapPin
        size={16}
        strokeWidth={1.5}
        class="flex-shrink-0"
        classList={{
          "text-[var(--text-primary)]": isSelected(index),
          "text-[var(--text-tertiary)]": !isSelected(index),
        }}
      />
    );
  };

  const getItemSubtitle = (item) => {
    const info = getItemInfo(item);
    if (info.street) {
      return <p class="text-xs text-[var(--text-tertiary)] truncate">{info.street}</p>;
    }
    return null;
  };

  return (
    <div class="overflow-y-auto pt-3">
      <Show when={hasResults()} fallback={<EmptyState />}>
        <Show when={!loading} fallback={<LoadingState />}>
          <ul>
            <For each={navigableItems()}>
              {(item, i) => {
                const info = getItemInfo(item);
                return (
                  <li
                    class="search-item-enter"
                    style={{ "animation-delay": `${i() * 20}ms` }}
                  >
                    <button
                      class="flex items-center transition-colors cursor-pointer text-left w-full hover:bg-[var(--bg-hover)]"
                      classList={{ "bg-[var(--bg-hover)]": isSelected(i()) }}
                      onMouseEnter={() => setSelectedIndex(i())}
                      onClick={() => handleSelect(i())}
                    >
                      <div class="flex-1 px-2 py-2.5 flex items-center gap-3 min-w-0">
                        {getItemIcon(item, i())}
                        <div class="flex-1 min-w-0 mr-3">
                          <p
                            class="text-sm truncate"
                            classList={{
                              "text-[var(--text-primary)] font-medium": isSelected(i()),
                              "text-[var(--text-secondary)]": !isSelected(i()),
                            }}
                          >
                            {info.name}
                          </p>
                          {getItemSubtitle(item)}
                        </div>
                        <DirectionAndDistance coordinates={[info.longitude, info.latitude]} />
                      </div>
                      <div
                        class="pr-3 transition-opacity"
                        classList={{
                          "opacity-100": isSelected(i()),
                          "opacity-0": !isSelected(i()),
                        }}
                      ></div>
                    </button>
                  </li>
                )
              }}
            </For>
          </ul>
        </Show>
        <ShortcutHint />
      </Show>
    </div>
  );
}

function LoadingState() {
  return (
    <div class="flex items-center justify-center py-4">
      <div class="w-4 h-4 border-2 border-[var(--text-tertiary)] border-t-[var(--text-primary)] rounded-full animate-spin"></div>
    </div>
  );
}

function EmptyState() {
  const { reset } = useSearch();
  return (
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
  );
}

function DirectionAndDistance({ coordinates }) {
  const { getDistance, getAngle } = useCoordinates();
  const { mapCenter } = useMap();

  return (
    <div class="flex items-center gap-1.5 text-[var(--text-tertiary)]">
      <Navigation
        size={11}
        strokeWidth={2}
        style={{
          transform: `rotate(${getAngle(coordinates, mapCenter())}deg)`,
        }}
      />
      <span class="text-xs tabular-nums">
        {getDistance(coordinates, mapCenter())}
      </span>
    </div>
  );
}

function ShortcutHint() {
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
