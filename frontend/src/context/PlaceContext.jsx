import { createContext, useContext, createSignal } from "solid-js";
import { generatePlaceId } from "~/utils/placeId";

const PlaceContext = createContext();

// ID generation and parsing now provided by shared util

export function PlaceProvider(props) {
  const [selectedPlace, setSelectedPlace] = createSignal(null);
  const [placeCache, setPlaceCache] = createSignal({});

  const selectPlace = (item) => {
    if (!item) return;

    // Normalize: handle both saved locations and search results (GeoJSON features)
    const isFeature = !!item.geometry;

    const latitude = isFeature
      ? item.geometry.coordinates[1]
      : (typeof item.latitude === 'string' ? parseFloat(item.latitude) : item.latitude);
    const longitude = isFeature
      ? item.geometry.coordinates[0]
      : (typeof item.longitude === 'string' ? parseFloat(item.longitude) : item.longitude);

    const id = generatePlaceId(latitude, longitude);

    // Store raw item with normalized coords and id
    const place = { ...item, id, latitude, longitude };

    // Cache the place data
    setPlaceCache((prev) => ({ ...prev, [id]: place }));
    setSelectedPlace(place);

    return id;
  };

  const getPlaceById = (id) => {
    return placeCache()[id] || null;
  };

  const clearPlace = () => {
    setSelectedPlace(null);
  };

  return (
    <PlaceContext.Provider
      value={{
        selectedPlace,
        selectPlace,
        clearPlace,
        getPlaceById,
        generatePlaceId,
      }}
    >
      {props.children}
    </PlaceContext.Provider>
  );
}

export function usePlace() {
  const context = useContext(PlaceContext);
  if (!context) {
    throw new Error("usePlace must be used within a PlaceProvider");
  }
  return context;
}
