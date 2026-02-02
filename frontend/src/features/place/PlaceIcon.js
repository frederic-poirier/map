import Utensils from "lucide-solid/icons/utensils";
import Coffee from "lucide-solid/icons/coffee";
import Wine from "lucide-solid/icons/wine";
import Beer from "lucide-solid/icons/beer";
import Pizza from "lucide-solid/icons/pizza";
import IceCream from "lucide-solid/icons/ice-cream";

import School from "lucide-solid/icons/school";
import GraduationCap from "lucide-solid/icons/graduation-cap";
import Library from "lucide-solid/icons/library";

import Hospital from "lucide-solid/icons/hospital";
import Stethoscope from "lucide-solid/icons/stethoscope";
import Pill from "lucide-solid/icons/pill";

import Toilet from "lucide-solid/icons/toilet";
import Mail from "lucide-solid/icons/mail";
import Mailbox from "lucide-solid/icons/mailbox";
import Armchair from "lucide-solid/icons/armchair";
import Droplet from "lucide-solid/icons/droplet";
import Fuel from "lucide-solid/icons/fuel";

import CreditCard from "lucide-solid/icons/credit-card";
import Shield from "lucide-solid/icons/shield";
import Flame from "lucide-solid/icons/flame";
import Church from "lucide-solid/icons/church";

import ShoppingCart from "lucide-solid/icons/shopping-cart";
import ShoppingBasket from "lucide-solid/icons/shopping-basket";
import Shirt from "lucide-solid/icons/shirt";
import Cpu from "lucide-solid/icons/cpu";
import Book from "lucide-solid/icons/book";
import Scissors from "lucide-solid/icons/scissors";
import Wrench from "lucide-solid/icons/wrench";
import Car from "lucide-solid/icons/car";
import Bike from "lucide-solid/icons/bike";
import Phone from "lucide-solid/icons/phone";
import Flower from "lucide-solid/icons/flower";
import PawPrint from "lucide-solid/icons/paw-print";

import TreePine from "lucide-solid/icons/tree-pine";
import Trees from "lucide-solid/icons/trees";
import Mountain from "lucide-solid/icons/mountain";

import Trophy from "lucide-solid/icons/trophy";
import Gamepad2 from "lucide-solid/icons/gamepad-2";
import Dumbbell from "lucide-solid/icons/dumbbell";
import Music from "lucide-solid/icons/music";
import Image from "lucide-solid/icons/image";
import Camera from "lucide-solid/icons/camera";

import Hotel from "lucide-solid/icons/hotel";
import Bed from "lucide-solid/icons/bed";
import Landmark from "lucide-solid/icons/landmark";

import Bus from "lucide-solid/icons/bus";
import Train from "lucide-solid/icons/train";
import TramFront from "lucide-solid/icons/tram-front";
import Ship from "lucide-solid/icons/ship";
import Plane from "lucide-solid/icons/plane";
import ParkingCircle from "lucide-solid/icons/parking-circle";

import Building from "lucide-solid/icons/building";
import Home from "lucide-solid/icons/home";
import Factory from "lucide-solid/icons/factory";
import Warehouse from "lucide-solid/icons/warehouse";
import Store from "lucide-solid/icons/store";
import Briefcase from "lucide-solid/icons/briefcase";
import MapPin from "lucide-solid/icons/map-pin";

export const ICON_MAP = {
  amenity: {
    restaurant: Utensils,
    cafe: Coffee,
    bar: Wine,
    pub: Beer,
    fast_food: Pizza,
    ice_cream: IceCream,

    school: School,
    college: GraduationCap,
    university: GraduationCap,
    library: Library,

    hospital: Hospital,
    clinic: Stethoscope,
    doctors: Stethoscope,
    pharmacy: Pill,

    toilets: Toilet,
    post_office: Mail,
    post_box: Mailbox,
    bench: Armchair,
    drinking_water: Droplet,
    fuel: Fuel,

    atm: CreditCard,
    police: Shield,
    fire_station: Flame,
    place_of_worship: Church
  },

  shop: {
    supermarket: ShoppingCart,
    grocery: ShoppingCart,
    convenience: ShoppingBasket,
    bakery: Pizza,

    clothes: Shirt,
    shoes: Shirt,
    electronics: Cpu,
    mobile_phone: Phone,
    books: Book,

    hairdresser: Scissors,
    hardware: Wrench,
    car: Car,
    bicycle: Bike,
    florist: Flower,
    pet: PawPrint
  },

  leisure: {
    park: TreePine,
    garden: Flower,
    playground: Gamepad2,
    sports_centre: Dumbbell,
    stadium: Trophy,
    fitness_centre: Dumbbell,
    swimming_pool: Droplet,
    cinema: Image,
    theatre: Music
  },

  tourism: {
    hotel: Hotel,
    hostel: Bed,
    guest_house: Bed,
    motel: Bed,

    museum: Landmark,
    gallery: Image,
    zoo: PawPrint,
    attraction: Camera,
    artwork: Image,
    viewpoint: Camera
  },

  natural: {
    forest: Trees,
    wood: Trees,
    tree: TreePine,
    peak: Mountain,
    hill: Mountain,
    water: Droplet,
    beach: MapPin
  },

  transport: {
    bus_stop: Bus,
    bus_station: Bus,
    train_station: Train,
    tram_stop: TramFront,
    ferry_terminal: Ship,
    aerodrome: Plane,
    airport: Plane,
    parking: ParkingCircle,
    bicycle_parking: Bike,
    car_rental: Car
  },

  place: {
    city: Building,
    town: Building,
    village: Home,
    suburb: Home,
    neighbourhood: Home,
    hamlet: Home
  },

  building: {
    residential: Home,
    apartments: Building,
    house: Home,
    industrial: Factory,
    warehouse: Warehouse,
    commercial: Store,
    office: Briefcase
  }
};


export function getIconForFeature(properties) {
  const key = properties.osm_key;
  const value = properties.osm_value;

  if (key && ICON_MAP[key] && ICON_MAP[key][value]) return ICON_MAP[key][value];
  if (properties.type === 'city') return Building;
  if (properties.type === 'building') return Building;

  return MapPin;
}
