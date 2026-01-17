import { usePlace } from "~/context/PlaceContext";
import { For, Show } from "solid-js";
import MapPin from "lucide-solid/icons/map-pin";
import Bookmark from "lucide-solid/icons/bookmark";
import Loader2 from "lucide-solid/icons/loader-2";
import { useNavigate } from "@solidjs/router";



export function LocationList() {
  const { savedPlaces } = usePlace();
  const navigate = useNavigate();

  const goToLocation = (savedPlace) => {
    navigate("/place/" + savedPlace.placeId);
  };

  return (
    <div class="space-y-1 overflow-x-hidden px-2 pb-2">
      <div class="flex items-center justify-between px-1">
        <span class="text-xs font-medium text-[var(--text-tertiary)] tracking-tight">
          Saved
        </span>
        <Show when={savedPlaces()?.length > 0}>
          <span class="text-xs text-[var(--text-tertiary)] tabular-nums">
            {savedPlaces()?.length}
          </span>
        </Show>
      </div>

      <Show
        when={!savedPlaces.loading}
        fallback={
          <div class="flex items-center justify-center py-12">
            <Loader2
              size={20}
              class="animate-spin text-[var(--text-tertiary)]"
            />
          </div>
        }
      >
        <Show
          when={savedPlaces()?.length > 0}
          fallback={
            <div class="text-center py-12">
              <Bookmark
                size={20}
                strokeWidth={1.5}
                class="mx-auto mb-2 text-[var(--text-tertiary)]"
              />
              <p class="text-sm text-[var(--text-tertiary)]">No saved places</p>
            </div>
          }
        >
          <ul class="space-y-0.5">
            <For each={savedPlaces()}>
              {(savedPlace, index) => (
                <li
                  class="group location-item-enter"
                  style={{ "animation-delay": `${index() * 30}ms` }}
                >
                  <button
                    class="flex items-center gap-2 px-2 py-2 -mx-2 rounded-lg hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
                    onClick={() => goToLocation(savedPlace)}
                  >
                    <MapPin
                      size={14}
                      strokeWidth={1.5}
                      class="text-[var(--text-tertiary)] flex-shrink-0"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-[var(--text-primary)] truncate">
                        {savedPlace.name}
                      </p>
                    </div>
                  </button>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </Show>
    </div>
  );
}
