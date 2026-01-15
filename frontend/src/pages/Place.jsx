import { useParams, useNavigate } from "@solidjs/router";
import { Show, createEffect, createResource, onCleanup, For, createMemo } from "solid-js";
import { LayoutHeader } from "~/component/features/layout/Layout";
import SaveLocationButton from "~/component/features/place/SaveLocationButton";
import ItineraryButton from "~/component/features/itinerary/ItineraryButton";
import { usePlace } from "~/context/PlaceContext";
import { getPlaceType } from "~/component/features/place/placeTypeMap";
import { useMap } from "~/context/MapContext";

// Icons
import MapPin from "lucide-solid/icons/map-pin";
import Navigation from "lucide-solid/icons/navigation";
import Phone from "lucide-solid/icons/phone";
import Globe from "lucide-solid/icons/globe";
import Clock from "lucide-solid/icons/clock";
import Mail from "lucide-solid/icons/mail";
import Star from "lucide-solid/icons/star";
import Building2 from "lucide-solid/icons/building-2";
import Layers from "lucide-solid/icons/layers";
import Hash from "lucide-solid/icons/hash";
import Wifi from "lucide-solid/icons/wifi";
import Accessibility from "lucide-solid/icons/accessibility";
import ParkingCircle from "lucide-solid/icons/parking-circle";
import CreditCard from "lucide-solid/icons/credit-card";
import ExternalLink from "lucide-solid/icons/external-link";
import Copy from "lucide-solid/icons/copy";
import Check from "lucide-solid/icons/check";
import { createSignal } from "solid-js";

