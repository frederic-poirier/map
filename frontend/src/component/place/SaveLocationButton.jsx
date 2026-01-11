import { createSignal, Show } from "solid-js";
import { useLocation } from "~/context/LocationContext";
import Bookmark from "lucide-solid/icons/bookmark";
import BookmarkCheck from "lucide-solid/icons/bookmark-check";
import X from "lucide-solid/icons/x";
import Loader2 from "lucide-solid/icons/loader-2";

export default function SaveLocationButton(props) {
  const { place } = props;
  const { locations, saveLocation } = useLocation();
  
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [customName, setCustomName] = createSignal("");
  const [isSaving, setIsSaving] = createSignal(false);
  const [error, setError] = createSignal(null);

  // Check if this place is already saved
  const isSaved = () => {
    const locs = locations();
    if (!locs || !place) return false;
    return locs.some(
      (loc) =>
        Math.abs(loc.latitude - place.latitude) < 0.0001 &&
        Math.abs(loc.longitude - place.longitude) < 0.0001
    );
  };

  const openModal = () => {
    setCustomName(place.name || "");
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCustomName("");
    setError(null);
  };

  const handleSave = async () => {
    const name = customName().trim();
    if (!name) {
      setError("Please enter a name");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await saveLocation(place.latitude, place.longitude, name);
      closeModal();
    } catch (err) {
      setError("Failed to save location");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      closeModal();
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        disabled={isSaved()}
        class="w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        classList={{
          "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]": isSaved(),
          "bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]": !isSaved(),
        }}
      >
        <Show when={isSaved()} fallback={<Bookmark size={18} />}>
          <BookmarkCheck size={18} />
        </Show>
        <span>{isSaved() ? "Saved" : "Save Location"}</span>
      </button>

      {/* Modal Overlay */}
      <Show when={isModalOpen()}>
        <div
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div class="bg-[var(--bg-primary)] rounded-2xl w-full max-w-sm shadow-xl border border-[var(--border-primary)]">
            {/* Header */}
            <div class="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
              <h3 class="font-semibold text-[var(--text-primary)]">Save Location</h3>
              <button
                onClick={closeModal}
                class="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div class="p-4 space-y-4">
              <div>
                <label class="block text-sm text-[var(--text-secondary)] mb-1.5">
                  Name this place
                </label>
                <input
                  type="text"
                  value={customName()}
                  onInput={(e) => setCustomName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Home, Work, Gym..."
                  autofocus
                  class="w-full px-3 py-2.5 bg-[var(--bg-secondary)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                />
              </div>

              <Show when={error()}>
                <p class="text-sm text-red-400">{error()}</p>
              </Show>

              {/* Place Preview */}
              <div class="p-3 bg-[var(--bg-secondary)] rounded-xl">
                <p class="text-xs text-[var(--text-tertiary)] mb-1">Location</p>
                <p class="text-sm text-[var(--text-primary)]">{place.name}</p>
                <Show when={place.address || place.street}>
                  <p class="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {place.address || place.street}
                  </p>
                </Show>
              </div>
            </div>

            {/* Footer */}
            <div class="p-4 border-t border-[var(--border-primary)] flex gap-3">
              <button
                onClick={closeModal}
                class="flex-1 py-2.5 rounded-xl font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving()}
                class="flex-1 py-2.5 rounded-xl font-medium bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Show when={isSaving()} fallback={<Bookmark size={16} />}>
                  <Loader2 size={16} class="animate-spin" />
                </Show>
                <span>{isSaving() ? "Saving..." : "Save"}</span>
              </button>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}
