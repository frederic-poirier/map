import { Show, For, createSignal } from "solid-js";
import { useItinerary } from "~/context/ItineraryContext";
import { useMap } from "~/context/MapContext";
import Clock from "lucide-solid/icons/clock";
import Footprints from "lucide-solid/icons/footprints";
import Bus from "lucide-solid/icons/bus";
import Train from "lucide-solid/icons/train";
import ChevronDown from "lucide-solid/icons/chevron-down";
import ChevronUp from "lucide-solid/icons/chevron-up";
import MapPin from "lucide-solid/icons/map-pin";

export default function ItineraryList(props) {
  const { displayRoute } = useMap();
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [expandedLegs, setExpandedLegs] = createSignal({});

  const formatDuration = (seconds) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case "WALK":
        return <Footprints size={16} />;
      case "BUS":
        return <Bus size={16} />;
      case "SUBWAY":
      case "RAIL":
      case "TRAM":
        return <Train size={16} />;
      default:
        return <Bus size={16} />;
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case "WALK":
        return "text-gray-400";
      case "BUS":
        return "text-blue-400";
      case "SUBWAY":
        return "text-orange-400";
      case "RAIL":
      case "TRAM":
        return "text-green-400";
      default:
        return "text-blue-400";
    }
  };

  const getRouteColor = (leg) => {
    if (leg.route?.color) return `#${leg.route.color}`;
    switch (leg.mode) {
      case "BUS":
        return "#3B82F6";
      case "SUBWAY":
        return "#F97316";
      default:
        return "#22C55E";
    }
  };

  const selectItinerary = (index) => {
    setSelectedIndex(index);
    const itinerary = props.itineraries[index];
    if (itinerary && displayRoute) {
      displayRoute(itinerary);
    }
  };

  const toggleLegExpanded = (itinIndex, legIndex) => {
    const key = `${itinIndex}-${legIndex}`;
    setExpandedLegs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div class="space-y-3">
      <h3 class="text-sm font-medium text-[var(--text-secondary)]">
        {props.itineraries.length} route{props.itineraries.length !== 1 ? "s" : ""} found
      </h3>

      <For each={props.itineraries}>
        {(itinerary, index) => (
          <div
            class={`rounded-xl border transition-all cursor-pointer ${
              selectedIndex() === index()
                ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/5"
                : "border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]"
            }`}
            onClick={() => selectItinerary(index())}
          >
            {/* Summary Header */}
            <div class="p-3">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2 text-[var(--text-primary)]">
                  <Clock size={16} class="text-[var(--text-tertiary)]" />
                  <span class="font-medium">{formatDuration(itinerary.duration)}</span>
                </div>
                <div class="text-sm text-[var(--text-secondary)]">
                  {formatTime(itinerary.startTime)} - {formatTime(itinerary.endTime)}
                </div>
              </div>

              {/* Transit Summary Icons */}
              <div class="flex items-center gap-1 flex-wrap">
                <For each={itinerary.legs}>
                  {(leg, legIndex) => (
                    <>
                      <Show when={legIndex() > 0}>
                        <span class="text-[var(--text-tertiary)] text-xs mx-0.5">›</span>
                      </Show>
                      <div
                        class={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          leg.mode === "WALK"
                            ? "bg-gray-500/20 text-gray-400"
                            : "text-white"
                        }`}
                        style={
                          leg.mode !== "WALK"
                            ? { "background-color": getRouteColor(leg) }
                            : {}
                        }
                      >
                        {getModeIcon(leg.mode)}
                        <Show when={leg.route?.shortName}>
                          <span class="font-medium">{leg.route.shortName}</span>
                        </Show>
                        <Show when={leg.mode === "WALK"}>
                          <span>{formatDistance(leg.distance)}</span>
                        </Show>
                      </div>
                    </>
                  )}
                </For>
              </div>
            </div>

            {/* Expanded Leg Details */}
            <Show when={selectedIndex() === index()}>
              <div class="border-t border-[var(--border-primary)] px-3 py-2 space-y-2">
                <For each={itinerary.legs}>
                  {(leg, legIndex) => (
                    <div class="relative pl-6">
                      {/* Timeline Line */}
                      <div
                        class={`absolute left-2 top-0 bottom-0 w-0.5 ${
                          leg.mode === "WALK" ? "border-l-2 border-dashed border-gray-500" : ""
                        }`}
                        style={
                          leg.mode !== "WALK"
                            ? { "background-color": getRouteColor(leg) }
                            : {}
                        }
                      />
                      
                      {/* Timeline Dot */}
                      <div
                        class="absolute left-1 top-1 w-2 h-2 rounded-full bg-[var(--bg-primary)] border-2"
                        style={{ "border-color": getRouteColor(leg) }}
                      />

                      <div class="pb-3">
                        {/* From Location */}
                        <div class="text-sm">
                          <span class="text-[var(--text-tertiary)]">
                            {formatTime(leg.startTime)}
                          </span>
                          <span class="text-[var(--text-primary)] ml-2">
                            {leg.from.name}
                          </span>
                        </div>

                        {/* Leg Info */}
                        <div
                          class={`text-xs mt-1 flex items-center gap-2 ${getModeColor(leg.mode)}`}
                        >
                          {getModeIcon(leg.mode)}
                          <Show when={leg.mode === "WALK"}>
                            <span>Walk {formatDistance(leg.distance)} ({formatDuration(leg.duration)})</span>
                          </Show>
                          <Show when={leg.mode !== "WALK"}>
                            <span>
                              {leg.route?.shortName || leg.mode} → {leg.to.name}
                            </span>
                            <Show when={leg.intermediateStops?.length}>
                              <span class="text-[var(--text-tertiary)]">
                                ({leg.intermediateStops.length} stops)
                              </span>
                            </Show>
                          </Show>
                        </div>

                        {/* Intermediate Stops (Expandable) */}
                        <Show when={leg.intermediateStops?.length > 0}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLegExpanded(index(), legIndex());
                            }}
                            class="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] mt-1 flex items-center gap-1"
                          >
                            <Show
                              when={expandedLegs()[`${index()}-${legIndex()}`]}
                              fallback={<ChevronDown size={12} />}
                            >
                              <ChevronUp size={12} />
                            </Show>
                            {expandedLegs()[`${index()}-${legIndex()}`] ? "Hide" : "Show"} stops
                          </button>
                          
                          <Show when={expandedLegs()[`${index()}-${legIndex()}`]}>
                            <div class="mt-2 space-y-1 pl-2 border-l border-[var(--border-primary)]">
                              <For each={leg.intermediateStops}>
                                {(stop) => (
                                  <div class="text-xs text-[var(--text-tertiary)]">
                                    {stop.name}
                                  </div>
                                )}
                              </For>
                            </div>
                          </Show>
                        </Show>
                      </div>
                    </div>
                  )}
                </For>

                {/* Final Destination */}
                <div class="relative pl-6">
                  <div
                    class="absolute left-1 top-1 w-2 h-2 rounded-full border-2 border-red-400"
                  />
                  <div class="text-sm">
                    <span class="text-[var(--text-tertiary)]">
                      {formatTime(itinerary.endTime)}
                    </span>
                    <span class="text-[var(--text-primary)] ml-2">
                      {itinerary.legs[itinerary.legs.length - 1]?.to.name || "Destination"}
                    </span>
                  </div>
                </div>
              </div>
            </Show>
          </div>
        )}
      </For>
    </div>
  );
}
