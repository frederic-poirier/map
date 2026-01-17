import { useSearchParams, useNavigate } from "@solidjs/router";
import { Show, createEffect, onMount, For, createSignal } from "solid-js";
import { LayoutHeader } from "~/component/features/layout/Layout";
import { usePlace } from "~/context/PlaceContext";
import { parsePlaceId } from "~/utils/placeId";
import { useItinerary } from "~/context/ItineraryContext";
import { useMap } from "~/context/MapContext";
import DirectionsForm from "~/component/features/directions/DirectionsForm";
import ItineraryList from "~/component/features/directions/ItineraryList";

export default function Directions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getPlaceFromCache, fetchPlaceById } = usePlace();
  const {
    origin,
    destination,
    itinerary,
    isLoading,
    error,
    setOriginPlace,
    setDestinationPlace,
    planTrip,
    clearItinerary,
  } = useItinerary();
  const { flyTo, addMarker } = useMap();

  // Initialize destination from URL param
  onMount(async () => {
    const toId = searchParams.to;
    if (toId) {
      const place = await getPlaceFromCache(toId);
      if (!place) {
        fetchPlaceById(toId).then((fetchedPlace) => {
          if (fetchedPlace) {
            const coordinates = fetchedPlace.geometry.coordinates;
            setDestinationPlace(fetchedPlace);
            flyTo({ lat: coordinates[1], lon: coordinates[0] });
            addMarker({ lat: coordinates[1], lon: coordinates[0] });
          } else {
            console.error("Failed to load destination place");
          }
        });
        return;
      }
      if (place) {
        const coordinates = place.geometry.coordinates;
        setDestinationPlace(place);
        flyTo({ lat: coordinates[1], lon: coordinates[0] });
        addMarker({ lat: coordinates[1], lon: coordinates[0] });
      } else {
        console.error("Failed to load destination place");
      }
    }
  });

  const handleBack = () => {
    clearItinerary();
    navigate(-1);
  };

  return (
    <div class="space-y-4 h-full">
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
