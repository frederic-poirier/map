import { createContext, createResource, useContext } from "solid-js";
import { generatePlaceId } from "~/utils/placeId";
const LocationContext = createContext();

// Backend URL based on environment
const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : "https://backend.frederic.dog";

export default function LocationProvider(props) {
  const [locations, { mutate, refetch }] = createResource(async () => {
    const response = await fetch(`${BACKEND_URL}/api/locations`, {
      credentials: "include",
    });
    const data = await response.json();
    const raw = data.locations || [];
    // Normalize coordinates and attach a consistent placeId for navigation/cache
    return raw.map((loc) => {
      const latitude =
        typeof loc.latitude === "string" ? parseFloat(loc.latitude) : loc.latitude;
      const longitude =
        typeof loc.longitude === "string" ? parseFloat(loc.longitude) : loc.longitude;
      const placeId = generatePlaceId(latitude, longitude);
      return { ...loc, latitude, longitude, placeId };
    });
  });

  const saveLocation = async (latitude, longitude, name) => {
    const response = await fetch(`${BACKEND_URL}/api/location`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ latitude, longitude, name }),
    });

    if (!response.ok) throw new Error("Failed to save location");
    else await refetch();
  };

  const deleteLocation = async (id, e) => {
    mutate((prev) => prev.filter((loc) => loc.id !== id));
    const response = await fetch(`${BACKEND_URL}/api/location/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  return (
    <LocationContext.Provider
      value={{ locations, saveLocation, deleteLocation }}
    >
      {props.children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
