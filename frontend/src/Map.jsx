import { onMount, onCleanup, createSignal, createEffect } from 'solid-js';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { layers, namedFlavor } from '@protomaps/basemaps';
import { MapContext } from './context/MapContext';
import 'maplibre-gl/dist/maplibre-gl.css';
import { theme } from './hooks/useScreen';

export default function Map(props) {
  let container;
  let map;

  const [ready, setReady] = createSignal(false);


  const api = {
    addMarker(lng, lat) {
      if (!map) return;
      new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);
    },

    flyTo(lng, lat, zoom = 14) {
      if (!map) return;
      map.flyTo({ center: [lng, lat], zoom });
    },

    getMap() {
      return map;
    }
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


    const saved = JSON.parse(localStorage.getItem('camera'));
    const position = saved ?? { lng: -73.5673, lat: 45.5017, zoom: 12 };

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

    map.on('load', () => setReady(true));

    map.on('moveend', () => {
      const c = map.getCenter();
      localStorage.setItem(
        'camera',
        JSON.stringify({ lng: c.lng, lat: c.lat, zoom: map.getZoom() })
      );
    });
  });

  createEffect(() => {
    if (!map) return
    map.setStyle(buildStyle(theme()));
  })


  onCleanup(() => {
    if (map) map.remove();
    maplibregl.removeProtocol('pmtiles');
  });


  return (
    <MapContext.Provider value={api}>
      <div ref={container} class="fixed h-svh inset-0" />
      {ready() && props.children}
    </MapContext.Provider>
  );
}
