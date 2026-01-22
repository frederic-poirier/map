import { onMount, onCleanup, createSignal } from 'solid-js';
import maplibregl from 'maplibre-gl';
import { PMTiles, Protocol } from 'pmtiles';
import { layers, namedFlavor } from '@protomaps/basemaps';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function Map() {
  let mapContainer;
  let map;
  const [theme, setTheme] = createSignal('light'); // 'light' ou 'dark'

  onMount(() => {
    // Enregistre le protocole PMTiles
    const protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);

    // Initialise la carte
    map = new maplibregl.Map({
      container: mapContainer,
      style: {
        version: 8,
        glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
        sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/${theme()}`,
        sources: {
          protomaps: {
            type: 'vector',
            url: 'pmtiles:///tiles/montreal.pmtiles',
            attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
          }
        },
        layers: layers('protomaps', namedFlavor(theme()), { lang: 'fr' })
      },
      center: [-73.5673, 45.5017], // Montréal
      zoom: 12
    });

    // Ajoute les contrôles de navigation
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
  });

  onCleanup(() => {
    if (map) {
      map.remove();
      maplibregl.removeProtocol('pmtiles');
    }
  });

  const toggleTheme = () => {
    const newTheme = theme() === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    if (map) {
      map.setStyle({
        version: 8,
        glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
        sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/${newTheme}`,
        sources: {
          protomaps: {
            type: 'vector',
            url: 'pmtiles:///tiles/montreal.pmtiles',
            attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
          }
        },
        layers: layers('protomaps', namedFlavor(newTheme), { lang: 'fr' })
      });
    }
  };

  return (
    <div class="relative w-full h-screen">
      <div ref={mapContainer} class="w-full h-full" />

      {/* Bouton pour changer de thème */}
      <button
        onClick={toggleTheme}
        class="absolute top-4 left-4 z-10 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        {theme() === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </div>
  );
}
