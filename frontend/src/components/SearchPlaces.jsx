import { Show, For } from "solid-js";
import { Dynamic } from "solid-js/web";
import Search from 'lucide-solid/icons/search'
import X from 'lucide-solid/icons/x'
import { getPlaceAddress, getPlaceIcon, getPlaceName } from "../hooks/places";
import { State } from '../components/Layout.jsx'

// Simple input component - just renders the input with icons
export function SearchPlaceInput(props) {

  return (
    <label className={props.class || `flex items-center bg-neutral-100 px-3 outline-neutral-200 dark:bg-neutral-800/50 outline-1 dark:outline-neutral-800 rounded-xl px-2`}>
      <Show when={props.icon !== false}>
        <Search class="h-4 w-4 text-neutral-500" />
      </Show>
      <input
        ref={props.inputRef}
        className="w-full p-2.5 focus:outline-none"
        type="text"
        placeholder={props.placeholder}
        value={props.value}
        onInput={props.onInput}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
      />
      <Show when={props.value?.length > 0}>
        <button onClick={props.onClear} type="button">
          <X class="w-4 h-4 text-neutral-500" />
        </button>
      </Show>
    </label>
  );
}

// Results component that handles all states internally
export function SearchPlaceResults(props) {

  return (
    <div class="search-results">
      <Show when={props.search.isIdle()}>
        <State title={props.idleTitle} text={props.idleText} />
      </Show>

      <Show when={props.search.isLoading() || props.search.isTyping()}>
        <ul class="space-y-1 my-2">
          <For each={[1, 2, 3]}>
            {() => <ResultItemLoading />}
          </For>
        </ul>
      </Show>

      <Show when={props.search.isEmpty()}>
        <State title={props.emptyTitle || "No results"} text={props.emptyText || "Try a different search"} />
      </Show>

      <Show when={props.search.hasResults()}>
        <ul class="space-y-1 my-2">
          <For each={props.search.results()}>
            {(place) => (
              <li>
                <button
                  onClick={() => props.onSelect?.(place)}
                  class="group cursor-pointer hover:bg-neutral-800/25 px-3 py-2 grid grid-rows-2 grid-cols-[auto_1fr] w-full items-center gap-x-3 rounded-lg text-left"
                >
                  <Dynamic component={getPlaceIcon(place)} class="h-3.5 w-3.5 text-neutral-500" />
                  <h4 class="text-sm font-medium truncate">
                    {getPlaceName(place)}
                  </h4>
                  <p class="text-xs text-neutral-500 truncate mt-0.5 col-start-2">
                    {getPlaceAddress(place)}
                  </p>
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
}

export function SearchResultItem(props) {

  return (
    <li>
      <button
        onClick={() => props.onSelect?.(props.place)}
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
  );
}

function ResultItemLoading() {
  return (
    <li class="group grid grid-rows-2 grid-cols-[auto_1fr] w-full p-1 items-center gap-x-2 rounded-lg text-left">
      <div class="h-3.5 w-3.5 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded" />
      <div class="h-4 m-1 w-[24ch] bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded " />
      <div class="h-4 mx-1 w-[16ch] bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded col-start-2" />
    </li>
  );
}
