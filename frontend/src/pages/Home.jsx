import usePhoton from "../hooks/usePhoton";
import { For, Show, createSignal, createEffect } from "solid-js";
import BottomSheet from "../components/BottomSheet";
import Search from 'lucide-solid/icons/search'
import MapPin from 'lucide-solid/icons/map-pin'
import Globe from 'lucide-solid/icons/globe'
import Building2 from 'lucide-solid/icons/building-2'
import Layers from 'lucide-solid/icons/layers'
import Navigation from 'lucide-solid/icons/navigation'
import X from 'lucide-solid/icons/x'

export default function Home() {
  const { query, setQuery, results } = usePhoton();
  const [currentIndex, setCurrentIndex] = createSignal(1);
  const snaps = ['10%', '50%', '92%'];

  let timeoutID;
  let inputRef;

  const handleInput = (e) => {
    const q = e.target.value;
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      setQuery(q);
    }, 200);
  };

  const handleFocus = () => {
    // Go to full height on focus, with small delay to avoid conflicts
    setTimeout(() => setCurrentIndex(2), 50);
  };

  const clearSearch = () => {
    setQuery('');
    if (inputRef) inputRef.value = '';
  };

  // Composant interne pour afficher un résultat
  const ResultCard = (props) => {
    const { feature } = props;
    const data = feature.properties;

    // Détermine l'icône et la couleur en fonction du type
    let Icon = MapPin;
    let colorClass = "text-gray-100";

    if (data.type === 'city') { Icon = Globe; colorClass = "text-blue-600"; }
    if (data.type === 'building' || data.osm_key === 'building') { Icon = Building2; colorClass = "text-orange-600"; }
    if (data.osm_key === 'amenity') { Icon = Layers; colorClass = "text-purple-600"; }

    return (
      <div class="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
        {/* Icône type */}
        <div class="mt-1 flex-shrink-0">
          <div class={`p-2 rounded-lg bg-gray-50 ${colorClass} group-hover:bg-white transition-colors`}>
            <Icon size={18} />
          </div>
        </div>

        {/* Contenu texte */}
        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-gray-900 text-sm leading-tight mb-1 group-hover:text-blue-600 transition-colors">
            {data.name}
          </h3>
          <div class="text-xs text-gray-500 space-y-0.5">
            {data.street && <p>{data.housenumber} {data.street}</p>}
            <p>{data.city} {data.postcode && `(${data.postcode})`}</p>
          </div>
        </div>

        {/* Bouton action */}
        <button class="flex-shrink-0 p-2 -mr-2 -mt-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
          <Navigation size={18} />
        </button>
      </div>
    );
  };

  // Search bar component for the header
  const SearchHeader = () => (
    <div class="px-4 pb-3 pt-1">
      <div class="bg-gray-100 rounded-xl p-2 transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white focus-within:shadow-sm">
        <div class="flex items-center gap-3 px-2">
          <Search class="text-gray-400 flex-shrink-0" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher un lieu..."
            class="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 h-9"
            onInput={handleInput}
            onFocus={handleFocus}
          />
          <Show when={query()}>
            <button
              onClick={clearSearch}
              class="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 transition-colors"
            >
              <X size={16} />
            </button>
          </Show>
        </div>
      </div>
    </div>
  );

  return (
    <main class="fixed inset-0 z-10 pointer-events-none">
      <BottomSheet
        snapPoints={snaps}
        index={currentIndex()}
        onIndexChange={setCurrentIndex}
        nestedScroll={true}
        style={`
          color: black;
          --sheet-background: #ffffff; 
          --sheet-border-radius: 24px;
          --handle-color: #e5e7eb;
        `}
        header={<SearchHeader />}
      >
        {/* Contenu de la BottomSheet */}
        <div class="px-4 pb-4">
          <div class="max-w-lg mx-auto">
            {/* Titre de section si résultats */}
            <Show when={!results.loading && results()?.length > 0}>
              <div class="flex items-center justify-between mb-3 px-1">
                <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Résultats
                </h2>
                <span class="text-xs text-gray-400">
                  {results().length} lieux
                </span>
              </div>

              <div class="flex flex-col gap-1">
                <For each={results()}>
                  {(feature) => (
                    <ResultCard feature={feature} />
                  )}
                </For>
              </div>
            </Show>

            {/* Loading state */}
            <Show when={results.loading}>
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="p-3 bg-gray-50 rounded-full mb-3 animate-pulse">
                  <Search class="text-gray-400" size={24} />
                </div>
                <p class="text-sm text-gray-500 font-medium">Recherche...</p>
              </div>
            </Show>

            {/* État vide - no query */}
            <Show when={!results.loading && !query()}>
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="p-3 bg-gray-50 rounded-full mb-3">
                  <Search class="text-gray-400" size={24} />
                </div>
                <p class="text-sm text-gray-500 font-medium">Rechercher un lieu</p>
                <p class="text-xs text-gray-400 mt-1 max-w-[200px]">
                  Essayez "Montréal" ou "Rue Sainte-Catherine".
                </p>
              </div>
            </Show>

            {/* État vide - no results */}
            <Show when={!results.loading && query() && results()?.length === 0}>
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="p-3 bg-gray-50 rounded-full mb-3">
                  <Search class="text-gray-400" size={24} />
                </div>
                <p class="text-sm text-gray-500 font-medium">Aucun résultat</p>
                <p class="text-xs text-gray-400 mt-1 max-w-[200px]">
                  Essayez une autre recherche.
                </p>
              </div>
            </Show>

          </div>
        </div>
      </BottomSheet>
    </main>
  );
}
