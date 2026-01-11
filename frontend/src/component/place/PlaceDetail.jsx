import { Show } from "solid-js";
import MapPin from "lucide-solid/icons/map-pin";
import Building2 from "lucide-solid/icons/building-2";
import Store from "lucide-solid/icons/store";
import Utensils from "lucide-solid/icons/utensils";
import Coffee from "lucide-solid/icons/coffee";
import GraduationCap from "lucide-solid/icons/graduation-cap";
import Hospital from "lucide-solid/icons/hospital";
import Train from "lucide-solid/icons/train";
import Bus from "lucide-solid/icons/bus";
import TreePine from "lucide-solid/icons/tree-pine";
import Home from "lucide-solid/icons/home";
import Landmark from "lucide-solid/icons/landmark";
import ShoppingBag from "lucide-solid/icons/shopping-bag";
import Fuel from "lucide-solid/icons/fuel";
import ParkingCircle from "lucide-solid/icons/parking-circle";
import Church from "lucide-solid/icons/church";
import Dumbbell from "lucide-solid/icons/dumbbell";
import Music from "lucide-solid/icons/music";
import Film from "lucide-solid/icons/film";
import Book from "lucide-solid/icons/book";
import Bookmark from "lucide-solid/icons/bookmark";

// Map OSM key/value to display info
const getPlaceTypeInfo = (place) => {
  // Handle saved places
  if (place.type === "saved") {
    return {
      icon: Bookmark,
      label: "Saved Place",
      color: "text-[var(--accent-primary)]",
    };
  }

  const key = place.osmKey || place.osm_key;
  const value = place.osmValue || place.osm_value;

  // Category mappings
  const typeMap = {
    // Amenities
    "amenity:restaurant": {
      icon: Utensils,
      label: "Restaurant",
      color: "text-orange-400",
    },
    "amenity:cafe": { icon: Coffee, label: "Cafe", color: "text-amber-400" },
    "amenity:bar": { icon: Coffee, label: "Bar", color: "text-purple-400" },
    "amenity:fast_food": {
      icon: Utensils,
      label: "Fast Food",
      color: "text-red-400",
    },
    "amenity:university": {
      icon: GraduationCap,
      label: "University",
      color: "text-blue-400",
    },
    "amenity:college": {
      icon: GraduationCap,
      label: "College",
      color: "text-blue-400",
    },
    "amenity:school": {
      icon: GraduationCap,
      label: "School",
      color: "text-blue-400",
    },
    "amenity:hospital": {
      icon: Hospital,
      label: "Hospital",
      color: "text-red-400",
    },
    "amenity:clinic": {
      icon: Hospital,
      label: "Clinic",
      color: "text-red-400",
    },
    "amenity:pharmacy": {
      icon: Hospital,
      label: "Pharmacy",
      color: "text-green-400",
    },
    "amenity:bank": { icon: Landmark, label: "Bank", color: "text-green-400" },
    "amenity:parking": {
      icon: ParkingCircle,
      label: "Parking",
      color: "text-blue-400",
    },
    "amenity:fuel": {
      icon: Fuel,
      label: "Gas Station",
      color: "text-yellow-400",
    },
    "amenity:place_of_worship": {
      icon: Church,
      label: "Place of Worship",
      color: "text-purple-400",
    },
    "amenity:library": {
      icon: Book,
      label: "Library",
      color: "text-amber-400",
    },
    "amenity:cinema": { icon: Film, label: "Cinema", color: "text-pink-400" },
    "amenity:theatre": {
      icon: Music,
      label: "Theatre",
      color: "text-pink-400",
    },
    "amenity:gym": { icon: Dumbbell, label: "Gym", color: "text-green-400" },

    // Shops
    "shop:supermarket": {
      icon: ShoppingBag,
      label: "Supermarket",
      color: "text-green-400",
    },
    "shop:convenience": {
      icon: Store,
      label: "Convenience Store",
      color: "text-blue-400",
    },
    "shop:mall": {
      icon: ShoppingBag,
      label: "Shopping Mall",
      color: "text-pink-400",
    },
    "shop:clothes": {
      icon: ShoppingBag,
      label: "Clothing Store",
      color: "text-purple-400",
    },
    "shop:department_store": {
      icon: ShoppingBag,
      label: "Department Store",
      color: "text-blue-400",
    },

    // Transport
    "railway:station": {
      icon: Train,
      label: "Train Station",
      color: "text-orange-400",
    },
    "railway:subway_entrance": {
      icon: Train,
      label: "Metro Station",
      color: "text-orange-400",
    },
    "highway:bus_stop": {
      icon: Bus,
      label: "Bus Stop",
      color: "text-blue-400",
    },
    "public_transport:station": {
      icon: Train,
      label: "Transit Station",
      color: "text-orange-400",
    },

    // Places
    "leisure:park": { icon: TreePine, label: "Park", color: "text-green-400" },
    "leisure:garden": {
      icon: TreePine,
      label: "Garden",
      color: "text-green-400",
    },
    "tourism:museum": {
      icon: Landmark,
      label: "Museum",
      color: "text-amber-400",
    },
    "tourism:hotel": {
      icon: Building2,
      label: "Hotel",
      color: "text-blue-400",
    },
    "tourism:attraction": {
      icon: Landmark,
      label: "Attraction",
      color: "text-pink-400",
    },

    // Buildings
    "building:residential": {
      icon: Home,
      label: "Residential",
      color: "text-gray-400",
    },
    "building:commercial": {
      icon: Building2,
      label: "Commercial Building",
      color: "text-gray-400",
    },
    "building:office": {
      icon: Building2,
      label: "Office Building",
      color: "text-gray-400",
    },

    // Generic fallbacks by key
    amenity: { icon: MapPin, label: "Amenity", color: "text-blue-400" },
    shop: { icon: Store, label: "Shop", color: "text-purple-400" },
    building: { icon: Building2, label: "Building", color: "text-gray-400" },
    leisure: { icon: TreePine, label: "Leisure", color: "text-green-400" },
    tourism: { icon: Landmark, label: "Tourism", color: "text-amber-400" },
  };

  // Try specific match first
  const specificKey = `${key}:${value}`;
  if (typeMap[specificKey]) {
    return typeMap[specificKey];
  }

  // Fall back to key-only match
  if (key && typeMap[key]) {
    // Use the value as label if available
    const info = { ...typeMap[key] };
    if (value) {
      info.label =
        value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
    }
    return info;
  }

  // Default fallback
  return {
    icon: MapPin,
    label: "Location",
    color: "text-[var(--text-tertiary)]",
  };
};

