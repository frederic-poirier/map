import { Protocol } from "pmtiles";
import { onCleanup, onMount, Show, createSignal, createEffect } from "solid-js";
import { layers, namedFlavor } from "@protomaps/basemaps";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMap } from "../context/MapContext";
import { useTheme } from "../context/ThemeContext";
import { Plus, Minus, Compass, Maximize2, Loader2, AlertTriangle, RefreshCw } from "lucide-solid";

export default function Map() {
  const { setMapInstance, setMapCenter, mapInstance } = useMap();
  const { theme } = useTheme();
  const [hasError, setHasError] = createSignal(false);
  const [attempts, setAttempts] = createSignal(0);
  const [isLoading, setIsLoading] = createSignal(true);
  const maxAttempts = 3;

  let mapContainer;
  let map;
  let protocol;

  const bounds = [
    [-73.938675, 45.319865],
    [-73.412705, 45.746981],
  ];

  const getMapStyle = (flavor) => ({
    version: 8,
    glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/${flavor}`,
    sources: {
      montreal: {
        type: "vector",
        url: `pmtiles://https:map-bucket.frederic.dog/montreal.pmtiles`,
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      },
    },
    layers: layers("montreal", namedFlavor(flavor), { lang: "fr" }),
  });

  const initMap = () => {
    if (!mapContainer) return;

    setIsLoading(true);
    setHasError(false);

    if (map) {
      map.remove();
      map = null;
    }

    protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    const currentTheme = theme();
    const flavor = currentTheme === 'dark' ? 'dark' : 'light';

    map = new maplibregl.Map({
      container: mapContainer,
      center: [-73.5673, 45.5017],
      zoom: 12,
      maxBounds: bounds,
      style: getMapStyle(flavor),
      attributionControl: false,
    });

    // Add attribution control in bottom-right
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    setMapInstance(map);
    setMapCenter([map.getCenter().lng, map.getCenter().lat]);

    map.on("load", () => {
      setIsLoading(false);
    });

    map.on("error", (e) => {
      const message = e?.error?.message ?? "";

      if (message.includes("DataView")) {
        if (attempts() < maxAttempts) {
          setAttempts((a) => a + 1);
          setTimeout(initMap, 300);
        } else {
          setHasError(true);
          setIsLoading(false);
        }
      }
    });

    map.on("move", () => {
      const center = map.getCenter();
      setMapCenter([center.lng, center.lat]);
    });
  };

  // Update map style when theme changes
  createEffect(() => {
    const currentTheme = theme();
    const currentMap = mapInstance();
    
    if (currentMap && currentMap.isStyleLoaded()) {
      const flavor = currentTheme === 'dark' ? 'dark' : 'light';
      currentMap.setStyle(getMapStyle(flavor));
    }
  });

  onMount(initMap);

  onCleanup(() => {
    if (map) {
      map.remove();
      setMapInstance(null);
    }
  });

  return (
    <div class="relative h-[100svh] w-[100svw]">
      {/* Loading overlay */}
      <Show when={isLoading() && !hasError()}>
        <div class="absolute inset-0 z-20 bg-[var(--bg-secondary)] flex flex-col items-center justify-center">
          <Loader2 size={40} class="animate-spin text-[var(--text-tertiary)] mb-4" />
          <p class="text-sm text-[var(--text-secondary)]">Loading map...</p>
        </div>
      </Show>

      {/* Error state */}
      <Show when={hasError()}>
        <div class="absolute inset-0 z-20 bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-4">
          <div class="text-center max-w-sm">
            <div class="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} class="text-red-500" />
            </div>
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Unable to load map
            </h2>
            <p class="text-sm text-[var(--text-secondary)] mb-6">
              There was a problem loading the map tiles. Please check your connection and try again.
            </p>
            <button
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-xl transition-colors"
              onClick={() => {
                setAttempts(0);
                initMap();
              }}
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        </div>
      </Show>

      {/* Map container */}
      <div
        ref={(el) => (mapContainer = el)}
        class="w-full h-full"
      />

      {/* Map controls */}
      <Show when={!hasError() && !isLoading()}>
        <MapControls />
      </Show>
    </div>
  );
}

function MapControls() {
  const { mapInstance, getZoom } = useMap();
  const [isFullscreen, setIsFullscreen] = createSignal(false);

  const zoomIn = () => {
    const map = mapInstance();
    if (map) map.zoomIn();
  };

  const zoomOut = () => {
    const map = mapInstance();
    if (map) map.zoomOut();
  };

  const resetBearing = () => {
    const map = mapInstance();
    if (map) {
      map.easeTo({ bearing: 0, pitch: 0 });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  onMount(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    onCleanup(() => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    });
  });

  return (
    <div class="absolute right-3 top-3 flex flex-col gap-2 z-[5] controls-enter">
      {/* Zoom controls */}
      <div class="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={zoomIn}
          class="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
          title="Zoom in (+)"
        >
          <Plus size={18} strokeWidth={1.5} />
        </button>
        <div class="h-px bg-[var(--border-primary)]" />
        <button
          onClick={zoomOut}
          class="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
          title="Zoom out (-)"
        >
          <Minus size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Compass / Reset bearing */}
      <button
        onClick={resetBearing}
        class="w-10 h-10 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
        title="Reset north (N)"
      >
        <Compass size={18} strokeWidth={1.5} />
      </button>

      {/* Fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        class="w-10 h-10 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
        title={isFullscreen() ? "Exit fullscreen" : "Fullscreen (F)"}
      >
        <Maximize2 size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}
