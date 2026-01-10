export default function MobileLayout(props) {
  const { theme, toggleTheme } = useTheme();
  const { mapInstance } = useMap();
  const { selectedPlace } = usePlace();
  let trayRef;

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  useKeyboard({
    "/": () => document.querySelector('input[placeholder*="Search"]')?.focus(),
    t: () => toggleTheme(),
    l: () => document.querySelector("[data-locate-btn]")?.click(),
    "+": () => mapInstance()?.zoomIn(),
    "=": () => mapInstance()?.zoomIn(),
    "-": () => mapInstance()?.zoomOut(),
    n: () => mapInstance()?.easeTo({ bearing: 0, pitch: 0 }),
    f: () => toggleFullscreen(),
    escape: () => clearPlace(),
  });

  const handleHandleClick = () => trayRef?.cyclePosition();
  const handleSearchFocus = () => trayRef?.expand();

  // Search state lifted up to share between header and content
  const [searchQuery, setSearchQuery] = createSignal("");
  const [searchResults, setSearchResults] = createSignal([]);
  const [isSearchFocused, setIsSearchFocused] = createSignal(false);

  const [openHeight, setOpenHeight] = createSignal();

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
          <Show
            when={selectedPlace()}
            fallback={
              <MobileSearchHeader
                onFocus={handleSearchFocus}
                query={searchQuery}
                setQuery={setSearchQuery}
                isSearchFocused={isSearchFocused}
                setIsSearchFocused={setIsSearchFocused}
              />
            }
          >
            <PlaceHeader />
          </Show>
        }
        footer={<MobileFooter />}
      >
        <Show
          when={selectedPlace()}
          fallback={
            <MobileSearchContent
              query={searchQuery}
              setQuery={setSearchQuery}
              results={searchResults}
              setResults={setSearchResults}
              isSearchFocused={isSearchFocused}
              setIsSearchFocused={setIsSearchFocused}
            />
          }
        >
          <PlaceDetail />
        </Show>
      </TrayCard>
    </Tray>
  );
}
