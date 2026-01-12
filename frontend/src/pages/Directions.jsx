import { useSearchParams, useNavigate } from "@solidjs/router";
import { Show, createEffect, onMount, For, createSignal } from "solid-js";
import { LayoutHeader } from "~/component/layout/Layout";
import { usePlace } from "~/context/PlaceContext";
import { parsePlaceId } from "~/utils/placeId";
import { useItinerary } from "~/context/ItineraryContext";
import { useMap } from "~/context/MapContext";
import DirectionsForm from "~/component/directions/DirectionsForm";
import ItineraryList from "~/component/directions/ItineraryList";

export default function Directions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getPlaceById } = usePlace();
  const {
    origin, destination, itinerary, isLoading, error,
    setOriginPlace, setDestinationPlace, planTrip, clearItinerary
  } = useItinerary();
  const { flyTo, addMarker } = useMap();

  // Initialize destination from URL param
  onMount(() => {
    const toId = searchParams.to;
    if (toId) {
      const place = getPlaceById(toId);
      if (place) {
        setDestinationPlace(place);
        flyTo({ lat: place.latitude, lon: place.longitude });
        addMarker({ lat: place.latitude, lon: place.longitude });
      } else {
        // Try to parse coordinates from ID
        const coords = parsePlaceId(toId);
        if (coords) {
          setDestinationPlace({
            id: toId,
            name: "Selected Location",
            latitude: coords.lat,
            longitude: coords.lon,
            type: "search",
          });
          flyTo({ lat: coords.lat, lon: coords.lon });
          addMarker({ lat: coords.lat, lon: coords.lon });
        }
      }
    }
  });

  const handleBack = () => {
    clearItinerary();
    navigate(-1);
  };

  return (
    <div class="space-y-4">
      <LayoutHeader title="Directions" onBack={handleBack} />

      <DirectionsForm />

      <Show when={error()}>
        <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {error()}
        </div>
      </Show>

      <Show when={isLoading()}>
        <div class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent-primary)] border-t-transparent"></div>
        </div>
      </Show>

      <Show when={itinerary() && !isLoading()}>
        <ItineraryList itineraries={itinerary()} />
      </Show>

      <Show when={!origin() && !destination()}>
        <div class="text-center text-[var(--text-tertiary)] py-8">
          <p>Enter an origin and destination to get directions</p>
        </div>
      </Show>
    </div>
  );
}
