import { createSignal, Show, createEffect, For } from "solid-js";
import { useItinerary } from "~/context/ItineraryContext";
import { useLocation } from "~/context/LocationContext";
import MapPin from "lucide-solid/icons/map-pin";
import Navigation from "lucide-solid/icons/navigation";
import ArrowUpDown from "lucide-solid/icons/arrow-up-down";
import Crosshair from "lucide-solid/icons/crosshair";
import Search from "lucide-solid/icons/search";
import X from "lucide-solid/icons/x";
import Loader2 from "lucide-solid/icons/loader-2";
import Bookmark from "lucide-solid/icons/bookmark";

// Backend URL for search
const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : "https://backend.frederic.dog";

export default function DirectionsForm() {
  const { 
    origin, destination, isLoading,
    setOriginPlace, setDestinationPlace, swapOriginDestination, planTrip 
  } = useItinerary();
  const { locations } = useLocation();
  
  const [originQuery, setOriginQuery] = createSignal("");
  const [destQuery, setDestQuery] = createSignal("");
  const [originResults, setOriginResults] = createSignal([]);
  const [destResults, setDestResults] = createSignal([]);
  const [activeField, setActiveField] = createSignal(null);
  const [isLocating, setIsLocating] = createSignal(false);

  // Filter saved locations based on query (show all if query is empty/short)
  const getMatchingSavedLocations = (query) => {
    const locs = locations();
    if (!locs) return [];
    if (query.length < 1) return locs.slice(0, 5); // Show first 5 when empty
    const q = query.toLowerCase();
    return locs.filter((loc) => loc.name.toLowerCase().includes(q));
  };

  // Debounced search for origin
  let originTimeout;
  createEffect(() => {
    const q = originQuery();
    clearTimeout(originTimeout);
    if (q.length < 2) {
      setOriginResults([]);
      return;
    }
    originTimeout = setTimeout(() => searchPlaces(q, setOriginResults), 300);
  });

  // Debounced search for destination
  let destTimeout;
  createEffect(() => {
    const q = destQuery();
    clearTimeout(destTimeout);
    if (q.length < 2) {
      setDestResults([]);
      return;
    }
    destTimeout = setTimeout(() => searchPlaces(q, setDestResults), 300);
  });

  // Update input values when origin/destination change externally
  createEffect(() => {
    const o = origin();
    if (o && !originQuery()) {
      setOriginQuery(o.name || "Current Location");
    }
  });

  createEffect(() => {
    const d = destination();
    if (d && !destQuery()) {
      setDestQuery(d.name || "Selected Location");
    }
  });

  const searchPlaces = async (query, setResults) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setResults(data.features || []);
    } catch (e) {
      setResults([]);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const place = {
          name: "Current Location",
          latitude,
          longitude,
          type: "location",
        };
        setOriginPlace(place);
        setOriginQuery("Current Location");
        setOriginResults([]);
        setActiveField(null);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const selectSavedLocation = (loc, setPlace, setQuery, setResults) => {
    const place = {
      name: loc.name,
      latitude: parseFloat(loc.latitude),
      longitude: parseFloat(loc.longitude),
      type: "saved",
    };
    setPlace(place);
    setQuery(loc.name);
    setResults([]);
    setActiveField(null);
  };

  const selectOrigin = (feature) => {
    const [lon, lat] = feature.geometry.coordinates;
    const place = {
      name: feature.properties.name,
      address: feature.properties.street,
      city: feature.properties.city,
      latitude: lat,
      longitude: lon,
      type: "search",
    };
    setOriginPlace(place);
    setOriginQuery(place.name);
    setOriginResults([]);
    setActiveField(null);
  };

  const selectDest = (feature) => {
    const [lon, lat] = feature.geometry.coordinates;
    const place = {
      name: feature.properties.name,
      address: feature.properties.street,
      city: feature.properties.city,
      latitude: lat,
      longitude: lon,
      type: "search",
    };
    setDestinationPlace(place);
    setDestQuery(place.name);
    setDestResults([]);
    setActiveField(null);
  };

  const handleSwap = () => {
    const oq = originQuery();
    const dq = destQuery();
    swapOriginDestination();
    setOriginQuery(dq);
    setDestQuery(oq);
  };

  const handlePlanTrip = () => {
    if (origin() && destination()) {
      planTrip();
    }
  };

  const clearOrigin = () => {
    setOriginQuery("");
    setOriginPlace(null);
    setOriginResults([]);
  };

  const clearDest = () => {
    setDestQuery("");
    setDestinationPlace(null);
    setDestResults([]);
  };

  // Compute matching saved locations for display
  const originSavedMatches = () => getMatchingSavedLocations(originQuery());
  const destSavedMatches = () => getMatchingSavedLocations(destQuery());

  return (
    <div class="space-y-2">
      {/* Origin Input */}
      <div class="relative">
        <div class="flex items-center gap-2">
          <div class="flex-shrink-0 w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
            <Navigation size={12} class="text-green-400" />
          </div>
          <div class="relative flex-1">
            <input
              type="text"
              placeholder="Choose starting point"
              value={originQuery()}
              onInput={(e) => setOriginQuery(e.target.value)}
              onFocus={() => setActiveField("origin")}
              onBlur={() => setTimeout(() => setActiveField(null), 200)}
              class="w-full px-3 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg-tertiary)] transition-all placeholder:text-[var(--text-tertiary)]"
            />
            <Show when={originQuery()}>
              <button
                onClick={clearOrigin}
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                <X size={14} />
              </button>
            </Show>
          </div>
        </div>

        {/* Origin Results Dropdown */}
        <Show when={activeField() === "origin"}>
          <div class="absolute left-9 right-0 mt-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] shadow-lg z-50 max-h-60 overflow-y-auto">
            {/* Use My Location Option */}
            <button
              onClick={handleUseMyLocation}
              class="w-full px-3 py-2 flex items-center gap-2 hover:bg-[var(--bg-hover)] transition-colors text-left"
            >
              <Show when={!isLocating()} fallback={<Loader2 size={14} class="animate-spin text-[var(--accent-primary)]" />}>
                <Crosshair size={14} class="text-[var(--accent-primary)]" />
              </Show>
              <span class="text-sm text-[var(--accent-primary)]">Use my location</span>
            </button>
            
            {/* Saved Locations */}
            <Show when={originSavedMatches().length > 0}>
              <div class="border-t border-[var(--border-primary)]">
                <div class="px-3 py-1 text-xs text-[var(--text-tertiary)]">
                  Saved
                </div>
                <For each={originSavedMatches()}>
                  {(loc) => (
                    <button
                      onClick={() => selectSavedLocation(loc, setOriginPlace, setOriginQuery, setOriginResults)}
                      class="w-full px-3 py-2 flex items-center gap-2 hover:bg-[var(--bg-hover)] transition-colors text-left"
                    >
                      <Bookmark size={14} class="text-[var(--accent-primary)] flex-shrink-0" />
                      <span class="text-sm text-[var(--text-primary)] truncate">{loc.name}</span>
                    </button>
                  )}
                </For>
              </div>
            </Show>

            {/* Search Results */}
            <Show when={originResults().length > 0}>
              <div class="border-t border-[var(--border-primary)]">
                <div class="px-3 py-1 text-xs text-[var(--text-tertiary)]">
                  Results
                </div>
                <For each={originResults()}>
                  {(feature) => (
                    <button
                      onClick={() => selectOrigin(feature)}
                      class="w-full px-3 py-2 flex items-center gap-2 hover:bg-[var(--bg-hover)] transition-colors text-left"
                    >
                      <MapPin size={14} class="text-[var(--text-tertiary)] flex-shrink-0" />
                      <div class="min-w-0 flex-1">
                        <div class="text-sm text-[var(--text-primary)] truncate">
                          {feature.properties.name}
                        </div>
                        <Show when={feature.properties.street || feature.properties.city}>
                          <div class="text-xs text-[var(--text-tertiary)] truncate">
                            {[feature.properties.street, feature.properties.city].filter(Boolean).join(", ")}
                          </div>
                        </Show>
                      </div>
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </Show>
      </div>

      {/* Swap Button */}
      <div class="flex justify-center">
        <button
          onClick={handleSwap}
          class="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md transition-all"
          title="Swap origin and destination"
        >
          <ArrowUpDown size={16} />
        </button>
      </div>

      {/* Destination Input */}
      <div class="relative">
        <div class="flex items-center gap-2">
          <div class="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
            <MapPin size={12} class="text-red-400" />
          </div>
          <div class="relative flex-1">
            <input
              type="text"
              placeholder="Choose destination"
              value={destQuery()}
              onInput={(e) => setDestQuery(e.target.value)}
              onFocus={() => setActiveField("dest")}
              onBlur={() => setTimeout(() => setActiveField(null), 200)}
              class="w-full px-3 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg-tertiary)] transition-all placeholder:text-[var(--text-tertiary)]"
            />
            <Show when={destQuery()}>
              <button
                onClick={clearDest}
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                <X size={14} />
              </button>
            </Show>
          </div>
        </div>

        {/* Destination Results Dropdown */}
        <Show when={activeField() === "dest"}>
          <div class="absolute left-9 right-0 mt-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] shadow-lg z-50 max-h-60 overflow-y-auto">
            {/* Saved Locations */}
            <Show when={destSavedMatches().length > 0}>
              <div>
                <div class="px-3 py-1 text-xs text-[var(--text-tertiary)]">
                  Saved
                </div>
                <For each={destSavedMatches()}>
                  {(loc) => (
                    <button
                      onClick={() => selectSavedLocation(loc, setDestinationPlace, setDestQuery, setDestResults)}
                      class="w-full px-3 py-2 flex items-center gap-2 hover:bg-[var(--bg-hover)] transition-colors text-left"
                    >
                      <Bookmark size={14} class="text-[var(--accent-primary)] flex-shrink-0" />
                      <span class="text-sm text-[var(--text-primary)] truncate">{loc.name}</span>
                    </button>
                  )}
                </For>
              </div>
            </Show>

            {/* Search Results */}
            <Show when={destResults().length > 0}>
              <div class={destSavedMatches().length > 0 ? "border-t border-[var(--border-primary)]" : ""}>
                <div class="px-3 py-1 text-xs text-[var(--text-tertiary)]">
                  Results
                </div>
                <For each={destResults()}>
                  {(feature) => (
                    <button
                      onClick={() => selectDest(feature)}
                      class="w-full px-3 py-2 flex items-center gap-2 hover:bg-[var(--bg-hover)] transition-colors text-left"
                    >
                      <MapPin size={14} class="text-[var(--text-tertiary)] flex-shrink-0" />
                      <div class="min-w-0 flex-1">
                        <div class="text-sm text-[var(--text-primary)] truncate">
                          {feature.properties.name}
                        </div>
                        <Show when={feature.properties.street || feature.properties.city}>
                          <div class="text-xs text-[var(--text-tertiary)] truncate">
                            {[feature.properties.street, feature.properties.city].filter(Boolean).join(", ")}
                          </div>
                        </Show>
                      </div>
                    </button>
                  )}
                </For>
              </div>
            </Show>

            {/* Empty state */}
            <Show when={destResults().length === 0 && destSavedMatches().length === 0}>
              <div class="px-3 py-3 text-sm text-[var(--text-tertiary)] text-center">
                {destQuery().length < 2 ? "Type to search" : "No results"}
              </div>
            </Show>
          </div>
        </Show>
      </div>

      {/* Plan Trip Button */}
      <button
        onClick={handlePlanTrip}
        disabled={!origin() || !destination() || isLoading()}
        class="w-full py-2.5 mt-1 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Show when={isLoading()} fallback={<Search size={16} />}>
          <Loader2 size={16} class="animate-spin" />
        </Show>
        <span>{isLoading() ? "Planning..." : "Get Directions"}</span>
      </button>
    </div>
  );
}
