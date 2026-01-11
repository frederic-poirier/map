import { createContext, useContext, createSignal } from "solid-js";
import maplibregl from "maplibre-gl";

const MapContext = createContext();

// Decode Google Polyline Algorithm Format
// OTP returns legGeometry.points in this format
function decodePolyline(encoded) {
    const points = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
        let b;
        let shift = 0;
        let result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlat = result & 1 ? ~(result >> 1) : result >> 1;
        lat += dlat;

        shift = 0;
        result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlng = result & 1 ? ~(result >> 1) : result >> 1;
        lng += dlng;

        points.push([lng / 1e5, lat / 1e5]);
    }

    return points;
}

export function MapProvider(props) {
    const [mapInstance, setMapInstance] = createSignal(null);
    const [mapCenter, setMapCenter] = createSignal(null);
    const [currentMarker, setCurrentMarker] = createSignal(null);
    const [routeMarkers, setRouteMarkers] = createSignal([]);
    const [routeLayers, setRouteLayers] = createSignal([]);

    // Clear all route-related layers and markers
    const clearRoute = () => {
        const map = mapInstance();
        if (!map) return;

        // Remove route layers
        const layers = routeLayers();
        layers.forEach((layerId) => {
            if (map.getLayer(layerId)) {
                map.removeLayer(layerId);
            }
        });

        // Remove route sources
        layers.forEach((layerId) => {
            const sourceId = layerId.replace("-layer", "-source");
            if (map.getSource(sourceId)) {
                map.removeSource(sourceId);
            }
        });

        // Remove route markers
        const markers = routeMarkers();
        markers.forEach((marker) => marker.remove());

        setRouteLayers([]);
        setRouteMarkers([]);
    };

    // Display an itinerary route on the map
    const displayRoute = (itinerary) => {
        const map = mapInstance();
        if (!map || !itinerary) return;

        // Clear existing route
        clearRoute();

        const newLayers = [];
        const newMarkers = [];
        const allCoords = [];

        // Add each leg as a separate layer
        itinerary.legs.forEach((leg, index) => {
            if (!leg.legGeometry?.points) return;

            const coords = decodePolyline(leg.legGeometry.points);
            allCoords.push(...coords);

            const sourceId = `route-${index}-source`;
            const layerId = `route-${index}-layer`;

            // Determine color based on mode
            let color = "#6B7280"; // gray for walk
            let width = 4;
            let dashArray = null;

            if (leg.mode === "WALK") {
                color = "#9CA3AF";
                width = 3;
                dashArray = [2, 2];
            } else if (leg.route?.color) {
                color = `#${leg.route.color}`;
                width = 5;
            } else {
                // Default transit colors by mode
                switch (leg.mode) {
                    case "BUS":
                        color = "#3B82F6";
                        break;
                    case "SUBWAY":
                        color = "#F97316";
                        break;
                    case "RAIL":
                    case "TRAM":
                        color = "#22C55E";
                        break;
                    default:
                        color = "#3B82F6";
                }
                width = 5;
            }

            // Add source
            map.addSource(sourceId, {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: coords,
                    },
                },
            });

            // Add layer
            const layerConfig = {
                id: layerId,
                type: "line",
                source: sourceId,
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": color,
                    "line-width": width,
                    "line-opacity": 0.85,
                },
            };

            if (dashArray) {
                layerConfig.paint["line-dasharray"] = dashArray;
            }

            map.addLayer(layerConfig);
            newLayers.push(layerId);
        });

        // Add origin marker (green)
        if (itinerary.legs.length > 0) {
            const firstLeg = itinerary.legs[0];
            const originEl = document.createElement("div");
            originEl.className = "route-marker origin-marker";
            originEl.innerHTML = `
                <div style="
                    width: 24px;
                    height: 24px;
                    background: #22C55E;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                "></div>
            `;
            const originMarker = new maplibregl.Marker({ element: originEl })
                .setLngLat([firstLeg.from.lon, firstLeg.from.lat])
                .addTo(map);
            newMarkers.push(originMarker);
        }

        // Add destination marker (red)
        if (itinerary.legs.length > 0) {
            const lastLeg = itinerary.legs[itinerary.legs.length - 1];
            const destEl = document.createElement("div");
            destEl.className = "route-marker dest-marker";
            destEl.innerHTML = `
                <div style="
                    width: 24px;
                    height: 24px;
                    background: #EF4444;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                "></div>
            `;
            const destMarker = new maplibregl.Marker({ element: destEl })
                .setLngLat([lastLeg.to.lon, lastLeg.to.lat])
                .addTo(map);
            newMarkers.push(destMarker);
        }

        setRouteLayers(newLayers);
        setRouteMarkers(newMarkers);

        // Fit map to route bounds
        if (allCoords.length > 0) {
            const bounds = allCoords.reduce(
                (bounds, coord) => bounds.extend(coord),
                new maplibregl.LngLatBounds(allCoords[0], allCoords[0])
            );
            map.fitBounds(bounds, {
                padding: { top: 100, bottom: 300, left: 50, right: 50 },
                maxZoom: 16,
            });
        }
    };

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

        // Route display methods
        displayRoute,
        clearRoute,
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
