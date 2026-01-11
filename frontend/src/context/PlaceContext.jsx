import { createContext, useContext, createSignal } from "solid-js";

const PlaceContext = createContext();

// Generate a unique ID from place coordinates
const generatePlaceId = (lat, lon) => {
  // Ensure lat/lon are numbers
  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lonNum = typeof lon === 'string' ? parseFloat(lon) : lon;
  return `${latNum.toFixed(6)}_${lonNum.toFixed(6)}`.replace(/\./g, "-");
};

// Parse place ID back to coordinates
export const parsePlaceId = (id) => {
  if (!id) return null;
  const [lat, lon] = id.split("_").map((s) => parseFloat(s.replace(/-/g, ".")));
  return { lat, lon };
};

export function PlaceProvider(props) {
  const [selectedPlace, setSelectedPlace] = createSignal(null);
  const [placeCache, setPlaceCache] = createSignal({});

  const selectPlace = (place) => {
    if (!place) return;
    
    // Ensure coordinates are numbers
    const latitude = typeof place.latitude === 'string' ? parseFloat(place.latitude) : place.latitude;
    const longitude = typeof place.longitude === 'string' ? parseFloat(place.longitude) : place.longitude;
    
    const id = generatePlaceId(latitude, longitude);
    const placeWithId = { ...place, id, latitude, longitude };
    
    // Cache the place data
    setPlaceCache((prev) => ({ ...prev, [id]: placeWithId }));
    setSelectedPlace(placeWithId);
    
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
