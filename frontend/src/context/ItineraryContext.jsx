import { createContext, useContext, createSignal } from "solid-js";

const ItineraryContext = createContext();

// Backend URL based on environment
const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : "https://backend.frederic.dog";

export function ItineraryProvider(props) {
  const [origin, setOrigin] = createSignal(null);
  const [destination, setDestination] = createSignal(null);
  const [itinerary, setItinerary] = createSignal(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal(null);

  const setOriginPlace = (place) => {
    setOrigin(place);
    setItinerary(null);
    setError(null);
  };

  const setDestinationPlace = (place) => {
    setDestination(place);
    setItinerary(null);
    setError(null);
  };

  const swapOriginDestination = () => {
    const currentOrigin = origin();
    const currentDestination = destination();
    setOrigin(currentDestination);
    setDestination(currentOrigin);
    setItinerary(null);
  };

  const clearItinerary = () => {
    setOrigin(null);
    setDestination(null);
    setItinerary(null);
    setError(null);
  };

  const planTrip = async (options = {}) => {
    const from = origin();
    const to = destination();

    if (!from || !to) {
      setError("Please select both origin and destination");
      return;
    }

    setIsLoading(true);
    setError(null);
    setItinerary(null);

    try {
      // Ensure coordinates are numbers
      const fromLat = typeof from.latitude === 'string' ? parseFloat(from.latitude) : from.latitude;
      const fromLon = typeof from.longitude === 'string' ? parseFloat(from.longitude) : from.longitude;
      const toLat = typeof to.latitude === 'string' ? parseFloat(to.latitude) : to.latitude;
      const toLon = typeof to.longitude === 'string' ? parseFloat(to.longitude) : to.longitude;

      const response = await fetch(`${BACKEND_URL}/api/otp/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          from: { lat: fromLat, lon: fromLon },
          to: { lat: toLat, lon: toLon },
          time: options.time,
          date: options.date,
          numItineraries: options.numItineraries || 5,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to plan trip");
      }

      const data = await response.json();

      if (!data.itineraries || data.itineraries.length === 0) {
        setError("No routes found. Try adjusting your origin or destination.");
        return;
      }

      setItinerary(data.itineraries);
    } catch (err) {
      console.error("Trip planning error:", err);
      setError(err.message || "Failed to plan trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    // State
    origin,
    destination,
    itinerary,
    isLoading,
    error,
    
    // Actions
    setOriginPlace,
    setDestinationPlace,
    swapOriginDestination,
    clearItinerary,
    planTrip,
    setItinerary,
    setIsLoading,
    setError,
  };

  return (
    <ItineraryContext.Provider value={value}>
      {props.children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error("useItinerary must be used within an ItineraryProvider");
  }
  return context;
}