export default function PlaceDetail(props) {
  const { place } = props;
  const typeInfo = () => getPlaceTypeInfo(place);
  const IconComponent = () => typeInfo().icon;

  return (
    <div class="space-y-2">
      {/* Header with icon and name */}
      <div class="flex items-start gap-3">
        <div
          class={`p-2 rounded-lg bg-[var(--bg-secondary)] flex-shrink-0 ${typeInfo().color}`}
        >
          <IconComponent size={18} />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-[var(--text-primary)] leading-tight">
            {place.name}
          </h3>
          <Show when={place.address || place.street}>
            <p class="text-sm text-[var(--text-secondary)] mt-0.5">
              {place.address || place.street}
              <Show when={place.housenumber}> {place.housenumber}</Show>
            </p>
          </Show>
        </div>
      </div>

      {/* Type badge and location */}
      <div class="flex items-center gap-2 flex-wrap">
        <span
          class={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--bg-secondary)] ${typeInfo().color}`}
        >
          {typeInfo().label}
        </span>
        <Show when={place.city || place.district}>
          <span class="text-xs text-[var(--text-tertiary)]">
            {[place.district, place.city].filter(Boolean).join(", ")}
          </span>
        </Show>
      </div>

      {/* Coordinates */}
      <div class="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
        <span>
          {place.latitude?.toFixed(5)}, {place.longitude?.toFixed(5)}
        </span>
        <Show when={place.postcode}>
          <span>{place.postcode}</span>
        </Show>
      </div>
    </div>
  );
}
