import { createSignal, Show, createEffect } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { useItinerary } from "~/context/ItineraryContext";
import { useSearch } from "~/utils/useSearch";
import useListNavigation from "~/utils/useListNavigation";
import SearchInput from "../search/SearchInput";
import SearchResults from "../search/SearchResults";
import MapPin from "lucide-solid/icons/map-pin";
import Navigation from "lucide-solid/icons/navigation";
import ArrowUpDown from "lucide-solid/icons/arrow-up-down";
import Crosshair from "lucide-solid/icons/crosshair";
import Search from "lucide-solid/icons/search";
import Loader2 from "lucide-solid/icons/loader-2";

export default function DirectionsForm() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    origin,
    destination,
    isLoading,
    setOriginPlace,
    setDestinationPlace,
    swapOriginDestination,
    planTrip,
  } = useItinerary();

  // Track which field is active: "from" | "to" | null
  const [activeField, setActiveField] = createSignal(null);
  const [isLocating, setIsLocating] = createSignal(false);

  // Display values for the inputs (shown when not actively searching)
  const [fromDisplay, setFromDisplay] = createSignal(searchParams.from || "");
  const [toDisplay, setToDisplay] = createSignal(searchParams.to || "");

  // Shared search instance - query syncs to searchParams based on active field
  const search = useSearch({
    initialQuery: "",
    onQueryChange: (q) => {
      const field = activeField();
      if (field === "from") {
        setSearchParams({ from: q || undefined }, { replace: true });
      } else if (field === "to") {
        setSearchParams({ to: q || undefined }, { replace: true });
      }
    },
    onReset: () => {
      const field = activeField();
      if (field === "from") {
        setSearchParams({ from: undefined }, { replace: true });
        setFromDisplay("");
      } else if (field === "to") {
        setSearchParams({ to: undefined }, { replace: true });
        setToDisplay("");
      }
      navigation.reset();
    },
  });

  // Handle selection
  const handleSelectItem = (item) => {
    const name = item.name || item.properties?.name;
    const field = activeField();

    // Build place object
    const place = item.placeId
      ? {
          name: item.name,
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude),
          type: "saved",
        }
      : {
          name: item.properties?.name,
          address: item.properties?.street,
          city: item.properties?.city,
          latitude: item.geometry?.coordinates[1],
          longitude: item.geometry?.coordinates[0],
          type: "search",
        };

    if (field === "from") {
      setOriginPlace(place);
      setFromDisplay(name);
      setSearchParams({ from: undefined }, { replace: true });
    } else if (field === "to") {
      setDestinationPlace(place);
      setToDisplay(name);
      setSearchParams({ to: undefined }, { replace: true });
    }

    search.setQuery("");
    setActiveField(null);
  };

  // List navigation
  const navigation = useListNavigation({
    items: search.navigableItems,
    onSelect: handleSelectItem,
    handlers: {
      onTab: (item) => search.setQuery(item.name || item.properties?.name),
      onEscape: () => {
        search.reset();
        setActiveField(null);
      },
    },
  });

  // Handle focus on input
  const handleFocus = (field) => {
    setActiveField(field);
    // Load current display value into search query
    const currentValue = field === "from" ? fromDisplay() : toDisplay();
    search.setQuery(currentValue);
  };

  // Handle blur
  const handleBlur = () => {
    setTimeout(() => {
      if (activeField()) {
        search.setQuery("");
        setActiveField(null);
      }
    }, 200);
  };

  // Use my location
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
        setFromDisplay("Current Location");
        setSearchParams({ from: undefined }, { replace: true });
        search.setQuery("");
        setActiveField(null);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Swap origin and destination
  const handleSwap = () => {
    const fromVal = fromDisplay();
    const toVal = toDisplay();
    swapOriginDestination();
    setFromDisplay(toVal);
    setToDisplay(fromVal);
  };

  // Plan trip
  const handlePlanTrip = () => {
    if (origin() && destination()) {
      planTrip();
    }
  };

  // Sync display values when origin/destination change externally
  createEffect(() => {
    const o = origin();
    if (o && !fromDisplay()) {
      setFromDisplay(o.name || "Current Location");
    }
  });

  createEffect(() => {
    const d = destination();
    if (d && !toDisplay()) {
      setToDisplay(d.name || "Selected Location");
    }
  });

  return (
    <div class="space-y-2">
      {/* Origin Input */}
      <div class="flex items-center gap-2">
        <div class="flex-shrink-0 w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
          <Navigation size={12} class="text-green-400" />
        </div>
        <div class="flex-1">
          <SearchInput
            value={activeField() === "from" ? search.query() : fromDisplay()}
            onChange={search.setQuery}
            onKeyDown={navigation.handleKeyDown}
            onFocus={() => handleFocus("from")}
            onBlur={handleBlur}
            onReset={() => {
              setFromDisplay("");
              setOriginPlace(null);
              search.reset();
            }}
            placeholder="Choose starting point"
            class="w-full px-3 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg-tertiary)] transition-all placeholder:text-[var(--text-tertiary)]"
          />
        </div>
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
      <div class="flex items-center gap-2">
        <div class="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
          <MapPin size={12} class="text-red-400" />
        </div>
        <div class="flex-1">
          <SearchInput
            value={activeField() === "to" ? search.query() : toDisplay()}
            onChange={search.setQuery}
            onKeyDown={navigation.handleKeyDown}
            onFocus={() => handleFocus("to")}
            onBlur={handleBlur}
            onReset={() => {
              setToDisplay("");
              setDestinationPlace(null);
              search.reset();
            }}
            placeholder="Choose destination"
            class="w-full px-3 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg-tertiary)] transition-all placeholder:text-[var(--text-tertiary)]"
          />
        </div>
      </div>

      {/* Shared Search Results - shows below both inputs */}
      <Show when={activeField() && search.query().length >= 2}>
        <div class="relative">
          {/* Use My Location - only for "from" field */}
          <Show when={activeField() === "from"}>
            <button
              onClick={handleUseMyLocation}
              class="w-full px-3 py-2 flex items-center gap-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors text-left mb-2"
            >
              <Show
                when={!isLocating()}
                fallback={
                  <Loader2
                    size={14}
                    class="animate-spin text-[var(--accent-primary)]"
                  />
                }
              >
                <Crosshair size={14} class="text-[var(--accent-primary)]" />
              </Show>
              <span class="text-sm text-[var(--accent-primary)]">
                Use my location
              </span>
            </button>
          </Show>

          <SearchResults
            items={search.navigableItems()}
            loading={search.isLoading()}
            selectedIndex={navigation.selectedIndex}
            setSelectedIndex={navigation.setSelectedIndex}
            isSelected={navigation.isSelected}
            onSelect={(index) => {
              navigation.setSelectedIndex(index);
              navigation.selectCurrent();
            }}
            onReset={search.reset}
          />
        </div>
      </Show>

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
