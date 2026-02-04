import { Show, createEffect, createSignal } from "solid-js";
import { useSearchParams } from "@solidjs/router"
import { SearchPlaceInput, SearchPlaceResults } from "../components/SearchPlaces"
import { usePlaceById, encodePlaceId, getPlaceName, useSearchPlace } from "../hooks/places";


export default function Direction() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeField, setActiveField] = createSignal(null);
  const [activeSearch, setActiveSearch] = createSignal(null)

  const handleFromSelect = (place) => {
    setSearchParams({ [activeField()]: encodePlaceId(place) });
    setActiveField(null);
  };

  let resultsRef;

  const handleFocusOut = (e) => {
    const relatedTarget = e.relatedTarget;
    const isInResults = resultsRef?.contains(relatedTarget);
    const isInSearchField = e.currentTarget.contains(relatedTarget);

    if (!isInResults && !isInSearchField) {
      setActiveField(null);
    }
  };

  return (
    <>
      <h1>Directions</h1>

      <div className="bg-neutral-100 dark:bg-neutral-850 rounded-xl">
        <SearchField
          direction="from"
          placeholder="From"
          active={activeField() === "from"}
          onSearch={setActiveSearch}
          onActive={setActiveField}
          onFocusOut={handleFocusOut}
        />
        <SearchField
          direction="to"
          placeholder="To"
          active={activeField() === "to"}
          onSearch={setActiveSearch}
          onActive={setActiveField}
          onFocusOut={handleFocusOut}
        />
      </div>

      <Show when={activeField() && activeSearch()}>
        <div ref={(el) => resultsRef = el}>
          <SearchPlaceResults
            search={activeSearch()}
            onSelect={handleFromSelect}
            emptyTitle="No places found"
            emptyText="Try a different starting point"
          />
        </div>
      </Show>
    </>
  );
}


function SearchField(props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = useSearchPlace({ debounce: 300 })
  const place = usePlaceById(() => searchParams[props.direction])

  createEffect(() => {
    const p = place()
    if (p) search.setQuery(getPlaceName(p))
  })

  const handleFocusIn = () => {
    props.onActive(props.direction)
    props.onSearch(search)
  }

  return (
    <div
      tabIndex={-1}
      onFocusIn={handleFocusIn}
      onFocusOut={props.onFocusOut}
    >
      <SearchPlaceInput
        icon={false}
        class={props.active ? "outline-1 rounded-xl outline-neutral-400 flex p-1 pr-4" : "flex p-1 pr-4"}
        value={search.query()}
        onInput={(e) => search.setQuery(e.target.value)}
        onClear={search.clear}
        placeholder={props.placeholder}
      />
    </div>
  )
}
