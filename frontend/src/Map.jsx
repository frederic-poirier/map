import { onMount, onCleanup, createSignal, createEffect, Show } from 'solid-js';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { layers, namedFlavor } from '@protomaps/basemaps';
import { MapContext } from './context/MapContext';
import { setMapLoading } from './context/LoadingContext';
import 'maplibre-gl/dist/maplibre-gl.css';
import { theme } from './hooks/useScreen';
import { toast } from 'solid-sonner';

export default function Map(props) {
  let container;
  let map;

  const [ready, setReady] = createSignal(false);
  const [userPosition, setUserPosition] = createSignal(getCurrentUserPosition())

  function getCurrentUserPosition() {

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) =>
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        ), () => toast.error("Couldn't find your position"),
        { enableHighAccuracy: true })
    } else {
      toast.error("Geolocation is not avaialable in your browser")
    }
  }

  const api = {
    userPosition,
    getCamera() {
      if (!map) return null;
      const c = map.getCenter();
      return {
        lat: c.lat,
        lon: c.lng,
        zoom: Math.trunc(map.getZoom()),
      }
    },

    addMarker(lng, lat) {
      if (!map) return;
      new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);
    },

    flyTo(lng, lat, offset = 0, zoom = 14) {
      if (!map) return;
      map.flyTo({ center: [lng, lat], offset: [0, offset], zoom });
    },

    getMap() {
      return map;
    },
  };

  function buildStyle(theme) {
    return {
      version: 8,
      glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
      sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/${theme}`,
      sources: {
        protomaps: {
          type: 'vector',
          url: 'pmtiles://https://tiles.frederic.dog/montreal.pmtiles'
        }
      },
      layers: layers('protomaps', namedFlavor(theme), { lang: 'en' })
    };
  }

  onMount(() => {
    let protocol = new Protocol()
    maplibregl.addProtocol("pmtiles", protocol.tile)

    const position = { lng: -73.5673, lat: 45.5017, zoom: 12 };

    map = new maplibregl.Map({
      container,
      center: [position.lng, position.lat],
      zoom: position.zoom,
      maxBounds: [
        [-74.1545, 45.3198],
        [-73.1243, 45.7469]
      ],
      style: buildStyle(theme())
    });


    map.on('load', () => {
      setReady(true)
      setMapLoading(false)
    });
  });

  createEffect(() => {
    if (!map) return
    if (ready()) map.setStyle(buildStyle(theme()));
  })


  onCleanup(() => {
    if (map) map.remove();
    maplibregl.removeProtocol('pmtiles');
  });


  return (
    <MapContext.Provider value={api}>
      <div ref={container} class="fixed bg-neutral-900 h-svh inset-0" />
      <Show when={ready()}>
        {props.children}
      </Show>
    </MapContext.Provider>
  );
}
