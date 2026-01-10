import { MapProvider } from "~/context/MapContext";
import { SearchProvider } from "../../context/SearchContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthProvider } from "~/context/AuthContext";
import { ThemeProvider } from "~/context/ThemeContext";
import { PlaceProvider } from "~/context/PlaceContext";
import { useNavigate } from "@solidjs/router";
import LocationProvider from "~/context/LocationContext";
import LocateMeButton from "../location/LocateMeButton";
import User from "lucide-solid/icons/user";
import ChevronLeft from "lucide-solid/icons/chevron-left";
import Map from "../Map";
import { A } from "@solidjs/router";

export default function Layout(props) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ThemeProvider>
          <MapProvider>
            <PlaceProvider>
              <SearchProvider>
                <LocationProvider>
                  <div class="overflow-hidden">
                    <Map />
                  </div>
                  <div class="absolute bg-neutral-50 dark:bg-neutral-900 left-2 top-2 rounded-xl shadow-lg w-80">
                    <header class="flex items-center border-b border-neutral-200 dark:border-neutral-800 px-4 py-2">
                      <h1 class="mr-auto font-medium">Map</h1>

                      <LocateMeButton />
                      <A
                        href="/profile"
                        class="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <User size={16} color="var(--text-secondary)" />
                      </A>
                    </header>
                    <main class="p-2">{props.children}</main>
                  </div>
                </LocationProvider>
              </SearchProvider>
            </PlaceProvider>
          </MapProvider>
        </ThemeProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export function LayoutHeader(props) {
  const navigate = useNavigate();

  return (
    <header>
      <button
        class="flex items-center font-medium tracking-tight text-[var(--text-secondary)]"
        onclick={() => navigate(-1)}
      >
        <ChevronLeft size={16} color="var(--text-secondary)" />
        <h2>{props.title}</h2>
      </button>
    </header>
  );
}
