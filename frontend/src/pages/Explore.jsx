import { Show, createSignal } from "solid-js";
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

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toggleFullscreen, mapInstance } = useMap();
  const { clearPlace, selectPlace } = usePlace();
  const { toggleTheme } = useTheme();

  const [isSearchFocused, setIsSearchFocused] = createSignal(false);

  // Search hook - handles query, fetching, merging locations + results
  const search = useSearch({
    initialQuery: searchParams.q || "",
    onQueryChange: (q) => {
      setSearchParams({ q: q.length >= 3 ? q : undefined }, { replace: true });
    },
    onReset: () => {
      setSearchParams({ q: undefined }, { replace: true });
      navigation.reset();
    },
  });

  const handleSelectItem = (item) => {
    const name = item.name || item.properties?.name;
    search.setQuery(name);
    const placeId = selectPlace(item);
    navigate(`/place/${placeId}`);
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

  return (
    <>
      <SearchInput
        value={search.query()}
        onChange={search.setQuery}
        onKeyDown={navigation.handleKeyDown}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
        onReset={search.reset}
      />
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
