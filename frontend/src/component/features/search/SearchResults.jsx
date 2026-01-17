import { Show, For } from "solid-js";
import { useMap } from "~/context/MapContext";
import { usePlace } from "~/context/PlaceContext";
import MapPin from "lucide-solid/icons/map-pin";
import Navigation from "lucide-solid/icons/navigation";
import Bookmark from "lucide-solid/icons/bookmark";
import useCoordinates from "../../../utils/useCoordinates";
import { getPlaceType } from "../place/placeTypeMap";

// Helper to check if item is a saved location (has placeId) vs search result (has geometry)

// Extract display info from either saved location or search result
const getItemInfo = (i) => {
  return {
    name: i.name || i.properties?.name,
    street: i.properties?.street,
    latitude: i.geometry?.coordinates[1],
    longitude: i.geometry?.coordinates[0],
  };
};

export default function SearchResults(props) {
  const { isSavedPlace } = usePlace();
  const handleSelect = (index) => {
    props.onSelect?.(index);
  };

  const hasResults = () => props.items?.length > 0;

  const getItemIcon = (item, index) => {
    if (isSavedPlace(item.placeId)) {
      return (
        <Bookmark
          size={16}
          strokeWidth={1.5}
          class="flex-shrink-0 text-[var(--accent-primary)]"
        />
      );
    }

    // Get the appropriate icon based on place type
    const properties = item.properties || {};
    const placeType = getPlaceType(properties);
    const IconComponent = placeType.icon;

    return (
      <IconComponent
        size={16}
        strokeWidth={1.5}
        class="flex-shrink-0"
        classList={{
          "text-[var(--text-primary)]": props.isSelected(index),
          "text-[var(--text-tertiary)]": !props.isSelected(index),
        }}
      />
    );
  };

  const getItemSubtitle = (item) => {
    const info = getItemInfo(item);
    if (info.street) {
      return (
        <p class="text-xs text-[var(--text-tertiary)] truncate">
          {info.street}
        </p>
      );
    }
    return null;
  };

  return (
    <div class="overflow-y-auto pt-3">
      <Show
        when={hasResults()}
        fallback={<EmptyState onReset={props.onReset} />}
      >
        <Show when={!props.loading} fallback={<LoadingState />}>
          <ul>
            <For each={props.items}>
              {(item, i) => {
                const info = getItemInfo(item);
                return (
                  <li
                    class="search-item-enter"
                    style={{ "animation-delay": `${i() * 20}ms` }}
                  >
                    <button
                      class="flex items-center transition-colors cursor-pointer text-left w-full hover:bg-[var(--bg-hover)]"
                      classList={{
                        "bg-[var(--bg-hover)]": props.isSelected(i()),
                      }}
                      onMouseEnter={() => props.setSelectedIndex(i())}
                      onClick={() => handleSelect(i())}
                    >
                      <div class="flex-1 px-2 py-2.5 flex items-center gap-3 min-w-0">
                        {getItemIcon(item, i())}
                        <div class="flex-1 min-w-0 mr-3">
                          <p
                            class="text-sm truncate"
                            classList={{
                              "text-[var(--text-primary)] font-medium":
                                props.isSelected(i()),
                              "text-[var(--text-secondary)]":
                                !props.isSelected(i()),
                            }}
                          >
                            {info.name}
                          </p>
                          {getItemSubtitle(item)}
                        </div>
                        <DirectionAndDistance
                          coordinates={[info.longitude, info.latitude]}
                        />
                      </div>
                      <div
                        class="pr-3 transition-opacity"
                        classList={{
                          "opacity-100": props.isSelected(i()),
                          "opacity-0": !props.isSelected(i()),
                        }}
                      ></div>
                    </button>
                  </li>
                );
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
  const skeletonItems = Array.from({ length: 25 }, (_, i) => i);

  // Generate random place types for skeleton icons
  const getRandomPlaceType = () => {
    const types = [
      { amenity: "restaurant" },
      { amenity: "cafe" },
      { amenity: "school" },
      { amenity: "hospital" },
      { shop: "supermarket" },
      { tourism: "museum" },
      { amenity: "bank" },
      { amenity: "parking" },
    ];
    return types[Math.floor(Math.random() * types.length)];
  };

  return (
    <div class="overflow-y-auto pt-3">
      <ul>
        <For each={skeletonItems}>
          {(i) => {
            const placeType = getRandomPlaceType();
            const IconComponent = getPlaceType(placeType).icon;

            return (
              <li class="animate-pulse">
                <div class="flex items-center transition-colors cursor-pointer text-left w-full hover:bg-[var(--bg-hover)]">
                  <div class="flex-1 px-2 py-2.5 flex items-center gap-3 min-w-0">
                    <div class="flex-shrink-0">
                      <IconComponent
                        size={16}
                        strokeWidth={1.5}
                        class="text-[var(--text-tertiary)] opacity-40"
                      />
                    </div>
                    <div class="flex-1 min-w-0 mr-3">
                      <div class="h-3.5 bg-[var(--bg-tertiary)] rounded w-3/4 mb-2"></div>
                      <div class="h-2.5 bg-[var(--bg-secondary)] rounded w-1/2"></div>
                    </div>
                    <div class="flex-shrink-0 w-12 h-5 bg-[var(--bg-secondary)] rounded"></div>
                  </div>
                </div>
              </li>
            );
          }}
        </For>
      </ul>
    </div>
  );
}

function EmptyState(props) {
  return (
    <div class="flex flex-col items-center justify-center gap-4 px-4">
      <p class="text-center text-[var(--text-tertiary)]">
        No results found. Try adjusting your search terms.
      </p>
      <button
        onClick={props.onReset}
        class="px-4 py-2 border border-neutral-700 hover:bg-[var(--bg-hover)] rounded text-sm text-[var(--text-primary)] transition-colors"
      >
        Reset Search
      </button>
    </div>
  );
}

function DirectionAndDistance({ coordinates }) {
  const { getDistance, getAngle } = useCoordinates();
  const { getCenter } = useMap();

  return (
    <div class="flex items-center gap-1.5 text-[var(--text-tertiary)]">
      <Navigation
        size={11}
        strokeWidth={2}
        style={{
          transform: `rotate(${getAngle({ lon: coordinates[0], lat: coordinates[1] }, getCenter())}deg)`,
        }}
      />
      <span class="text-xs tabular-nums">
        {getDistance({ lon: coordinates[0], lat: coordinates[1] }, getCenter())}
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
