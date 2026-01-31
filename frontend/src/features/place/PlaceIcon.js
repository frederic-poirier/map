import Utensils from 'lucide-solid/icons/utensils'
import Coffee from 'lucide-solid/icons/coffee'
import Wine from 'lucide-solid/icons/wine'
import School from 'lucide-solid/icons/school'
import GraduationCap from 'lucide-solid/icons/graduation-cap'
import Library from 'lucide-solid/icons/library'
import Hospital from 'lucide-solid/icons/hospital'
import Toilet from 'lucide-solid/icons/toilet'
import Mail from 'lucide-solid/icons/mail'
import Armchair from 'lucide-solid/icons/armchair'
import Droplet from 'lucide-solid/icons/droplet'
import ShoppingCart from 'lucide-solid/icons/shopping-cart'
import ShoppingBasket from 'lucide-solid/icons/shopping-basket'
import Shirt from 'lucide-solid/icons/shirt'
import Cpu from 'lucide-solid/icons/cpu'
import Book from 'lucide-solid/icons/book'
import TreePine from 'lucide-solid/icons/tree-pine'
import Flower from 'lucide-solid/icons/flower'
import Trophy from 'lucide-solid/icons/trophy'
import Landmark from 'lucide-solid/icons/landmark'
import PawPrint from 'lucide-solid/icons/paw-print'
import Image from 'lucide-solid/icons/image'
import Trees from 'lucide-solid/icons/trees'
import Mountain from 'lucide-solid/icons/mountain'
import Bus from 'lucide-solid/icons/bus'
import Train from 'lucide-solid/icons/train'
import Ship from 'lucide-solid/icons/ship'
import Plane from 'lucide-solid/icons/plane'
import Building from 'lucide-solid/icons/building'
import MapPin from 'lucide-solid/icons/map-pin'

export const ICON_MAP = {
  amenity: {
    restaurant: Utensils,
    cafe: Coffee,
    bar: Wine,
    fast_food: Utensils,
    school: School,
    university: GraduationCap,
    library: Library,
    hospital: Hospital,
    toilets: Toilet,
    post_office: Mail,
    bench: Armchair,
    drinking_water: Droplet
  },
  shop: {
    supermarket: ShoppingCart,
    convenience: ShoppingBasket,
    clothes: Shirt,
    electronics: Cpu,
    books: Book
  },
  leisure: {
    park: TreePine,
    garden: Flower,
    stadium: Trophy
  },
  tourism: {
    museum: Landmark,
    zoo: PawPrint,
    attraction: Landmark,
    artwork: Image
  },
  natural: {
    forest: Trees,
    peak: Mountain
  },
  transport: {
    bus_stop: Bus,
    train_station: Train,
    ferry_terminal: Ship,
    aerodrome: Plane
  },
  place: {
    city: Building,
    town: Building,
    village: Building
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