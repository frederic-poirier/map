import { createEffect, createSignal, Show } from "solid-js";
import { useSearchParams, useNavigate } from "@solidjs/router";
import SearchInput from "~/component/features/search/SearchInput";
import SearchResults from "~/component/features/search/SearchResults";
import { LocationList } from "~/component/features/location/LocationList";
import { useSearch } from "~/utils/useSearch";
import useListNavigation from "~/utils/useListNavigation";
import useKeyboard from "~/utils/useKeyboard";
import { useMap } from "~/context/MapContext";
import { usePlace } from "~/context/PlaceContext";
import { useTheme } from "~/context/ThemeContext";
import { generatePlaceId } from "~/utils/placeId";
import { StickySlot, useSheetLayout } from "~/context/SheetLayoutContext";
import useCoordinates from "~/utils/useCoordinates";
import RefreshCcw from "lucide-solid/icons/refresh-ccw";

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toggleFullscreen, mapInstance, clearPlace, moveEndEvent, getCenter } =
    useMap();
  const { toggleTheme } = useTheme();
  const { addPlaceToCache } = usePlace();
  const sheetLayout = useSheetLayout();
  const { getDistance } = useCoordinates();

  const [center, setCenter] = createSignal(getCenter());
  const [showRefreshButton, setShowRefreshButton] = createSignal(false);

  // Search hook - handles query, fetching, merging locations + results
  const search = useSearch({
    initialQuery: searchParams.q || "",
    onQueryChange: (q) => {
      setCenter(getCenter());
      setShowRefreshButton(false);
      setSearchParams({ q: q.length >= 3 ? q : undefined }, { replace: true });
    },
    onReset: () => {
      setSearchParams({ q: undefined }, { replace: true });
      navigation.reset();
    },
  });

  const handleSelectItem = (item) => {
    addPlaceToCache(item);
    navigate(`/place/${generatePlaceId(item)}`);
  };

  // List navigation hook
  const navigation = useListNavigation({
    items: search.navigableItems,
    onSelect: handleSelectItem,
    handlers: {
      onTab: (item) => search.setQuery(item.name || item.properties?.name),
      onEscape: () => {
        if (search.query()) {
          search.reset();
        } else {
          setIsSearchFocused(false);
        }
      },
    },
  });

  createEffect(() => {
    const event = moveEndEvent();
    if (event) {
      if (getDistance(getCenter(), center(), false) > 50) {
        setShowRefreshButton(true);
      } else {
        setShowRefreshButton(false);
      }
    }
  });
  // Global keyboard shortcuts
  useKeyboard({
    "/": () => document.querySelector('input[placeholder*="Search"]')?.focus(),
    t: () => toggleTheme(),
    l: () => document.querySelector("[data-locate-btn]")?.click(),
    "+": () => mapInstance()?.zoomIn(),
    "=": () => mapInstance()?.zoomIn(),
    "-": () => mapInstance()?.zoomOut(),
    n: () => mapInstance()?.easeTo({ bearing: 0, pitch: 0 }),
    f: () => toggleFullscreen(),
    escape: () => clearPlace(),
  });

  const handleSearchFocus = () => sheetLayout?.openSheet?.();

  return (
    <>
      <StickySlot>
        <div class="flex gap-2 items-center">
          <SearchInput
            value={search.query()}
            onChange={search.setQuery}
            onKeyDown={navigation.handleKeyDown}
            onFocus={handleSearchFocus}
            onReset={search.reset}
          />
          <Show when={showRefreshButton()}>
            <button
              class="flex items-center aspect-square justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-xl p-1 transition-colors"
              onClick={() => {
                setCenter(getCenter());
                setShowRefreshButton(false);
                search.setQuery(search.query());
                search.refetch();
                sheetLayout.snapTo(1);
              }}
            >
              <RefreshCcw class="w-4 h-4" />
            </button>
          </Show>
        </div>
      </StickySlot>
      <Show when={search.query().length >= 3} fallback={<LocationList />}>
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
      </Show>
    </>
  );
}
