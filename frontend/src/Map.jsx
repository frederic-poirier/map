import { onMount, onCleanup, createSignal, Show } from 'solid-js';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { auth } from './hooks/useAuth';
import { layers, namedFlavor } from '@protomaps/basemaps';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSheet } from './components/BottomSheet';

export const [busStops, setBusStops] = createSignal([]);

export default function Map() {
  let mapContainer;
  let map; // Instance de la carte
  let refreshTimer; // Pour nettoyer le timer si on quitte la page
  const sheet = useSheet()

  const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const [theme, setTheme] = createSignal(colorSchemeQuery.matches ? "dark" : "light");

  // État pour savoir si on est prêt à afficher la carte
  const [isMapReady, setIsMapReady] = createSignal(false);

  // --- 1. Logique de Récupération du Token (URL Signée) ---
  async function fetchSignedUrl() {
    try {
      // On appelle votre Worker (qui renvoie maintenant le JSON)
      const response = await fetch('/tiles/montreal.pmtiles', {
        headers: {
          // Si votre Worker vérifie l'auth, ajoutez le token ici
          // 'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) throw new Error("Impossible de récupérer l'URL signée");

      // On récupère { url: "https://r2...", expiresAt: 123456789 }
      return await response.json();

    } catch (e) {
      console.error("Erreur auth carte:", e);
      return null;
    }
  }

  // --- 2. Logique de Rafraîchissement Silencieux ---
  function scheduleTokenRefresh(expiresAt) {
    const now = Date.now();
    // On rafraîchit 5 minutes (300 000 ms) AVANT l'expiration
    const delay = Math.max(0, (expiresAt - now) - 300000);

    console.log(`Prochain refresh du token carte dans ${(delay / 60000).toFixed(1)} minutes`);

    refreshTimer = setTimeout(async () => {
      const data = await fetchSignedUrl();
      if (data && map && map.getSource('protomaps')) {
        console.log("Mise à jour silencieuse de la source carto...");
        // C'est la magie : on change l'URL sans recharger la carte visuellement
        map.getSource('protomaps').setUrl("pmtiles://" + data.url);
        // On relance la boucle pour la prochaine fois
        scheduleTokenRefresh(data.expiresAt);
      }
    }, delay);
  }

  // --- 3. Logique existante (Bus Stops) ---
  function logBusStops() {
    if (!map) return; // Sécurité
    const features = map.queryRenderedFeatures({
      layers: ['pois'],
      filter: ['match', ['get', 'kind'], 'bus_stop', true, false]
    });

    const newStops = [];
    const seenIds = new Set();

    for (const f of features) {
      const id = f.properties.osm_id || f.id;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        newStops.push({
          id: id,
          name: f.properties.name,
          coordinates: f.geometry.coordinates,
          properties: f.properties
        });
      }
    }
    setBusStops(newStops);
  }



  // --- 4. Montage du composant ---
  onMount(async () => {
    // A. Initialisation du protocole PMTiles
    const protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);

    // B. Récupération initiale de l'URL
    const data = await fetchSignedUrl();

    if (!data) return; // Gérer l'erreur d'affichage si besoin

    // C. Création de la carte
    map = new maplibregl.Map({
      container: mapContainer,
      style: {
        version: 8,
        glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
        sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
        sources: {
          "protomaps": {
            type: "vector",
            // IMPORTANT : On combine le protocole pmtiles:// avec l'URL signée https://
            url: "pmtiles://" + data.url,
            attribution: '<a href="https://protomaps.com">Protomaps</a> © OpenStreetMap'
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

    map.on("moveend", logBusStops);

    let moveStartTime = 0;

    map.on('movestart', () => {
      moveStartTime = Date.now();
    });

    map.on('move', () => {
      if (moveStartTime && (Date.now() - moveStartTime) > 500) {
        if (sheet.atTop()) {
          sheet.snapTo(1);
          moveStartTime = 0; // On reset pour ne pas snap en boucle
        }
      }
    });

    map.on('idle', () => {
      moveStartTime = 0;
    });

    // D. On lance le timer de rafraîchissement
    scheduleTokenRefresh(data.expiresAt);
    map.on('load', () => {
      setIsMapReady(true);
    });
  });

  onCleanup(() => {
    if (refreshTimer) clearTimeout(refreshTimer); // Stop le timer
    if (map) map.remove();
  });

  return (
    <Show when={!auth().loading} fallback={<div>Authenticating...</div>}>
      <div ref={mapContainer} class="w-full h-svh fixed inset-0" />
      <Show when={!isMapReady()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="text-xl font-bold animate-pulse">Chargement de la carte...</div>
        </div>
      </Show>
    </Show>
  );
}
