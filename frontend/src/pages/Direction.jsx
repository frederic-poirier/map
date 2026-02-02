import { useSearchParams } from "@solidjs/router"
import { useMap } from "../context/MapContext"
import { usePlaceById, usePlaces } from "../hooks/usePlaces"
import usePhoton from "../hooks/usePhoton"
import { createSignal, createResource, createEffect, onMount } from "solid-js"
import { SearchPlaceInput, SearchPlaceResults } from "../components/SearchPlaces"
import MapPin from 'lucide-solid/icons/map-pin'
import Dot from 'lucide-solid/icons/dot'

export default function Direction() {
  return (
    <>
      <h1>directions</h1>
      <div className="bg-neutral-100 dark:bg-neutral-850 rounded-xl " >
        <DirectionSearch direction="from" />
        <DirectionSearch direction="to" />
      </div>
    </>
  )
}




function DirectionSearch(props) {
  const [hasFocus, setHasFocus] = createSignal(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const placeId = () => searchParams[props.direction];
  const place = usePlaceById(placeId);

  const map = useMap();
  const { searchResults } = usePhoton();
  const { encodePlaceId, getPlaceName } = usePlaces();

  const [draft, setDraft] = createSignal("");
  const [query, setQuery] = createSignal("");

  createEffect(() => {
    const p = place();
    if (p) {
      const name = getPlaceName(p);
      setDraft(name);
      setQuery(name);
    }
  });

  const [results] = createResource(
    () => query().length >= 3
      ? { query: query(), bias: map.getCamera() }
      : null,
    searchResults
  );

  const handleSelect = (place) => {
    setSearchParams({ [props.direction]: encodePlaceId(place) })
    setHasFocus(false)
  }


  const resolvedResults = () =>
    draft() === query() ? results() ?? [] : []

  return (
    <div
      className="relative"
      tabIndex={-1}
      onFocusIn={() => setHasFocus(true)}
      onFocusOut={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setHasFocus(false);
        }
      }}
    >
      <SearchPlaceInput
        icon={false}
        class="flex p-1 pr-4"
        draft={draft}
        onInput={(e) => {
          const q = e.target.value;
          setDraft(q);
          setQuery(q);
        }
        }
        onClear={() => setDraft("")}
      />

      < Show when={hasFocus()} >
        <div className="absolute w-full z-10 rounded-b-xl bg-neutral-100 dark:bg-neutral-850 border-t-1 border-neutral-700">
          <SearchPlaceResults
            results={results}
            loading={() => results.loading}
            onSelect={handleSelect}
          />
        </div>
      </Show >
    </div >
  );
}

