import usePhoton from "../hooks/usePhoton";
import { createSignal, For, Show } from "solid-js";
import { BottomSheet } from "../components/BottomSheet";
import { isSmallScreen } from "../hooks/useScreen";
import { getIconForFeature } from "../features/place/PlaceIcon";
import { useSearchParams } from '@solidjs/router'
import Search from 'lucide-solid/icons/search'
import X from 'lucide-solid/icons/x'
import Navigation from 'lucide-solid/icons/navigation'
import Compass from 'lucide-solid/icons/compass'
import Locate from 'lucide-solid/icons/locate'
import { useSheet } from "../context/SheetProvider";

function getIconForType(properties) {
  return getIconForFeature(properties);
}

function formatAddress(properties) {
  const parts = [];
  if (properties.street) {
    parts.push(properties.housenumber ? `${properties.housenumber} ${properties.street}` : properties.street);
  }
  return parts.join(', ');
}

export default function Home() {
  const [params, setParams] = useSearchParams();
  const [results] = usePhoton(() => params.search);
  const [draft, setDraft] = createSignal(params.search || "")
  const sheet = useSheet()

  const isTyping = () => draft() !== (params.search || "");
  const isFetching = () => results.loading;
  const isLoading = () => isTyping() || isFetching();
  const hasSearched = () => params.search && params.search.length >= 3;

  let timeoutID;
  const handleInput = (e) => {
    const q = e.target.value;
    setDraft(q)
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      setParams({ search: q });
    }, 300);
  };

  const clearSearch = () => {
    setDraft('');
    setParams({ search: '' });
  }

  return (
    <div class="h-full flex flex-col text-white m-3">
      <Header>
        <div className="w-16 h-1.5 bg-neutral-800 mx-auto rounded-full mb-3" />
        <nav className="flex items-center justify-between m-2">
          <h1>Map</h1>
          <button onClick={() => sheet.collapseToHeader()}>
            <X class="w-4 h-4 text-neutral-400" />
          </button>
        </nav>
        <label className="flex items-center  bg-neutral-900 outline-0 outline-neutral-800 rounded-xl px-2 mb-2 border-1 border-neutral-800">
          <Search class="h-4 w-4 text-neutral-500 group-focus-within:text-slate-400 transition-colors" />
          <input
            className="w-full p-2.5 focus:outline-none"
            type="text"
            placeholder="Search places..."
            value={draft()}
            onInput={handleInput}
          />
        </label>
      </Header>

      <div class="flex-1 overflow-y-auto">
        <Show
          when={hasSearched()}
          fallback={<EmptyState />}
        >
          <Results results={results} loading={isLoading} />
        </Show>
      </div>
    </div>
  )
}

function Header(props) {
  return (
    <Show
      when={isSmallScreen()}
      fallback={<header class="border-b border-neutral-800">{props.children}</header>}
    >
      <BottomSheet.Header>
        {props.children}
      </BottomSheet.Header>
    </Show>
  )
}

function EmptyState() {
  return (
    <div class="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div class="relative mb-5">
        <div class="relative p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
          <Locate class="h-6 w-6 text-neutral-500" />
        </div>
      </div>
      <h3 class="text-sm font-medium text-neutral-400 mb-1">
        Find your way
      </h3>
      <p class="text-xs text-neutral-500 max-w-[220px] leading-relaxed">
        Search for restaurants, shops, landmarks, or any destination
      </p>
    </div>
  )
}

function Results(props) {
  const features = () => props.results()?.features || [];
  const count = () => features().length;

  return (
    <div>
      {/* Header */}
      <Show when={!props.loading() && count() > 0}>
        <div class="flex items-center justify-between py-3 px-1">
          <span class="text-xs font-medium text-neutral-400">
            {count()} results
          </span>
        </div>
      </Show>

      {/* Results List */}
      <Show
        when={count() > 0}
        fallback={<NoResults />}
      >
        <div class="space-y-3">
          <For each={features()}>
            {(result) => (
              <ResultItem
                properties={result.properties}
                loading={props.loading}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

function NoResults() {
  return (
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="p-3 bg-neutral-900 rounded-xl border border-neutral-800 mb-4">
        <Search class="h-5 w-5 text-neutral-600" />
      </div>
      <h3 class="text-sm font-medium text-neutral-400 mb-1">
        No results
      </h3>
      <p class="text-xs text-neutral-600">
        Try a different search
      </p>
    </div>
  )
}

function ResultItem(props) {
  const iconComponent = () => getIconForType(props.properties);
  const address = () => formatAddress(props.properties);

  return (
    <Show
      when={!props.loading()}
      fallback={<ResultSkeleton />}
    >
      <button class="group w-full flex items-center gap-3 p-1 rounded-lg hover:bg-neutral-900/60 transition-colors text-left">
        {/* Icon */}
        <Dynamic component={iconComponent()} class="h-4 w-4 text-neutral-500 group-hover:text-neutral-400" />

        {/* Content */}
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium text-neutral-300 group-hover:text-slate-200 transition-colors truncate">
            {props.properties.name}
          </h4>
          <Show when={address()}>
            <p class="text-xs text-neutral-500 truncate mt-0.5">
              {address()}
            </p>
          </Show>
          <Show when={props.properties.city && !address()}>
            <p class="text-xs text-neutral-500 truncate mt-0.5">
              {props.properties.city}
            </p>
          </Show>
        </div>

        {/* Action */}
        <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="p-2 rounded-md hover:bg-neutral-800 text-neutral-600 hover:text-neutral-400 transition-colors">
            <Navigation class="h-3.5 w-3.5" />
          </div>
        </div>
      </button>
    </Show>
  )
}

function ResultSkeleton() {
  return (
    <div class="flex items-center gap-3 p-3 rounded-lg">
      <div class="flex-shrink-0 p-2.5">
        <div class="h-4 w-4 bg-neutral-800 rounded animate-pulse" />
      </div>
      <div class="flex-1 min-w-0 space-y-2">
        <div class="h-3.5 w-2/3 bg-neutral-800 rounded animate-pulse" />
        <div class="h-3 w-1/2 bg-neutral-800/50 rounded animate-pulse" />
      </div>
    </div>
  )
}
