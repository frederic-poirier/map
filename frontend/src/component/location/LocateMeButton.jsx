import { createSignal, Show } from "solid-js";
import { useMap } from "~/context/MapContext";
import { usePlace } from "~/context/PlaceContext";
import Crosshair from "lucide-solid/icons/crosshair";
import Loader2 from "lucide-solid/icons/loader-2";

export default function LocateMeButton() {
  const { flyTo, addMarker } = useMap();
  const { selectPlace } = usePlace();
  const [isLocating, setIsLocating] = createSignal(false);

  const locateMe = () => {
    if (!navigator.geolocation) return;

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        flyTo({ lat: latitude, lon: longitude }, 15);
        addMarker({ lat: latitude, lon: longitude });
        selectPlace({
          name: "Current Location",
          address: null,
          latitude,
          longitude,
          type: "location",
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <button
      onClick={locateMe}
      disabled={isLocating()}
      data-locate-btn
      class="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-all disabled:opacity-50"
      title="Find my location (L)"
    >
      <Show
        when={!isLocating()}
        fallback={<Loader2 size={18} class="animate-spin" />}
      >
        <Crosshair size={18} strokeWidth={1.5} />
      </Show>
    </button>
  );
}
