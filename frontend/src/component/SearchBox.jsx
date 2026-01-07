import { LngLat } from "maplibre-gl";
import { createSignal, createResource } from "solid-js";
const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://backend.frederic.dog";

export default function SearchBox(props) {
  async function fetchResults(query) {
    if (!query || query.length < 3) return [];
    const response = await fetch(
      `${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}&lon=${props.map[0]}&lat=${props.map[1]}&location_bias_scale=0.5`,
      {
        credentials: "include",
      }
    );
    const data = await response.json();
    console.log("Search results data:", data);
    return data.features || [];
  }
  const [query, setQuery] = createSignal("");
  const [results] = createResource(query, fetchResults);

  const getDistance = (itemCoordinates) => {
    if (!props.map) return null;
    const center = new LngLat(props.map[0], props.map[1]);
    const itemLngLat = new LngLat(itemCoordinates[0], itemCoordinates[1]);
    return (center.distanceTo(itemLngLat) / 1000).toFixed(2);
  };

  const getAngle = (itemCoordinates) => {
    if (!props.map) return null;
    const center = new LngLat(props.map[0], props.map[1]);
    const itemLngLat = new LngLat(itemCoordinates[0], itemCoordinates[1]);

    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const toDegrees = (radians) => radians * (180 / Math.PI);

    const dLon = toRadians(itemLngLat.lng - center.lng);
    const y = Math.sin(dLon) * Math.cos(toRadians(itemLngLat.lat));
    const x =
      Math.cos(toRadians(center.lat)) * Math.sin(toRadians(itemLngLat.lat)) -
      Math.sin(toRadians(center.lat)) *
        Math.cos(toRadians(itemLngLat.lat)) *
        Math.cos(dLon);
    let bearing = toDegrees(Math.atan2(y, x));
    bearing = (bearing + 360) % 360; // Normalize to 0-360
    return bearing.toFixed(0);
  };

  const selectLocation = (feature) => {
    const [lon, lat] = feature.geometry.coordinates;
    props.onSelect({ lat, lon });
    setQuery(feature.properties.name);
  };

  return (
    <div class="relative w-80">
      <input
        type="text"
        placeholder="Search..."
        value={query()}
        onInput={(e) => setQuery(e.target.value)}
        class="border-neutral-100 bg-white drop-shadow-lg border-1 w-full p-2 rounded-xl"
      />
      <Show when={results()?.length > 0}>
        <ul class="bg-white mt-1 border-separate  drop-shadow-2xl  absolute z-10 border w-full border-neutral-300 rounded-xl overflow-y-auto">
          <For each={results()}>
            {(item) => (
              <li>
                <button
                  class="p-2 w-full gap-2 text-left flex items-center hover:bg-neutral-200  rounded-lg"
                  onClick={() => selectLocation(item)}
                >
                  <div class="mr-auto">
                    <span class="text-neutral-500 text-xs">
                      {item.properties.street}
                    </span>
                    <p>{item.properties.name}</p>
                  </div>
                  <span class="tabular-nums text-neutral-500 text-sm">
                    {getDistance(item.geometry.coordinates)}&nbsp;km
                  </span>

                  <span
                    class="text-neutral-500 text-sm mr-2 origin-center aspect-square h-[1ch] w-[1ch] flex items-center justify-center"
                    style={{
                      transform: `rotate(${getAngle(item.geometry.coordinates) - 90}deg)`,
                    }}
                  >
                    →
                  </span>
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
}
