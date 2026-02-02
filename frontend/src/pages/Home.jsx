import usePhoton from "../hooks/usePhoton";
import { createResource, createSignal, createEffect, For, Show } from "solid-js";
import { useNavigate, useSearchParams } from '@solidjs/router'
import Search from 'lucide-solid/icons/search'
import X from 'lucide-solid/icons/x'
import usePlaces from "../hooks/usePlaces";
import { State, Header } from '../components/Layout.jsx'
import { useMap } from "../context/MapContext.jsx";

export default function Home() {
  const map = useMap()
  const [params, setParams] = useSearchParams();
  const { searchResults } = usePhoton();

  const [draft, setDraft] = createSignal(params.search || "");
  const [query, setQuery] = createSignal(params.search || "");

  const hasQuery = () => query().length >= 3;
  const isPending = () => draft() !== query() && draft().length >= 3;

  const camera = map.getCamera();

  const [results] = createResource(
    () => hasQuery()
      ? {
        query: query(),
        bias: camera,
      }
      : null,
    searchResults
  );

  let timeout;
  const handleInput = (e) => {
    const q = e.target.value;
    setDraft(q);

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setQuery(q);
      setParams({ search: q });
    }, 300);
  };

  createEffect(() => {
    setQuery(params.search || "");
    setDraft(params.search || "");
  });

  const clearSearch = () => {
    setDraft('');
    setParams({ search: '' });
  }

  return (
    <>
      <Header>
        <label className="flex items-center bg-neutral-100 px-3 outline-neutral-200 dark:bg-neutral-800/50 outline-1 dark:outline-neutral-800 rounded-xl px-2">
          <Search class="h-4 w-4 text-neutral-500" />
          <input
            className="w-full p-2.5 focus:outline-none"
            type="text"
            placeholder="Search places..."
            value={draft()}
            onInput={handleInput}
          />
          <Show when={draft().length > 0}>
            <button onClick={clearSearch}><X class="w-4 h-4 text-neutral-500" /></button>
          </Show>
        </label>
      </Header>

      <Show when={hasQuery()} fallback={<State title="Find your way" text="Search for restaurants, shops, landmarks, or any destination" />}>
        <Results results={results} loading={isPending} />
      </Show>
    </>
  )
}

function Results(props) {
  const features = () => props.results() || [];
  const count = () => features().length;

  return (
    <Show when={count() > 0} fallback={<State title="No results" text="Try a different search" />} >
      <div class="mt-4">
        <ul class="space-y-1 my-2">
          <For each={features()}>
            {(result) => (
              <ResultItem
                place={result}
                loading={props.loading}
              />
            )}
          </For>
        </ul>
      </div>
    </Show>
  )
}
function ResultItem(props) {
  const navigate = useNavigate()
  const { addPlaceCache, getPlaceAddress, getPlaceIcon, getPlaceName } = usePlaces()
  const handleClick = () => navigate(`/place/${addPlaceCache(props.place)}`)

  return (
    <Show
      when={!props.loading()}
      fallback={<ResultItemLoading />}
    >
      <li>
        <button
          onClick={handleClick}
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
    </Show>
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
