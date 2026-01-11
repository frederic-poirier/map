import { Show } from "solid-js";
import { SearchInput } from "~/component/search/SearchInput";
import SearchResults from "../component/search/SearchResults";
import { LocationList } from "~/component/location/LocationList";
import { useSearch } from "~/context/SearchContext";
import useKeyboard from "~/utils/useKeyboard";

export default function Home() {
  const { query } = useSearch();

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
      <SearchInput />
      <Show when={query().length >= 3} fallback={<LocationList />}>
        <SearchResults />
      </Show>
    </>
  );
}
