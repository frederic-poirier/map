import { onMount, onCleanup, createSignal, Show } from 'solid-js';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { auth } from './hooks/useAuth';
import { layers, namedFlavor } from '@protomaps/basemaps';
import 'maplibre-gl/dist/maplibre-gl.css';
import { toast } from 'solid-sonner';

export const [busStops, setBusStops] = createSignal([]);

export default function Map() {
  let mapContainer;
  let map;
  let refreshTimer;

  const handleColorSchemeChange = (event) => setTheme(event.matches ? 'dark' : 'light')
  const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const [theme, setTheme] = createSignal(colorSchemeQuery.matches ? "dark" : "light");

  const [isMapReady, setIsMapReady] = createSignal(false);

  async function fetchSignedUrl() {
    try {
      const response = await fetch('/tiles/montreal.pmtiles');
      if (!response.ok) throw new Error("Impossible de récupérer l'URL signée");
      return await response.json();
    } catch (e) {
      toast.error(`Erreur auth carte: ${e.message}`);
      return null;
    }
  }

  async function getUserPosition() {

    const success = (position) => {
      const lng = position.coords.longitude
      const lat = position.coords.latitude
      addMarker(lng, lat)
      flyTo(lng, lat)
    }

    const error = () => toast.error('Unable to retrieve your location')

    if ("geolocation" in navigator) navigator.geolocation.getCurrentPosition(success, error)
    else toast.error('Geolocation is not supported by your browser.')

  }

  const addMarker = (lng, lat) => {
    const marker = new maplibregl.Marker()
      .setLngLat([lng, lat])
      .addTo(map);
  }

  const flyTo = (lng, lat) => {
    map.flyTo({ center: [lng, lat], minZoom: 2 })
  }



  function scheduleTokenRefresh(expiresAt) {
    const now = Date.now();
    const delay = Math.max(0, (expiresAt - now) - 300000);

    refreshTimer = setTimeout(async () => {
      const data = await fetchSignedUrl();
      if (data && map && map.getSource('protomaps')) {
        map.getSource('protomaps').setUrl("pmtiles://" + data.url);
        scheduleTokenRefresh(data.expiresAt);
      }
    }, delay);
  }

  onMount(async () => {
    const protocol = new Protocol();
    const lastCameraPostion = JSON.parse(localStorage.getItem('lastCameraPosition'))
    const position = lastCameraPostion || { zoom: 12, lng: -73.5673, lat: 45.5017 }
    maplibregl.addProtocol('pmtiles', protocol.tile);


    const data = await fetchSignedUrl();
    if (!data) return;

    map = new maplibregl.Map({
      container: mapContainer,
      style: {
        version: 8,
        glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
        sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
        sources: {
          "protomaps": {
            type: "vector",
            url: "pmtiles://" + data.url,
            attribution: '<a href="https://protomaps.com">Protomaps</a> © OpenStreetMap'
          }
        },
        layers: layers("protomaps", namedFlavor(theme()), { lang: "en" })
      },
      center: [position.lng, position.lat],
      maxBounds: [
        [-74.15453186035158, 45.31980593747679],
        [-73.1243133544922, 45.746922837378264]
      ],
      zoom: position.zoom
    });

    scheduleTokenRefresh(data.expiresAt);
    map.on('load', () => {
      setIsMapReady(true);
      getUserPosition()
    });

    map.on('moveend', () => {
      const position = JSON.stringify({ zoom: map.getZoom(), lat: map.getCenter().lat, lng: map.getCenter().lng })
      localStorage.setItem('lastCameraPosition', position)
    })
  });

  onCleanup(() => {
    colorSchemeQuery.removeEventListener('change', handleColorSchemeChange)
    if (refreshTimer) clearTimeout(refreshTimer);
    if (map) map.remove();
  });

  return (
    <Show when={!auth().loading} fallback={<div>Authenticating...</div>}>
      <div ref={mapContainer} class="w-full h-svh fixed inset-0" />
      <Show when={!isMapReady()}>
        <div class="fixed bg-neutral-400 inset-0 z-10 flex items-center justify-center">
          <div className='text-neutral-600 animate-pulse'>Loading map...</div>
        </div>
      </Show>
    </Show>
  );
}
