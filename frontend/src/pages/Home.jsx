import usePhoton from "../hooks/usePhoton";
import { createResource, createSignal, createEffect, For, Show } from "solid-js";
import { useNavigate, useSearchParams } from '@solidjs/router'
import { usePlaces } from "../hooks/usePlaces";
import { State, Header } from '../components/Layout.jsx'
import { useMap } from "../context/MapContext.jsx";
import { SearchPlaceInput, SearchPlaceResults } from "../components/SearchPlaces.jsx";

export default function Home() {
  const map = useMap()
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate()
  const { searchResults } = usePhoton();
  const { encodePlaceId } = usePlaces()

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
        <SearchPlaceInput
          draft={draft}
          onInput={handleInput}
          onClear={clearSearch}
        />
      </Header>

      <Show when={hasQuery()} fallback={<State title="Find your way" text="Search for restaurants, shops, landmarks, or any destination" />}>
        <SearchPlaceResults
          results={results}
          loading={isPending}
          onSelect={(place) => navigate(`place/${encodePlaceId(place)}`)}
        />
      </Show>
    </>
  )
}

