import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { ProtectedRoute } from './ProtectedRoute';
import { A } from '@solidjs/router';
import { MapProvider, useMap } from '../context/MapContext';
import Map from './Map.jsx';
import { LocateMeButton } from './SearchBox.jsx';
import { Map as MapIcon, LogOut, User, Sun, Moon, Keyboard } from 'lucide-solid';
import { Show, For, createSignal, createUniqueId, onMount, onCleanup } from 'solid-js';

export default function Layout(props) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProtectedRoute>
          <MapProvider>
            <Sidebar>{props.children}</Sidebar>
            <Map />
          </MapProvider>
        </ProtectedRoute>
      </AuthProvider>
    </ThemeProvider>
  );
}

function Sidebar(props) {
  const { theme, toggleTheme } = useTheme();
  const { mapInstance } = useMap();

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
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
  });

  return (
    <main class='absolute z-10 left-3 top-3 bottom-3 w-[340px] flex flex-col gap-3 sidebar-enter'>
      <div class="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-xl overflow-hidden flex flex-col flex-1">
        <Header />
        <div class="flex-1 overflow-y-auto p-4">
          {props.children}
        </div>
      </div>
      <Footer />
    </main>
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
