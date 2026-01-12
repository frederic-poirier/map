import { useParams, useNavigate } from "@solidjs/router";
import { Show, createEffect, onMount } from "solid-js";
import { LayoutHeader } from "~/component/features/layout/Layout";
import PlaceDetail from "~/component/features/place/PlaceDetail";
import SaveLocationButton from "~/component/features/place/SaveLocationButton";
import ItineraryButton from "~/component/features/itinerary/ItineraryButton";
import { usePlace } from "~/context/PlaceContext";
import { parsePlaceId } from "~/utils/placeId";
import { useMap } from "~/context/MapContext";

export default function Place() {
  const params = useParams();
  const navigate = useNavigate();
  const { getPlaceById } = usePlace();

  // Get place from cache or parse from URL
  const place = () => {
    const cached = getPlaceById(params.id);
    if (cached) return cached;

    // Fallback: parse coordinates from ID
    const coords = parsePlaceId(params.id);
    if (coords) {
      return {
        id: params.id,
        name: "Selected Location",
        latitude: coords.lat,
        longitude: coords.lon,
      };
    }
    return null;
  };

  // Map centering moved to PlaceDetail for consistency

  const handleDirections = (place) => {
    // Navigate to itinerary page with destination
    navigate(`/directions?to=${params.id}`);
  };

  return (
    <div class="space-y-4">
      <LayoutHeader title="Place Details" />

      <Show
        when={place()}
        fallback={
          <div class="text-center text-[var(--text-tertiary)] py-4">
            <p>Place not found</p>
          </div>
        }
      >
        <PlaceDetail place={place()} />

        <div class="space-y-2">
          <ItineraryButton place={place()} onClick={handleDirections} />
          <SaveLocationButton place={place()} />
        </div>
      </Show>
    </div>
  );
}
