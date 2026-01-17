import { createContext, useContext, createSignal } from "solid-js";
import { BACKEND_URL } from "~/config";

const ItineraryContext = createContext();

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
    const from = origin().geometry.coordinates;
    const to = destination().geometry.coordinates;

    if (!from || !to) {
      setError("Please select both origin and destination");
      return;
    }

    setIsLoading(true);
    setError(null);
    setItinerary(null);

    try {
      const fromLat =
        typeof from[1] === "string" ? parseFloat(from[1]) : from[1];
      const fromLon =
        typeof from[0] === "string" ? parseFloat(from[0]) : from[0];
      const toLat = typeof to[1] === "string" ? parseFloat(to[1]) : to[1];
      const toLon = typeof to[0] === "string" ? parseFloat(to[0]) : to[0];

      console.log(fromLat, fromLon, toLat, toLon);

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