export default function Place() {
  const params = useParams();
  const navigate = useNavigate();
  const { fetchPlaceById, getSavedPlaceById } = usePlace();
  const { flyTo, addMarker, removeMarker } = useMap();

  const [place, { refetch }] = createResource(() => params.id, fetchPlaceById);
  const [copiedField, setCopiedField] = createSignal(null);

  // Get saved place data (for custom name)
  const savedPlace = createMemo(() => getSavedPlaceById(params.id));

  // Display name: custom saved name > OSM name > fallback
  const displayName = createMemo(() => {
    const saved = savedPlace();
    const p = place();
    return saved?.name || p?.name || p?.properties?.name || "Unknown Place";
  });

  let lastPlace = null;
  createEffect(() => {
    if (place() && place() !== lastPlace) {
      lastPlace = place();
      const lat = place().geometry.coordinates[1];
      const lon = place().geometry.coordinates[0];
      flyTo({ lat, lon });
      addMarker({ lat, lon });
    }
  });

  onCleanup(() => {
    lastPlace = null;
    removeMarker();
  });

  const handleDirections = () => {
    navigate(`/directions?to=${params.id}`);
  };

  const placeType = createMemo(() => {
    if (!place()) return null;
    return getPlaceType(place().properties || {});
  });

  const copyToClipboard = async (text, field) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Extract useful properties from OSM data
  const getAddress = () => {
    const props = place()?.properties || {};
    const parts = [];
    if (props.housenumber) parts.push(props.housenumber);
    if (props.street) parts.push(props.street);
    return parts.join(" ");
  };

  const getFullAddress = () => {
    const props = place()?.properties || {};
    const parts = [];
    if (props.housenumber) parts.push(props.housenumber);
    if (props.street) parts.push(props.street);
    if (props.city || props.district) parts.push(props.city || props.district);
    if (props.postcode) parts.push(props.postcode);
    return parts.join(", ");
  };

  const getCoordinates = () => {
    if (!place()?.geometry?.coordinates) return null;
    const [lon, lat] = place().geometry.coordinates;
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  };

  return (
    <div class="space-y-4">
      <LayoutHeader title="Place" />

      <Show
        when={!place.loading && place()}
        fallback={<PlaceSkeleton />}
      >
        {/* Hero Section with Icon */}
        <div class="flex items-start gap-4">
          <div class={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getIconGradient(placeType()?.color)}`}>
            <Show when={placeType()?.icon} fallback={<MapPin size={28} class="text-white" />}>
              {(() => {
                const Icon = placeType().icon;
                return <Icon size={28} class="text-white" />;
              })()}
            </Show>
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-xl font-bold text-[var(--text-primary)] leading-tight">
              {displayName()}
            </h1>
            <Show when={savedPlace() && place()?.properties?.name && savedPlace()?.name !== place()?.properties?.name}>
              <p class="text-xs text-[var(--text-tertiary)]">
                {place().properties.name}
              </p>
            </Show>
            <p class={`text-sm font-medium ${placeType()?.color || 'text-gray-400'}`}>
              {placeType()?.label || "Place"}
            </p>
            <Show when={getAddress()}>
              <p class="text-sm text-[var(--text-tertiary)] mt-0.5 truncate">
                {getAddress()}
              </p>
            </Show>
          </div>
        </div>

        {/* Quick Actions */}
        <div class="flex items-center gap-3">
          <div class="flex-1">
            <ItineraryButton place={place()} onClick={handleDirections} />
          </div>
          <SaveLocationButton place={place()} />
        </div>

        {/* Info Cards */}
        <div class="space-y-2">
          {/* Address Card */}
          <Show when={getFullAddress()}>
            <InfoCard
              icon={MapPin}
              label="Address"
              value={getFullAddress()}
              onCopy={() => copyToClipboard(getFullAddress(), "address")}
              copied={copiedField() === "address"}
            />
          </Show>

          {/* Phone */}
          <Show when={place().properties?.phone}>
            <InfoCard
              icon={Phone}
              label="Phone"
              value={place().properties.phone}
              href={`tel:${place().properties.phone}`}
              onCopy={() => copyToClipboard(place().properties.phone, "phone")}
              copied={copiedField() === "phone"}
            />
          </Show>

          {/* Website */}
          <Show when={place().properties?.website}>
            <InfoCard
              icon={Globe}
              label="Website"
              value={formatUrl(place().properties.website)}
              href={place().properties.website}
              external
            />
          </Show>

          {/* Email */}
          <Show when={place().properties?.email}>
            <InfoCard
              icon={Mail}
              label="Email"
              value={place().properties.email}
              href={`mailto:${place().properties.email}`}
              onCopy={() => copyToClipboard(place().properties.email, "email")}
              copied={copiedField() === "email"}
            />
          </Show>

          {/* Opening Hours */}
          <Show when={place().properties?.opening_hours}>
            <InfoCard
              icon={Clock}
              label="Hours"
              value={formatOpeningHours(place().properties.opening_hours)}
              multiline
            />
          </Show>

          {/* Coordinates */}
          <Show when={getCoordinates()}>
            <InfoCard
              icon={Navigation}
              label="Coordinates"
              value={getCoordinates()}
              onCopy={() => copyToClipboard(getCoordinates(), "coords")}
              copied={copiedField() === "coords"}
              secondary
            />
          </Show>
        </div>

        {/* Amenities / Features */}
        <Show when={hasAmenities(place().properties)}>
          <div class="space-y-2">
            <h3 class="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Features
            </h3>
            <div class="flex flex-wrap gap-2">
              <Show when={place().properties?.wheelchair === "yes"}>
                <FeatureBadge icon={Accessibility} label="Wheelchair Accessible" />
              </Show>
              <Show when={place().properties?.internet_access === "wlan" || place().properties?.internet_access === "yes"}>
                <FeatureBadge icon={Wifi} label="WiFi" />
              </Show>
              <Show when={place().properties?.parking}>
                <FeatureBadge icon={ParkingCircle} label="Parking" />
              </Show>
              <Show when={place().properties?.payment_cash === "yes" || place().properties?.payment_cards === "yes"}>
                <FeatureBadge icon={CreditCard} label={place().properties?.payment_cards === "yes" ? "Cards Accepted" : "Cash Only"} />
              </Show>
            </div>
          </div>
        </Show>

        {/* OSM Attribution */}
        <div class="pt-2 border-t border-[var(--border-primary)]">
          <div class="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
            <div class="flex items-center gap-1.5">
              <Hash size={12} />
              <span>OSM ID: {place().properties?.osm_id}</span>
            </div>
            <a
              href={`https://www.openstreetmap.org/${place().properties?.osm_type || 'node'}/${place().properties?.osm_id}`}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1 hover:text-[var(--text-secondary)] transition-colors"
            >
              <span>View on OSM</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </Show>
    </div>
  );
}

