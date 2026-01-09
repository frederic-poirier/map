import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { PlaceProvider, usePlace } from '../context/PlaceContext';
import { ProtectedRoute } from './ProtectedRoute';
import { A } from '@solidjs/router';
import { MapProvider, useMap } from '../context/MapContext';
import Map from './Map.jsx';
import SearchBox, { LocateMeButton, LocationList, SearchInput } from './SearchBox.jsx';
import { Tray, TrayPosition } from './Tray.jsx';
import { TrayCard } from './TrayCard.jsx';
import { Map as MapIcon, LogOut, User, Sun, Moon, Keyboard, ArrowLeft, MapPin, Navigation, Trash2 } from 'lucide-solid';
import { Show, For, createSignal, createUniqueId, onMount, onCleanup } from 'solid-js';

export default function Layout(props) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProtectedRoute>
          <MapProvider>
            <PlaceProvider>
              <LayoutContent>{props.children}</LayoutContent>
            </PlaceProvider>
          </MapProvider>
        </ProtectedRoute>
      </AuthProvider>
    </ThemeProvider>
  );
}

function LayoutContent(props) {
  const [isMobile, setIsMobile] = createSignal(typeof window !== 'undefined' && window.innerWidth < 768);

  onMount(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    onCleanup(() => window.removeEventListener('resize', checkMobile));
  });

  return (
    <Show when={isMobile()} fallback={<DesktopLayout>{props.children}</DesktopLayout>}>
      <MobileLayout>{props.children}</MobileLayout>
    </Show>
  );
}

function MobileLayout(props) {
  const { theme, toggleTheme } = useTheme();
  const { mapInstance } = useMap();
  const { selectedPlace } = usePlace();
  let trayRef;

  // Keyboard shortcuts
  onMount(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case '/':
          e.preventDefault();
          document.querySelector('input[placeholder*="Search"]')?.focus();
          break;
        case 't':
          toggleTheme();
          break;
        case 'l':
          document.querySelector('[data-locate-btn]')?.click();
          break;
        case '+':
        case '=':
          mapInstance()?.zoomIn();
          break;
        case '-':
          mapInstance()?.zoomOut();
          break;
        case 'n':
          mapInstance()?.easeTo({ bearing: 0, pitch: 0 });
          break;
        case 'f':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
  });

  const handleHandleClick = () => {
    trayRef?.cyclePosition();
  };

  const handleSearchFocus = () => {
    trayRef?.expand();
  };

  // Search state lifted up to share between header and content
  const [searchQuery, setSearchQuery] = createSignal("");
  const [searchResults, setSearchResults] = createSignal([]);
  const [isSearchFocused, setIsSearchFocused] = createSignal(false);
  
  // Dynamic open height based on header measurement
  const [openHeight, setOpenHeight] = createSignal(110);

  return (
    <Tray
      ref={(ref) => (trayRef = ref)}
      backdrop={<Map />}
      openHeight={openHeight()}
    >
      <TrayCard
        onHandleClick={handleHandleClick}
        onMeasure={(h) => setOpenHeight(h)}
        header={
          <Show when={selectedPlace()} fallback={
            <MobileSearchHeader 
              onFocus={handleSearchFocus}
              query={searchQuery}
              setQuery={setSearchQuery}
              isSearchFocused={isSearchFocused}
              setIsSearchFocused={setIsSearchFocused}
            />
          }>
            <PlaceHeader />
          </Show>
        }
        footer={<MobileFooter />}
      >
        <Show when={selectedPlace()} fallback={
          <MobileSearchContent 
            query={searchQuery}
            setQuery={setSearchQuery}
            results={searchResults}
            setResults={setSearchResults}
            isSearchFocused={isSearchFocused}
            setIsSearchFocused={setIsSearchFocused}
          />
        }>
          <PlaceDetail />
        </Show>
      </TrayCard>
    </Tray>
  );
}

function MobileSearchHeader(props) {
  return (
    <div class="flex items-center gap-2">
      <div class="flex-1">
        <SearchInput 
          onFocus={props.onFocus}
          query={props.query}
          setQuery={props.setQuery}
          isSearchFocused={props.isSearchFocused}
          setIsSearchFocused={props.setIsSearchFocused}
        />
      </div>
      <LocateMeButton />
    </div>
  );
}

