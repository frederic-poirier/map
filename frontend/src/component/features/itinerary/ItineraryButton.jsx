import ArrowRight from "lucide-solid/icons/arrow-right";

export default function ItineraryButton(props) {
  const { place, onClick } = props;

  return (
    <button
      onClick={() => onClick?.(place)}
      class="w-full flex items-center justify-between px-5 py-4
             hover:bg-[var(--accent-primary)]/90 
             rounded-2xl transition-all active:scale-[0.98]"
    >
      <span class="text-base">Directions</span>
      <ArrowRight size={22} strokeWidth={2.5} />
    </button>
  );
}
