import { Show } from "solid-js";
import Search from 'lucide-solid/icons/search'
import X from 'lucide-solid/icons/x'
import { usePlaces } from "../hooks/usePlaces";
import { State } from '../components/Layout.jsx'


export function SearchPlaceInput(props) {
  return (
    <label className={props.class ? props.class : `flex items-center bg-neutral-100 px-3 outline-neutral-200 dark:bg-neutral-800/50 outline-1 dark:outline-neutral-800 rounded-xl px-2`}>
      <Show when={props.icon !== false}>
        <Search class="h-4 w-4 text-neutral-500" />
      </Show>
      <input
        className="w-full p-2.5 focus:outline-none"
        type="text"
        placeholder="Search places..."
        value={props.draft()}
        onInput={props.onInput}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
      />
      <Show when={props.draft().length > 0}>
        <button onClick={props.onClear}><X class="w-4 h-4 text-neutral-500" /></button>
      </Show>
    </label >
  )
}


export function SearchPlaceResults(props) {
  const places = () => props.results() ?? [];

  return (
    <Show
      when={places().length > 0}
      fallback={<State title="No results" text="Try a different search" />}
    >
      <ul class="space-y-1 my-2">
        <For each={places()}>
          {(place) => (
            <ResultItem
              place={place}
              loading={props.loading}
              onSelect={props.onSelect}
            />
          )}
        </For>
      </ul>
    </Show>
  );
}


function ResultItem(props) {
  const { getPlaceAddress, getPlaceIcon, getPlaceName } = usePlaces()

  return (
    <Show
      when={!props.loading()}
      fallback={<ResultItemLoading />}
    >
      <li>
        <button
          onClick={() => props.onSelect(props.place)}
          class="group cursor-pointer hover:bg-neutral-800/25 px-3 py-2 grid grid-rows-2 grid-cols-[auto_1fr] w-full items-center gap-x-3 rounded-lg text-left"
        >
          <Dynamic component={getPlaceIcon(props.place)} class="h-3.5 w-3.5 text-neutral-500" />
          <h4 class="text-sm font-medium truncate">
            {getPlaceName(props.place)}
          </h4>
          <p class="text-xs text-neutral-500 truncate mt-0.5 col-start-2">
            {getPlaceAddress(props.place)}
          </p>
        </button>
      </li>
    </Show >
  )
}

function ResultItemLoading() {
  return (
    <li class="group grid grid-rows-2 grid-cols-[auto_1fr] w-full p-1 items-center gap-x-2 rounded-lg text-left">
      <div class="h-3.5 w-3.5 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded" />
      <div class="h-4 m-1 w-[32ch] bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded " />
      <div class="h-4 mx-1 w-[16ch] bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded col-start-2" />
    </li>
  )
}
