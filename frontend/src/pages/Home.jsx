import { Sheet } from "../components/Sheet"
import usePhoton from "../hooks/usePhoton";
import X from 'lucide-solid/icons/x'
import Search from 'lucide-solid/icons/search'
import { Show } from "solid-js";

export default function Home() {
  const { setQuery, results } = usePhoton();
  let sheetAPI

  let timeoutID
  const handleInput = (e) => {
    const query = e.target.value;
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      setQuery(query);
    }, 300);
  }
  return (
    <main>
      <Sheet
        ref={sheetAPI}
        maxHeight="80vh"
        minHeight="header"
        snapPoints={['50%']}
        initialSnapIndex={1}
        class="bg-white px-4 rounded-t-xl shadow-lg text-black"
      >
        <Sheet.Header>
          <div className="space-y-2 border-b border-neutral-200 pb-2 mb-2">
            <div className="flex justify-between items-center">
              <h1>Explore</h1>
              <button onClick={() => sheetAPI.goToSnap(0)}><X /></button>
            </div>
            <label className="flex items-center border-1 border-neutral-200 rounded-lg">
              <Search class="ml-2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full p-1 text-lg focus:outline-0"
                onFocus={() => sheetAPI.goToSnap(2)}
                onInput={handleInput}
              />
            </label>
          </div>
        </Sheet.Header>
        <Sheet.Content>
          <Show when={results()} fallback={"Bienvenue! Faites une recherche pour commencer."}>
            <ul className="space-y-2">
              <For each={results().features}>
                {(place) => (
                  <li key={place.properties.osm_id} className="border-b border-neutral-200 pb-2">
                    {console.log(place)}
                    <h2 className="font-bold">{place.properties.name || 'Unnamed Place'}</h2>
                    <p className="text-sm text-neutral-600">{place.properties.street || 'No address available'}</p>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </Sheet.Content>
      </Sheet>

    </main>
  )
}