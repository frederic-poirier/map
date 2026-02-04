import { useNavigate, useSearchParams } from '@solidjs/router'
import { encodePlaceId, useSearchPlace } from "../hooks/places";
import { Header } from '../components/Layout.jsx';
import { SearchPlaceInput, SearchPlaceResults } from "../components/SearchPlaces.jsx";

export default function Home() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const search = useSearchPlace({ debounce: 300 });

  if (params.search && !search.query()) {
    search.setQuery(params.search);
  }

  function handleInput(e) {
    const value = e.target.value;
    search.setQuery(value);
    setParams({ search: value || undefined });
  }

  function handleClear() {
    search.clear();
    setParams({ search: undefined });
  }

  function handleSelect(place) {
    navigate(`place/${encodePlaceId(place)}`);
  }

  return (
    <>
      <Header>
        <SearchPlaceInput
          value={search.query()}
          onInput={handleInput}
          onClear={handleClear}
          placeholder="Search for places..."
        />
      </Header>

      <SearchPlaceResults
        search={search}
        onSelect={handleSelect}
      />
    </>
  );
}
