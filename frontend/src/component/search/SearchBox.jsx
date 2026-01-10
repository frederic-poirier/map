import { LngLat } from "maplibre-gl";
import {
  createSignal,
  createResource,
  createUniqueId,
  Show,
  For,
  createEffect,
} from "solid-js";
import { useMap } from "../../context/MapContext";
import { usePlace } from "../../context/PlaceContext";
import Search from "lucide-solid/icons/search";
import X from "lucide-solid/icons/x";
import MapPin from "lucide-solid/icons/map-pin";
import Navigation from "lucide-solid/icons/navigation";
import Loader2 from "lucide-solid/icons/loader-2";
import Bookmark from "lucide-solid/icons/bookmark";
import Trash2 from "lucide-solid/icons/trash-2";
import Plus from "lucide-solid/icons/plus";
import Crosshair from "lucide-solid/icons/crosshair";

const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : "https://backend.frederic.dog";

// Standalone search input for mobile header
export function SearchInput(props) {
  const { mapCenter } = useMap();
  const [isSearching, setIsSearching] = createSignal(false);
  let inputRef;

  const handleFocus = () => {
    props.setIsSearchFocused(true);
    props.onFocus?.();
  };

  const clearSearch = () => {
    props.setQuery("");
    inputRef?.focus();
  };

  return (
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search
          size={16}
          strokeWidth={1.5}
          class="text-[var(--text-tertiary)]"
        />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search places..."
        value={props.query()}
        onInput={(e) => props.setQuery(e.target.value)}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => props.setIsSearchFocused(false), 200)}
        class="w-full pl-9 pr-9 py-2.5 bg-[var(--bg-secondary)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg-tertiary)] transition-all placeholder:text-[var(--text-tertiary)]"
      />
      <Show when={props.query()}>
        <button
          onClick={clearSearch}
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </Show>
    </div>
  );
}

