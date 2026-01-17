import { createContext, createSignal, createResource, useContext } from "solid-js";
import { generatePlaceId, parsePlaceId } from "~/utils/placeId";
import { BACKEND_URL } from "~/config";
import toast from "solid-toast";

const PlaceContext = createContext();

export function PlaceProvider(props) {
  const [placeCache, setPlaceCache] = createSignal({});
  const [savedPlaces, { mutate, refetch }] = createResource(async () => {
    const response = await fetch(`${BACKEND_URL}/api/saved-place`, {
      credentials: "include",
    });
    const data = await response.json();
    const raw = data.locations || [];
    return raw.map((place) => {
      const GeoJSON = JSON.parse(place.OSM_object);
      return {
        ...GeoJSON,
        placeId: generatePlaceId(GeoJSON),
        name: place.name,
        id: place.id
      };
    });
  });
  const getExistingPlaceByName = (name) => {
    return savedPlaces()?.find((p) => p.name === name);
  }

  const getExistingPlaceByGeoJSON = (GeoJSON) => {
    return savedPlaces()?.find((p) =>
      p.geometry?.coordinates?.[0] === GeoJSON.geometry?.coordinates?.[0] &&
      p.geometry?.coordinates?.[1] === GeoJSON.geometry?.coordinates?.[1]
    );
  }

  const savePlace = async (name, osmObject) => {

    try {
      const existingByName = getExistingPlaceByName(name);
      if (existingByName) {
        const address = `${existingByName.properties?.housenumber ?? ''} ${existingByName.properties?.street ?? ''}`.trim();
        throw new Error(`The name "${name}" is already use ${address ? `at ${address}` : ''}`);
      }

      const existingByLocation = getExistingPlaceByGeoJSON(osmObject);
      if (existingByLocation) {
        throw new Error(`This place is already save under the name of "${existingByLocation.name}"`);
      } const response = await fetch(`${BACKEND_URL}/api/saved-place`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, osmObject }),
      });

      if (!response.ok) throw new Error("Failed to save place");
      const savedFromServer = await response.json()
      const formatted = {
        ...JSON.parse(savedFromServer.OSM_object),
        placeId: generatePlaceId(JSON.parse(savedFromServer.OSM_object)),
        name: savedFromServer.name,
        id: savedFromServer.id
      };
      mutate((prev) => [...prev, formatted]);
    } catch (error) {
      toast.error(error.message)
      throw error;
    }
  };

  const unsavePlace = async (id) => {
    const previousState = savedPlaces()
    mutate((prev) => prev.filter((loc) => loc.id !== id));
    try {
      const response = await fetch(`${BACKEND_URL}/api/saved-place/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Delete failed")
      }
    } catch (error) {
      mutate(previousState)
      console.error("Could not unsave place:", error)
    }
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
