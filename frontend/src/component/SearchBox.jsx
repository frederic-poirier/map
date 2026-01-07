import { createSignal, createResource } from "solid-js";
const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://backend.frederic.dog";

async function fetchResults(query) {
  if (!query || query.length < 3) return [];
  const response = await fetch(
    `${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}`,
    {
      credentials: "include",
    }
  );
  const data = await response.json();
  console.log("Search results data:", data);
  return data.features || [];
}

export default function SearchBox(props) {
  const [query, setQuery] = createSignal("");
  const [results] = createResource(query, fetchResults);

  const selectLocation = (feature) => {
    const [lon, lat] = feature.geometry.coordinates;
    props.onSelect({ lat, lon });
    setQuery(feature.properties.name);
  };

  //   let timeoutID;
  //   const changeInput = (e) => {
  //     if (timeoutID) clearTimeout(timeoutID);
  //     timeoutID = setTimeout(() => {
  //       setQuery(e.target.value);
  //     }, 300);
  //   };

  return (
    <div class="relative w-80 mt-4">
      <input
        type="text"
        placeholder="Search..."
        value={query()}
        onInput={(e) => setQuery(e.target.value)}
        class="border-neutral-700 border-1 w-full p-2 rounded-xl mb-2"
      />
      <ul class="bg-white dark:bg-neutral-800 absolute z-10 border w-full border-neutral-300 dark:border-neutral-700 rounded-xl max-h-48 overflow-y-auto">
        <Show when={!results.loading} fallback={<li>Loading...</li>}>
          <For each={results()}>
            {(item) => (
              <li>
                <button class="p-2 w-full text-left" onClick={() => selectLocation(item)}>
                  {item.properties.name}
                </button>
              </li>
            )}
          </For>
        </Show>
      </ul>
    </div>
  );
}
