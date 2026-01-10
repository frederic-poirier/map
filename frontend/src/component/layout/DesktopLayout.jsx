export function DesktopLayout(props) {
  const { toggleTheme } = useTheme();
  const { mapInstance } = useMap();
  const { selectedPlace, clearPlace } = usePlace();


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
