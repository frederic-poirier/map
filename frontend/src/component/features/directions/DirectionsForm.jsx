import { createSignal, onMount, Show } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { useItinerary } from "~/context/ItineraryContext";
import { useSearch } from "~/utils/useSearch";
import useListNavigation from "~/utils/useListNavigation";
import SearchInput from "../search/SearchInput";
import SearchResults from "../search/SearchResults";
import MapPin from "lucide-solid/icons/map-pin";
import Search from "lucide-solid/icons/search";
import Loader2 from "lucide-solid/icons/loader-2";
import { generatePlaceId } from "~/utils/placeId";
import { usePlace } from "~/context/PlaceContext";

export default function DirectionsForm() {
  const {
    origin,
    destination,
    isLoading,
    planTrip,
    setOriginPlace,
    setDestinationPlace,
  } = useItinerary();
  const [activeField, setActiveField] = createSignal(null);

  const handlePlanTrip = () => {
    if (origin() && destination()) planTrip();
  };

  return (
    <div class="space-y-2">
      <DirectionSearch
        field="from"
        setPlace={setOriginPlace}
        activeField={activeField()}
        setActiveField={setActiveField}
      />
      <DirectionSearch
        field="to"
        setPlace={setDestinationPlace}
        activeField={activeField()}
        setActiveField={setActiveField}
      />
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

function DirectionSearch(props) {
  const { getPlaceFromCache, fetchPlaceById } = usePlace();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputDisplay, setInputDisplay] = createSignal("");

  // Initialisation au montage
  onMount(async () => {
    const id = searchParams[props.field];
    if (!id) return;

    const cache = getPlaceFromCache(id);
    if (cache) {
      props.setPlace(cache);
      setInputDisplay(cache.name || cache.properties?.name || "");
    } else {
      const fetched = await fetchPlaceById(id);
      if (fetched) {
        props.setPlace(fetched);
        setInputDisplay(fetched.name || fetched.properties?.name || "");
      }
    }
  });

  const handleSelectItem = (item) => {
    // 1. Mettre à jour l'URL
    setSearchParams(
      { [props.field]: generatePlaceId(item) },
      { replace: true }
    );
    // 2. Mettre à jour l'affichage
    setInputDisplay(item.name || item.properties?.name || "");
    search.setQuery("");
    // 3. Mettre à jour le contexte global
    props.setPlace(item);
    props.setActiveField(null);
  };

  const search = useSearch({
    initialQuery: inputDisplay(),
    field: props.field,
    onReset: () => {
      setSearchParams({ [props.field]: undefined }, { replace: true });
      navigation.reset();
    },
  });

  const navigation = useListNavigation({
    items: search.navigableItems,
    onSelect: handleSelectItem,
    handlers: {
      onTab: (item) => search.setQuery(item.properties?.name || item.name),
      onEscape: () => search.reset(),
    },
  });

  return (
    <div
      class="relative"
      onFocusOut={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          props.setActiveField(null);
        }
      }}
    >
      <SearchInput
        // On affiche la recherche en cours, sinon le nom du lieu sélectionné
        value={search.query() || inputDisplay()}
        onChange={(val) => {
          // Si on commence à taper, on "désélectionne" le lieu précédent
          if (inputDisplay() && val !== "") setInputDisplay("");
          search.setQuery(val);
        }}
        onKeyDown={navigation.handleKeyDown}
        onFocus={() => props.setActiveField(props.field)}
        onReset={() => {
          setInputDisplay("");
          props.setPlace(null);
          search.reset();
          setSearchParams({ [props.field]: undefined }, { replace: true });
        }}
        placeholder={props.field === "from" ? "Origin" : "Destination"}
        icon={<MapPin size={16} class="text-[var(--text-tertiary)]" />}
      />

      <Show
        when={search.query().length >= 2 && props.activeField === props.field}
      >
        <div class="absolute top-full left-0 right-0 z-50 mt-1 bg-[var(--bg-secondary)] rounded-lg shadow-xl border border-[var(--border-color)] overflow-y-auto">
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
    </div>
  );
}