function MobileSearchContent(props) {
  return (
    <SearchBox 
      query={props.query}
      setQuery={props.setQuery}
      results={props.results}
      setResults={props.setResults}
      isSearchFocused={props.isSearchFocused}
      setIsSearchFocused={props.setIsSearchFocused}
      showInput={false}
    />
  );
}

function PlaceHeader() {
  const { selectedPlace, clearPlace } = usePlace();
  
  return (
    <div class="flex items-center gap-3">
      <button
        onClick={clearPlace}
        class="p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-all"
      >
        <ArrowLeft size={20} strokeWidth={1.5} />
      </button>
      <div class="flex-1 min-w-0">
        <h2 class="text-base font-semibold text-[var(--text-primary)] truncate">
          {selectedPlace()?.name}
        </h2>
        <Show when={selectedPlace()?.address}>
          <p class="text-xs text-[var(--text-tertiary)] truncate">
            {selectedPlace()?.address}
          </p>
        </Show>
      </div>
    </div>
  );
}

function PlaceDetail() {
  const { selectedPlace } = usePlace();
  const { mapCenter } = useMap();
  
  const place = () => selectedPlace();
  
  const getDistance = () => {
    const p = place();
    const center = mapCenter();
    if (!p || !center) return null;
    
    const R = 6371e3;
    const lat1 = center[1] * Math.PI / 180;
    const lat2 = p.latitude * Math.PI / 180;
    const dLat = (p.latitude - center[1]) * Math.PI / 180;
    const dLon = (p.longitude - center[0]) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const dist = R * c;
    
    if (dist < 1000) return `${Math.round(dist)}m away`;
    return `${(dist / 1000).toFixed(1)}km away`;
  };
  
  return (
    <div class="space-y-4">
      {/* Location info */}
      <div class="flex items-start gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl">
        <MapPin size={18} strokeWidth={1.5} class="text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-sm text-[var(--text-primary)]">
            {place()?.address || `${place()?.latitude?.toFixed(6)}, ${place()?.longitude?.toFixed(6)}`}
          </p>
          <Show when={getDistance()}>
            <p class="text-xs text-[var(--text-tertiary)] mt-1">
              {getDistance()}
            </p>
          </Show>
        </div>
      </div>
      
      {/* Coordinates */}
      <div class="px-1">
        <p class="text-xs text-[var(--text-tertiary)] font-mono">
          {place()?.latitude?.toFixed(6)}, {place()?.longitude?.toFixed(6)}
        </p>
      </div>
      
      {/* Saved places section */}
      <div class="pt-4 border-t border-[var(--border-primary)]">
        <LocationList />
      </div>
    </div>
  );
}

