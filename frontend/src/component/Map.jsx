import { Protocol } from "pmtiles";
import { onCleanup, onMount, Show, createSignal } from "solid-js";
import { layers, namedFlavor } from "@protomaps/basemaps";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import SearchBox from "./SearchBox";

export default function Map() {
  const [mapCenter, setMapCenter] = createSignal(null);
  const [hasError, setHasError] = createSignal(false);
  const [attempts, setAttempts] = createSignal(0);
  const maxAttempts = 3;

  let mapContainer;
  let map;
  let protocol;
  let currentMarker = null;

  const bounds = [
    [-73.938675, 45.319865],
    [-73.412705, 45.746981],
  ];

  const initMap = () => {
    if (!mapContainer) return;

    if (map) {
      map.remove();
      map = null;
    }

    protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    map = new maplibregl.Map({
      container: mapContainer,
      center: [-73.5673, 45.5017],
      zoom: 12,
      maxBounds: bounds,
      style: {
        version: 8,
        glyphs:
          "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
        sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
        sources: {
          montreal: {
            type: "vector",
            url: `pmtiles://https://map-bucket.frederic.dog/montreal.pmtiles`,
            attribution:
              '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
          },
        },
        layers: layers("montreal", namedFlavor("light"), { lang: "fr" }),
      },
    });

    setMapCenter([map.getCenter().lng, map.getCenter().lat]);

    map.on("error", (e) => {
      const message = e?.error?.message ?? "";

      if (message.includes("DataView")) {
        if (attempts() < maxAttempts) {
          setAttempts((a) => a + 1);
          setTimeout(initMap, 300);
        } else {
          setHasError(true);
        }
      }
    });

    map.on("move", () => {
      const center = map.getCenter();
      setMapCenter([center.lng, center.lat]);
    });
  };

  onMount(initMap);

  onCleanup(() => {
    if (map) map.remove();
  });

  const handleSelect = (coords) => {
    if (!map || !coords) return;

    map.flyTo({
      center: [coords.lon, coords.lat],
      zoom: 16,
      essential: true,
      speed: 1.5,
    });

    if (currentMarker) currentMarker.remove();

    currentMarker = new maplibregl.Marker()
      .setLngLat([coords.lon, coords.lat])
      .addTo(map);
  };

  return (
    <div class="flex flex-col relative bg-neutral-800 rounded-2xl items-center justify-center md:aspect-[4/3] aspect-[3/4]">
      <Show
        when={!hasError()}
        fallback={
          <>
            <p>Error loading map</p>
            <button
              class="mt-2 px-2 py-1 rounded-lg border-1 border-neutral-700"
              onClick={() => {
                setAttempts(0);
                initMap();
              }}
            >
              Retry
            </button>
          </>
        }
      >
        <>
          <div class="absolute top-2 left-2 z-10">
            <SearchBox onSelect={handleSelect} map={mapCenter()} />
          </div>
          <div
            ref={(el) => (mapContainer = el)}
            class="w-full h-full rounded-2xl"
          />
        </>
      </Show>
    </div>
  );
}
