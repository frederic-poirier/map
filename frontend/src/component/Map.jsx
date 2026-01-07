import { Protocol } from "pmtiles";
import { onMount } from "solid-js";
import { layers, namedFlavor } from "@protomaps/basemaps";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import SearchBox from "./SearchBox";

export default function Map() {
  const PMTILES_URL = import.meta.env.VITE_MAP_URL;
  let mapContainer;
  let map;

  onMount(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    const bounds = [
      [-73.938675, 45.319865], // Southwest coordinates
      [-73.412705, 45.746981], // Northeast coordinates
    ];

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
            url: `pmtiles://${PMTILES_URL}`,
            attribution:
              '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
          },
        },
        layers: layers("montreal", namedFlavor("light"), { lang: "en" }),
      },
    });
  });
  const handleSelect = (coords) => {
    if (map && coords) {
      map.flyTo({
        center: [coords.lon, coords.lat],
        zoom: 16,
        essential: true,
        speed: 1.5,
      });

      new maplibregl.Marker().setLngLat([coords.lon, coords.lat]).addTo(map);
    }
  };

  return (
    <>
      <SearchBox onSelect={handleSelect} />
      <div ref={mapContainer} class="w-full aspect-square rounded-2xl" />
    </>
  );
}
