import { onMount, onCleanup, createSignal } from 'solid-js';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { auth } from './hooks/useAuth';
import { layers, namedFlavor } from '@protomaps/basemaps';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function Map() {
  let mapContainer;
  let map;
  const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const [theme, setTheme] = createSignal(colorSchemeQuery ? "dark" : "light")

  onMount(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);

    map = new maplibregl.Map({
      container: mapContainer,
      style: {
        version: 8,
        glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
        sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
        sources: {
          "protomaps": {
            type: "vector",
            url: "pmtiles://tiles/montreal.pmtiles",
            attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
          }
        },
        layers: layers("protomaps", namedFlavor(theme()), { lang: "en" })
      },
      center: [-73.5673, 45.5017],
      maxBounds: [
        [-74.15453186035158, 45.31980593747679],
        [-73.1243133544922, 45.746922837378264]
      ],
      zoom: 12
    });
  });

  onCleanup(() => {
    if (map) {
      map.remove();
      maplibregl.removeProtocol('pmtiles');
    }
  });

  return (
    <Show when={!auth().loading} fallback={<div>Loading Map...</div>}>
      <div ref={mapContainer} class="w-full h-full" />
    </Show>
  );
}