// Info Card Component
function InfoCard(props) {
  const content = (
    <div class="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] group">
      <div class={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${props.secondary ? 'bg-[var(--bg-tertiary)]' : 'bg-[var(--accent-primary)]/10'}`}>
        <props.icon size={16} class={props.secondary ? 'text-[var(--text-tertiary)]' : 'text-[var(--accent-primary)]'} />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">
          {props.label}
        </p>
        <p class={`text-sm text-[var(--text-primary)] ${props.multiline ? 'whitespace-pre-line' : 'truncate'}`}>
          {props.value}
        </p>
      </div>
      <Show when={props.onCopy}>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); props.onCopy(); }}
          class="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-tertiary)] transition-all"
        >
          <Show when={props.copied} fallback={<Copy size={14} class="text-[var(--text-tertiary)]" />}>
            <Check size={14} class="text-green-500" />
          </Show>
        </button>
      </Show>
      <Show when={props.external}>
        <ExternalLink size={14} class="text-[var(--text-tertiary)] flex-shrink-0 mt-1" />
      </Show>
    </div>
  );

  if (props.href) {
    return (
      <a href={props.href} target={props.external ? "_blank" : undefined} rel={props.external ? "noopener noreferrer" : undefined} class="block">
        {content}
      </a>
    );
  }
  return content;
}

// Feature Badge Component
function FeatureBadge(props) {
  return (
    <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
      <props.icon size={12} />
      <span class="text-xs font-medium">{props.label}</span>
    </div>
  );
}

// Loading skeleton
function PlaceSkeleton() {
  return (
    <div class="space-y-4 animate-pulse">
      <div class="flex items-start gap-4">
        <div class="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)]" />
        <div class="flex-1 space-y-2">
          <div class="h-5 bg-[var(--bg-secondary)] rounded w-3/4" />
          <div class="h-4 bg-[var(--bg-secondary)] rounded w-1/3" />
          <div class="h-3 bg-[var(--bg-secondary)] rounded w-1/2" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="h-10 bg-[var(--bg-secondary)] rounded-xl" />
        <div class="h-10 bg-[var(--bg-secondary)] rounded-xl" />
      </div>
      <div class="space-y-2">
        <div class="h-16 bg-[var(--bg-secondary)] rounded-xl" />
        <div class="h-16 bg-[var(--bg-secondary)] rounded-xl" />
        <div class="h-16 bg-[var(--bg-secondary)] rounded-xl" />
      </div>
    </div>
  );
}

// Helpers
function getIconGradient(colorClass) {
  const gradients = {
    "text-orange-400": "from-orange-400 to-orange-600",
    "text-amber-400": "from-amber-400 to-amber-600",
    "text-yellow-400": "from-yellow-400 to-yellow-600",
    "text-green-400": "from-green-400 to-green-600",
    "text-blue-400": "from-blue-400 to-blue-600",
    "text-purple-400": "from-purple-400 to-purple-600",
    "text-pink-400": "from-pink-400 to-pink-600",
    "text-red-400": "from-red-400 to-red-600",
    "text-gray-400": "from-gray-400 to-gray-600",
  };
  return gradients[colorClass] || "from-gray-400 to-gray-600";
}

function formatUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatOpeningHours(hours) {
  if (!hours) return "";
  // Simple formatting - replace semicolons with newlines
  return hours.replace(/;\s*/g, "\n").replace(/,\s*/g, ", ");
}

function hasAmenities(props) {
  if (!props) return false;
  return props.wheelchair || props.internet_access || props.parking ||
    props.payment_cash || props.payment_cards;
}
