import { createContext, useContext, createSignal } from "solid-js";
import maplibregl from "maplibre-gl";

const MapContext = createContext();

export function MapProvider(props) {
    const [mapInstance, setMapInstance] = createSignal(null);
    const [mapCenter, setMapCenter] = createSignal(null);
    const [currentMarker, setCurrentMarker] = createSignal(null);

    const value = {
        // State
        mapInstance,
        mapCenter,

        // Setters (for Map component)
        setMapInstance,
        setMapCenter,

        // Public API methods
        flyTo: (coords, zoom = 16) => {
            const map = mapInstance();
            if (!map || !coords) return;

            map.flyTo({
                center: [coords.lon, coords.lat],
                zoom,
                essential: true,
                speed: 1.5,
            });
        },

        addMarker: (coords, options = {}) => {
            const map = mapInstance();
            if (!map || !coords) return null;

            // Remove existing marker if requested
            if (options.removeExisting !== false) {
                const existing = currentMarker();
                if (existing) existing.remove();
            }

            const marker = new maplibregl.Marker()
                .setLngLat([coords.lon, coords.lat])
                .addTo(map);

            setCurrentMarker(marker);
            return marker;
        },

        removeMarker: () => {
            const marker = currentMarker();
            if (marker) {
                marker.remove();
                setCurrentMarker(null);
            }
        },

        getCenter: () => {
            const map = mapInstance();
            if (!map) return null;
            const center = map.getCenter();
            return { lon: center.lng, lat: center.lat };
        },

        getZoom: () => {
            const map = mapInstance();
            return map ? map.getZoom() : null;
        },

        setZoom: (zoom) => {
            const map = mapInstance();
            if (map) map.setZoom(zoom);
        },

        fitBounds: (bounds, options = {}) => {
            const map = mapInstance();
            if (map && bounds) {
                map.fitBounds(bounds, options);
            }
        },
    };

    return (
        <MapContext.Provider value={value}>
            {props.children}
        </MapContext.Provider>
    );
}

export function useMap() {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error("useMap must be used within a MapProvider");
    }
    return context;
}
