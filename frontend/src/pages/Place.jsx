import { useParams, useNavigate } from "@solidjs/router";
import { Show, createEffect, onMount } from "solid-js";
import { LayoutHeader } from "~/component/layout/Layout";
import PlaceDetail from "~/component/place/PlaceDetail";
import SaveLocationButton from "~/component/place/SaveLocationButton";
import ItineraryButton from "~/component/itinerary/ItineraryButton";
import { usePlace, parsePlaceId } from "~/context/PlaceContext";
import { useMap } from "~/context/MapContext";

export default function Place() {
  const params = useParams();
  const navigate = useNavigate();
  const { getPlaceById, selectedPlace } = usePlace();
  const { flyTo, addMarker } = useMap();

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
        type: "search",
      };
    }
    return null;
  };

  // Center map on place when loaded
  onMount(() => {
    const p = place();
    if (p) {
      flyTo({ lat: p.latitude, lon: p.longitude });
      addMarker({ lat: p.latitude, lon: p.longitude });
    }
  });

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
