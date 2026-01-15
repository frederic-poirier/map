import { createContext, createSignal, createResource, useContext } from "solid-js";
import { generatePlaceId, parsePlaceId } from "~/utils/placeId";
import { BACKEND_URL } from "~/config";

const PlaceContext = createContext();

export function PlaceProvider(props) {
  const [placeCache, setPlaceCache] = createSignal({});
  const [savedPlaces, { mutate, refetch }] = createResource(async () => {
    const response = await fetch(`${BACKEND_URL}/api/saved-place`, {
      credentials: "include",
    });
    const data = await response.json();
    const raw = data.locations || [];
    return raw.map((loc) => {
      const GeoJSON = JSON.parse(loc.OSM_object);
      const placeId = generatePlaceId(GeoJSON);
      console.log({ placeId, ...GeoJSON, name: loc.name, id: loc.id })
      return { placeId, ...GeoJSON, name: loc.name, id: loc.id };
    });
  });

  const savePlace = async (name, osmObject) => {
    const response = await fetch(`${BACKEND_URL}/api/saved-place`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, osmObject }),
    });

    if (!response.ok) throw new Error("Failed to save place");
    else await refetch();
  };

  const unsavePlace = async (id) => {
    mutate((prev) => prev.filter((loc) => loc.id !== id));
    const response = await fetch(`${BACKEND_URL}/api/saved-place/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  const addPlaceToCache = (GeoJSON) => {
    if (!GeoJSON || getPlaceFromCache(generatePlaceId(GeoJSON))) return;
    const placeId = generatePlaceId(GeoJSON);
    setPlaceCache((prev) => ({ ...prev, [placeId]: GeoJSON }));
  }

  const getPlaceFromCache = (id) => {
    return placeCache()[id] || null;
  }

  const fetchPlaceById = async (id) => {
    const cached = getPlaceFromCache(id);
    if (cached) {
      return Promise.resolve(cached);
    }

    const place = parsePlaceId(id)
    if (!place) return Promise.resolve('Error parsing ID')
    try {
      const response = await fetch(`${BACKEND_URL}/api/place?lat=${place.lat}&lon=${place.lon}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch place");
      const data = await response.json();
      setPlaceCache((prev) => ({ ...prev, [id]: data }));
      return data;
    } catch (error) {
      console.error("Error fetching place by ID:", error);
      return null;
    }
  }

  const isSavedPlace = (id) => {
    return savedPlaces()?.some((loc) => loc.placeId === id);
  }

  const getSavedPlaceById = (id) => {
    return savedPlaces()?.find((loc) => loc.placeId === id) || null;
  }

  return (
    <PlaceContext.Provider
      value={{
        // Saved places
        savedPlaces,
        savePlace,
        unsavePlace,
        isSavedPlace,
        getSavedPlaceById,
        // Regular places cache
        placeCache,
        addPlaceToCache,
        getPlaceFromCache,
        fetchPlaceById
      }}
    >
      {props.children}
    </PlaceContext.Provider>
  );
}

export const usePlace = () => {
  const context = useContext(PlaceContext);
  if (!context) {
    throw new Error("usePlace must be used within a PlaceProvider");
  }
  return context;
}