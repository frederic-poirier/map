import Route from "lucide-solid/icons/route";

export default function ItineraryButton(props) {
  const { place, onClick } = props;

  return (
    <button
      onClick={() => onClick?.(place)}
      class="w-full flex items-center justify-center gap-2 px-4 py-2.5 
             bg-blue-600 hover:bg-blue-700 
             text-white font-medium text-sm 
             rounded-lg transition-colors"
    >
      <Route size={16} />
      <span>Get Directions</span>
    </button>
  );
}