export default function SearchBox(props) {
  const { mapCenter, flyTo, addMarker } = useMap();
  const { selectPlace } = usePlace();

  // Use props if provided (mobile), otherwise use local state (desktop)
  const [localQuery, setLocalQuery] = createSignal("");
  const [localIsSearchFocused, setLocalIsSearchFocused] = createSignal(false);

  const query = props.query || localQuery;
  const setQuery = props.setQuery || setLocalQuery;
  const isSearchFocused = props.isSearchFocused || localIsSearchFocused;
  const setIsSearchFocused =
    props.setIsSearchFocused || setLocalIsSearchFocused;
  const showInput = props.showInput !== false;

  const [isSearching, setIsSearching] = createSignal(false);
  const [selectedIndex, setSelectedIndex] = createSignal(-1);
  let inputRef;

  async function fetchResults(q) {
    if (!q || q.length < 2) return [];
    const center = mapCenter();
    if (!center) return [];

    setIsSearching(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/search?q=${encodeURIComponent(q)}&lon=${center[0]}&lat=${center[1]}&location_bias_scale=0.5`,
        { credentials: "include" }
      );
      const data = await response.json();
      return data.features || [];
    } finally {
      setIsSearching(false);
    }
  }

  const [results] = createResource(query, fetchResults);

  // Reset selection when results change
  createEffect(() => {
    results();
    setSelectedIndex(-1);
  });

  const getDistance = (itemCoordinates) => {
    const center = mapCenter();
    if (!center) return null;
    const centerLngLat = new LngLat(center[0], center[1]);
    const itemLngLat = new LngLat(itemCoordinates[0], itemCoordinates[1]);
    const dist = centerLngLat.distanceTo(itemLngLat);
    if (dist < 1000) return `${Math.round(dist)}m`;
    return `${(dist / 1000).toFixed(1)}km`;
  };

  const getAngle = (itemCoordinates) => {
    const center = mapCenter();
    if (!center) return null;
    const centerLngLat = new LngLat(center[0], center[1]);
    const itemLngLat = new LngLat(itemCoordinates[0], itemCoordinates[1]);

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

  const selectLocation = (feature) => {
    const [lon, lat] = feature.geometry.coordinates;
    const place = {
      name: feature.properties.name,
      address: feature.properties.street || feature.properties.city || null,
      latitude: lat,
      longitude: lon,
      type: "search",
    };

    flyTo({ lat, lon });
    addMarker({ lat, lon });
    selectPlace(place);
    setQuery("");
    setIsSearchFocused(false);
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    setQuery("");
    setSelectedIndex(-1);
    inputRef?.focus();
  };

  const handleFocus = () => {
    setIsSearchFocused(true);
    props.onSearchFocus?.();
  };



  const isSearchActive = () => isSearchFocused() || query().length > 0;

  const getAutocomplete = () => {
    const items = results() || [];
    const q = query().toLowerCase();
    if (items.length === 0 || !q) return "";

    const idx = selectedIndex() >= 0 ? selectedIndex() : 0;
    const name = items[idx]?.properties?.name || "";

    if (name.toLowerCase().startsWith(q)) {
      return query() + name.slice(q.length);
    }
    return "";
  };

  return (
    <div class="space-y-6">
      {/* Search section - only show input if showInput is true */}
      <Show when={showInput}>
        <div class="relative">
          {/* Search input with autocomplete */}
          <div class="relative">
            {/* Autocomplete ghost text */}
            <Show when={getAutocomplete() && isSearchFocused()}>
              <div class="absolute inset-0 pl-10 pr-10 py-3 pointer-events-none">
                <span class="text-sm text-transparent">{query()}</span>
                <span class="text-sm text-[var(--text-tertiary)]">
                  {getAutocomplete().slice(query().length)}
                </span>
              </div>
            </Show>

            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Show
                when={!isSearching()}
                fallback={
                  <Loader2
                    size={16}
                    class="animate-spin text-[var(--text-tertiary)]"
                  />
                }
              >
                <Search
                  size={16}
                  strokeWidth={1.5}
                  class="text-[var(--text-tertiary)]"
                />
              </Show>
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search places..."
              value={query()}
              onInput={(e) => setQuery(e.target.value)}
              onFocus={handleFocus}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
              onKeyDown={handleKeyDown}
              class="w-full pl-10 pr-10 py-3 bg-[var(--bg-secondary)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg-tertiary)] transition-all placeholder:text-[var(--text-tertiary)]"
            />
            <Show when={query()}>
              <button
                onClick={clearSearch}
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </Show>
          </div>

          {/* Search results dropdown */}
          <Show when={isSearchActive() && results()?.length > 0}>
            <div class="absolute left-0 right-0 top-full mt-2 z-20 search-results-enter">
              <div class="bg-[var(--bg-primary)]/95 backdrop-blur-md rounded-xl overflow-hidden py-1 border border-[var(--border-primary)]">
                <ul class="max-h-80 overflow-y-auto">
                  <For each={results()}>
                    {(item, index) => (
                      <li
                        class="search-item-enter"
                        style={{ "animation-delay": `${index() * 20}ms` }}
                      >
                        <div
                          class="flex items-center transition-colors cursor-pointer"
                          classList={{
                            "bg-[var(--bg-hover)]": selectedIndex() === index(),
                          }}
                          onMouseEnter={() => setSelectedIndex(index())}
                          onClick={() => selectLocation(item)}
                        >
                          <div class="flex-1 px-4 py-2.5 flex items-center gap-3 min-w-0">
                            <MapPin
                              size={16}
                              strokeWidth={1.5}
                              class="flex-shrink-0"
                              classList={{
                                "text-[var(--text-primary)]":
                                  selectedIndex() === index(),
                                "text-[var(--text-tertiary)]":
                                  selectedIndex() !== index(),
                              }}
                            />
                            <div class="flex-1 min-w-0 mr-3">
                              <p
                                class="text-sm truncate"
                                classList={{
                                  "text-[var(--text-primary)] font-medium":
                                    selectedIndex() === index(),
                                  "text-[var(--text-secondary)]":
                                    selectedIndex() !== index(),
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
                                  transform: `rotate(${getAngle(item.geometry.coordinates)}deg)`,
                                }}
                              />
                              <span class="text-xs tabular-nums">
                                {getDistance(item.geometry.coordinates)}
                              </span>
                            </div>
                          </div>
                          <div
                            class="pr-3 transition-opacity"
                            classList={{
                              "opacity-100": selectedIndex() === index(),
                              "opacity-0": selectedIndex() !== index(),
                            }}
                          >
                            <AddLocationButton
                              latitude={item.geometry.coordinates[1]}
                              longitude={item.geometry.coordinates[0]}
                              name={item.properties.name}
                            />
                          </div>
                        </div>
                      </li>
                    )}
                  </For>
                </ul>
                <Show when={results()?.length > 0}>
                  <div class="px-4 py-2 text-xs text-[var(--text-tertiary)] flex items-center gap-3">
                    <span class="flex items-center gap-1">
                      <kbd class="px-1.5 py-0.5 bg-[var(--bg-secondary)] rounded text-[10px]">
                        ↑↓
                      </kbd>
                      navigate
                    </span>
                    <span class="flex items-center gap-1">
                      <kbd class="px-1.5 py-0.5 bg-[var(--bg-secondary)] rounded text-[10px]">
                        tab
                      </kbd>
                      complete
                    </span>
                    <span class="flex items-center gap-1">
                      <kbd class="px-1.5 py-0.5 bg-[var(--bg-secondary)] rounded text-[10px]">
                        ↵
                      </kbd>
                      select
                    </span>
                  </div>
                </Show>
              </div>
            </div>
          </Show>
        </div>
      </Show>

      {/* Search results for mobile (when input is in header) */}
      <Show when={!showInput && isSearchActive() && results()?.length > 0}>
        <div class="relative z-20">
          <div class="bg-[var(--bg-secondary)] rounded-xl overflow-hidden py-1">
            <ul class="max-h-60 overflow-y-auto">
              <For each={results()}>
                {(item, index) => (
                  <li>
                    <div
                      class="flex items-center transition-colors cursor-pointer hover:bg-[var(--bg-hover)]"
                      classList={{
                        "bg-[var(--bg-hover)]": selectedIndex() === index(),
                      }}
                      onMouseEnter={() => setSelectedIndex(index())}
                      onClick={() => selectLocation(item)}
                    >
                      <div class="flex-1 px-4 py-2.5 flex items-center gap-3 min-w-0">
                        <MapPin
                          size={16}
                          strokeWidth={1.5}
                          class="flex-shrink-0 text-[var(--text-tertiary)]"
                        />
                        <div class="flex-1 min-w-0 mr-3">
                          <p class="text-sm text-[var(--text-primary)] truncate">
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
                              transform: `rotate(${getAngle(item.geometry.coordinates)}deg)`,
                            }}
                          />
                          <span class="text-xs tabular-nums">
                            {getDistance(item.geometry.coordinates)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
      </Show>

      {/* Saved places - blurred when searching */}
      <div
        class="transition-all duration-300"
        classList={{
          "opacity-20 blur-sm pointer-events-none scale-[0.98]":
            isSearchActive(),
        }}
      >
        <LocationList />
      </div>
    </div>
  );
}

export function LocateMeButton() {
  const { flyTo, addMarker } = useMap();
  const { selectPlace } = usePlace();
  const [isLocating, setIsLocating] = createSignal(false);

  const locateMe = () => {
    if (!navigator.geolocation) return;

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        flyTo({ lat: latitude, lon: longitude }, 15);
        addMarker({ lat: latitude, lon: longitude });
        selectPlace({
          name: "Current Location",
          address: null,
          latitude,
          longitude,
          type: "location",
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <button
      onClick={locateMe}
      disabled={isLocating()}
      data-locate-btn
      class="p-2 text-[var(--text-se)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-all disabled:opacity-50"
      title="Find my location (L)"
    >
      <Show
        when={!isLocating()}
        fallback={<Loader2 size={18} class="animate-spin" />}
      >
        <Crosshair size={18} strokeWidth={1.5} />
      </Show>
    </button>
  );
}

export function LocationList() {
  const { flyTo, addMarker } = useMap();
  const { selectPlace } = usePlace();
  const [refreshKey, setRefreshKey] = createSignal(0);

  const [locations, { refetch }] = createResource(refreshKey, async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/locations`, {
        credentials: "include",
      });
      const data = await response.json();
      return data.locations || [];
    } catch (error) {
      console.log("Error fetching user locations:", error);
      return [];
    }
  });

  const goToLocation = (location) => {
    flyTo({ lat: location.latitude, lon: location.longitude }, 16);
    addMarker({ lat: location.latitude, lon: location.longitude });
    selectPlace({
      name: location.name,
      address: null,
      latitude: location.latitude,
      longitude: location.longitude,
      type: "saved",
      id: location.id,
    });
  };

  const deleteLocation = async (locationId, e) => {
    e.stopPropagation();

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/location/${locationId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setRefreshKey((k) => k + 1);
      }
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  return (
    <div class="space-y-1">
      <div class="flex items-center justify-between px-1">
        <span class="text-xs font-medium text-[var(--text-tertiary)] tracking-tight">
          Saved
        </span>
        <Show when={locations()?.length > 0}>
          <span class="text-xs text-[var(--text-tertiary)] tabular-nums">
            {locations()?.length}
          </span>
        </Show>
      </div>

      <Show
        when={!locations.loading}
        fallback={
          <div class="flex items-center justify-center py-12">
            <Loader2
              size={20}
              class="animate-spin text-[var(--text-tertiary)]"
            />
          </div>
        }
      >
        <Show
          when={locations()?.length > 0}
          fallback={
            <div class="text-center py-12">
              <Bookmark
                size={20}
                strokeWidth={1.5}
                class="mx-auto mb-2 text-[var(--text-tertiary)]"
              />
              <p class="text-sm text-[var(--text-tertiary)]">No saved places</p>
            </div>
          }
        >
          <ul class="space-y-0.5">
            <For each={locations()}>
              {(location, index) => (
                <li
                  class="group location-item-enter"
                  style={{ "animation-delay": `${index() * 30}ms` }}
                >
                  <div
                    class="flex items-center gap-2 px-2 py-2 -mx-2 rounded-lg hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
                    onClick={() => goToLocation(location)}
                  >
                    <MapPin
                      size={14}
                      strokeWidth={1.5}
                      class="text-[var(--text-tertiary)] flex-shrink-0"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-[var(--text-primary)] truncate">
                        {location.name}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteLocation(location.id, e)}
                      class="p-1 text-[var(--text-tertiary)] hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </Show>
    </div>
  );
}

export function AddLocationButton(props) {
  const id = createUniqueId();
  const [isSaving, setIsSaving] = createSignal(false);
  const [saved, setSaved] = createSignal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const form = e.target;
    const locationName = form.locationName.value;
    if (!locationName) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          latitude: props.latitude,
          longitude: props.longitude,
          name: locationName,
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => {
          form.reset();
          document.getElementById(id)?.hidePopover();
          setSaved(false);
        }, 600);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        popoverTarget={id}
        onClick={(e) => e.stopPropagation()}
        class="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-all"
        title="Save"
      >
        <Plus size={14} strokeWidth={1.5} />
      </button>
      <form
        onsubmit={handleSubmit}
        popover
        id={id}
        class="popup-enter p-5 bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-64"
      >
        <p class="text-sm font-medium text-[var(--text-primary)] mb-3">
          Save place
        </p>
        <div class="space-y-3">
          <input
            type="text"
            name="locationName"
            id="locationName"
            value={props.name || ""}
            onClick={(e) => e.stopPropagation()}
            class="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg-tertiary)] transition-all placeholder:text-[var(--text-tertiary)]"
            placeholder="Name..."
          />
          <div class="flex gap-2">
            <button
              type="button"
              popoverTarget={id}
              popoverTargetAction="hide"
              onClick={(e) => e.stopPropagation()}
              class="flex-1 px-3 py-2 text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving() || saved()}
              onClick={(e) => e.stopPropagation()}
              class="flex-1 px-3 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all disabled:opacity-70 flex items-center justify-center"
            >
              <Show
                when={saved()}
                fallback={
                  <Show when={isSaving()} fallback="Save">
                    <Loader2 size={14} class="animate-spin" />
                  </Show>
                }
              >
                <Check size={14} />
              </Show>
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