function MobileFooter() {
  const { theme, toggleTheme } = useTheme();
  const { mapCenter } = useMap();

  return (
    <>
      <Show when={mapCenter()}>
        <div class="text-xs font-mono text-[var(--text-tertiary)] tabular-nums">
          {mapCenter()[1].toFixed(5)}, {mapCenter()[0].toFixed(5)}
        </div>
      </Show>
      <div class="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          class="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-all"
          title={theme() === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          <Show when={theme() === 'dark'} fallback={<Moon size={16} strokeWidth={1.5} />}>
            <Sun size={16} strokeWidth={1.5} />
          </Show>
        </button>
      </div>
    </>
  );
}

function DesktopLayout(props) {
  const { theme, toggleTheme } = useTheme();
  const { mapInstance } = useMap();
  const { selectedPlace, clearPlace } = usePlace();

  // Keyboard shortcuts
  onMount(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case '/':
          e.preventDefault();
          document.querySelector('input[placeholder*="Search"]')?.focus();
          break;
        case 't':
          toggleTheme();
          break;
        case 'l':
          document.querySelector('[data-locate-btn]')?.click();
          break;
        case '+':
        case '=':
          mapInstance()?.zoomIn();
          break;
        case '-':
          mapInstance()?.zoomOut();
          break;
        case 'n':
          mapInstance()?.easeTo({ bearing: 0, pitch: 0 });
          break;
        case 'f':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          break;
        case '?':
          document.querySelector('[data-shortcuts-popover]')?.showPopover();
          break;
        case 'Escape':
          if (selectedPlace()) {
            clearPlace();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
  });

  return (
    <>
      <main class="sidebar-enter absolute z-10 left-3 top-3 bottom-3 w-[340px] flex flex-col gap-3">
        <div class="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-xl overflow-hidden flex flex-col flex-1">
          <Show when={selectedPlace()} fallback={<Header />}>
            <DesktopPlaceHeader />
          </Show>
          <div class="flex-1 overflow-y-auto p-4">
            <Show when={selectedPlace()} fallback={<SearchBox />}>
              <PlaceDetail />
            </Show>
          </div>
        </div>
        <Footer />
      </main>
      <Map />
    </>
  );
}

function DesktopPlaceHeader() {
  const { selectedPlace, clearPlace } = usePlace();
  
  return (
    <header class="border-b border-[var(--border-primary)] px-4 py-3">
      <div class="flex items-center gap-3">
        <button
          onClick={clearPlace}
          class="p-1.5 -ml-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-all"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <div class="flex-1 min-w-0">
          <h2 class="text-sm font-semibold text-[var(--text-primary)] truncate">
            {selectedPlace()?.name}
          </h2>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}

function Header() {
  return (
    <header class="border-b border-[var(--border-primary)] px-4 py-3">
      <nav class="flex justify-between items-center">
        <A href="/" class="flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors">
          <MapIcon size={18} strokeWidth={1.5} />
          <span class="font-medium">Map</span>
        </A>
        <div class="flex items-center gap-1">
          <LocateMeButton />
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  const { theme, toggleTheme } = useTheme();
  const shortcutsId = createUniqueId();
  
  return (
    <div class="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-sm px-3 py-2 flex items-center justify-between">
      <CoordinateDisplay />
      <div class="flex items-center gap-1">
        <button
          popoverTarget={shortcutsId}
          class="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-all"
          title="Shortcuts (?)"
        >
          <Keyboard size={16} strokeWidth={1.5} />
        </button>
        <button
          onClick={toggleTheme}
          class="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-all"
          title={theme() === 'dark' ? 'Light mode (T)' : 'Dark mode (T)'}
        >
          <Show when={theme() === 'dark'} fallback={<Moon size={16} strokeWidth={1.5} />}>
            <Sun size={16} strokeWidth={1.5} />
          </Show>
        </button>
      </div>
      <KeyboardShortcutsPopover id={shortcutsId} />
    </div>
  );
}

function KeyboardShortcutsPopover(props) {
  const shortcuts = [
    { key: '/', description: 'Search' },
    { key: 'T', description: 'Theme' },
    { key: 'L', description: 'Location' },
    { key: '+/-', description: 'Zoom' },
    { key: 'N', description: 'North' },
    { key: 'F', description: 'Fullscreen' },
  ];

  return (
    <div 
      popover 
      id={props.id}
      data-shortcuts-popover
      class="popup-enter bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-5 w-56"
    >
      <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4">Shortcuts</h3>
      <ul class="space-y-2.5">
        <For each={shortcuts}>
          {(shortcut) => (
            <li class="flex items-center justify-between text-sm">
              <span class="text-[var(--text-secondary)]">{shortcut.description}</span>
              <kbd class="px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-xs font-mono text-[var(--text-tertiary)]">
                {shortcut.key}
              </kbd>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}

function CoordinateDisplay() {
  const { mapCenter } = useMap();
  
  return (
    <Show when={mapCenter()}>
      <div class="text-xs font-mono text-[var(--text-tertiary)] tabular-nums">
        {mapCenter()[1].toFixed(5)}, {mapCenter()[0].toFixed(5)}
      </div>
    </Show>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const menuId = createUniqueId();
  
  return (
    <Show when={user()}>
      <>
        <button
          popoverTarget={menuId}
          class="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-all"
          title="Account"
        >
          <User size={18} strokeWidth={1.5} />
        </button>
        
        <div 
          popover 
          id={menuId} 
          class="popup-enter bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-2 min-w-[160px]"
        >
          <button
            onClick={logout}
            class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={14} strokeWidth={1.5} />
            <span>Sign out</span>
          </button>
        </div>
      </>
    </Show>
  );
}
