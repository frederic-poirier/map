import { createSignal, createMemo, onMount, onCleanup, createContext, useContext, For, Show } from 'solid-js';
import { useSheetLayout } from '~/context/SheetLayoutContext';

const SheetContext = createContext();

/**
 * Sheet - Apple Maps-style bottom sheet component
 * Uses CSS scroll-snap for native-feeling snap points
 * 
 * Tray height = highest snap point (e.g., 80vh)
 * - At scroll=0: only peek visible at bottom
 * - Snap between points until reaching max
 * - Once at max, snap disabled and content scrolls naturally
 * 
 * @param {Object} props
 * @param {Array} props.snapPoints - Array of snap points: ['auto', 40, 80] where numbers are vh values
 */
function Sheet(props) {
  let peekRef, trayRef, sheetRef;

  const sheetLayout = useSheetLayout();

  // Parse snap points from props (default: ['auto', 40, 90])
  const snapPoints = () => props.snapPoints ?? ['auto', 40, 90];

  // States
  const [peekHeight, setPeekHeight] = createSignal(props.peekHeight ?? 120);
  const [currentSnapIndex, setCurrentSnapIndex] = createSignal(0);
  const [snapEnabled, setSnapEnabled] = createSignal(true);
  const [isAnimating, setIsAnimating] = createSignal(true);

  // Get numeric snap points in vh (sorted ascending)
  const numericSnaps = createMemo(() => {
    return snapPoints()
      .filter(s => typeof s === 'number')
      .sort((a, b) => a - b); // [40, 80]
  });

  // Highest snap point (max height of tray)
  const highestSnap = createMemo(() => {
    const snaps = numericSnaps();
    return snaps.length > 0 ? snaps[snaps.length - 1] : 90;
  });

  // Tray height in pixels (highest snap point)
  const trayHeight = createMemo(() => {
    return (highestSnap() / 100) * window.innerHeight;
  });

  // Spacer height: pushes sheet down so only peek shows at scroll=0
  // Spacer = trayHeight - peek
  const spacerHeight = createMemo(() => {
    return Math.max(0, trayHeight() - peekHeight());
  });

  // Max scroll position (when sheet is fully open at highest snap)
  const maxScrollPosition = createMemo(() => {
    return spacerHeight();
  });

  // Calculate snap positions (scroll values for each snap point)
  const snapPositions = createMemo(() => {
    const vh = window.innerHeight;
    const peek = peekHeight();
    const snaps = numericSnaps();
    const trayH = trayHeight();

    // Position 0: closed (only peek visible) = scroll 0
    const positions = [0];

    // For each numeric snap, calculate scroll position
    // At a snap point, visible sheet height = snapVh% of viewport
    // Scroll position = (visible height - peek)
    // But capped by spacer height (can't scroll past it)
    snaps.forEach(snapVh => {
      const visibleHeight = (snapVh / 100) * vh;
      const scrollPos = Math.min(visibleHeight - peek, spacerHeight());
      positions.push(Math.max(0, scrollPos));
    });

    return positions;
  });

  // Check if we're at or past the last snap point
  const isAtMaxSnap = createMemo(() => {
    const positions = snapPositions();
    return currentSnapIndex() >= positions.length - 1;
  });

  // Get animation class based on navigation direction
  const animationClass = createMemo(() => {
    const direction = sheetLayout?.navigationDirection?.() ?? 'forward';
    return direction === 'back' ? 'animate-slide-in-left' : 'animate-slide-in-right';
  });

  // CSS Variables
  const containerStyle = createMemo(() => {
    return {
      '--peek': `${peekHeight()}px`,
      '--tray-height': `${highestSnap()}svh`,
      '--spacer-height': `${spacerHeight()}px`,
      '--sheet-min-height': `${highestSnap()}svh`,
    };
  });

  onMount(() => {
    if (!peekRef || !trayRef) return;

    // Register tray ref with context for programmatic control
    sheetLayout?.setSheetRef?.(trayRef);

    // Measure peek height dynamically
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries.find(e => e.target === peekRef);
      if (entry) {
        const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        setPeekHeight(height);
      }
    });
    resizeObserver.observe(peekRef);

    // Restore saved scroll position from context (persists across navigation)
    const savedScroll = sheetLayout?.savedScrollPosition?.() ?? 0;
    const savedIndex = sheetLayout?.savedSnapIndex?.() ?? 0;

    if (savedScroll > 0) {
      // Restore exact scroll position
      trayRef.scrollTop = savedScroll;
      setCurrentSnapIndex(savedIndex);
      setSnapEnabled(savedScroll < maxScrollPosition());
    } else if (sheetLayout?.isSheetOpen?.()) {
      // Fallback: open to first snap point
      const positions = snapPositions();
      trayRef.scrollTop = positions[1] ?? 0;
      setCurrentSnapIndex(1);
    } else {
      trayRef.scrollTop = 0;
      setCurrentSnapIndex(0);
    }

    // Clear animation after it completes
    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 300);

    // Scroll tracking
    let scrollTimeout;

    const handleScroll = () => {
      const { scrollTop } = trayRef;
      const positions = snapPositions();
      const maxScroll = maxScrollPosition();

      // Save scroll position to context for persistence
      sheetLayout?.saveScrollPosition?.(scrollTop);

      // Check if we've scrolled past the max snap point (into content area)
      const isPastMaxSnap = scrollTop >= maxScroll;

      if (isPastMaxSnap) {
        // Disable snap - allow free scrolling through content
        setSnapEnabled(false);
        const newIndex = positions.length - 1;
        setCurrentSnapIndex(newIndex);
        sheetLayout?.setSavedSnapIndex?.(newIndex);
        sheetLayout?.setIsSheetOpen?.(true);
      } else {
        // Find closest snap index
        let closestIndex = 0;
        let closestDist = Math.abs(scrollTop - positions[0]);

        for (let i = 1; i < positions.length; i++) {
          const dist = Math.abs(scrollTop - positions[i]);
          if (dist < closestDist) {
            closestDist = dist;
            closestIndex = i;
          }
        }

        if (closestIndex !== currentSnapIndex()) {
          setCurrentSnapIndex(closestIndex);
          sheetLayout?.setSavedSnapIndex?.(closestIndex);
          sheetLayout?.setIsSheetOpen?.(closestIndex > 0);
        }

        // Enable snap while between snap points
        setSnapEnabled(true);
      }

      // Re-enable snap after scroll ends if we're back in snap zone
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const currentScroll = trayRef.scrollTop;
        const maxScroll = maxScrollPosition();

        // Only re-enable snap if we're not in content scroll area
        if (currentScroll < maxScroll - 10) {
          setSnapEnabled(true);
        }
      }, 150);
    };

    trayRef.addEventListener('scroll', handleScroll, { passive: true });

    onCleanup(() => {
      resizeObserver.disconnect();
      trayRef.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      clearTimeout(animationTimer);
      sheetLayout?.setSheetRef?.(null);
    });
  });

  // Helper: Snap to specific index programmatically
  const snapToIndex = (index) => {
    if (!trayRef) return;
    const positions = snapPositions();
    const targetScroll = positions[index] ?? 0;

    trayRef.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  // Context value
  const contextValue = {
    peekHeight,
    snapEnabled,
    currentSnapIndex,
    snapPoints,
    snapToIndex,
    isAtMaxSnap
  };

  return (
    <SheetContext.Provider value={contextValue}>
      <div class="relative" style={containerStyle()}>
        {/* Background content slot */}
        {props.background}

        {/* TRAY CONTAINER - Height = max snap point, positioned at bottom */}
        <div
          ref={trayRef}
          class="tray fixed rounded-t-3xl inset-x-0 bottom-0 z-100 overflow-y-auto overscroll-contain touch-pan-y pointer-events-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]"
          classList={{
            'snap-y snap-mandatory': snapEnabled(),
          }}
          style={{ height: 'var(--tray-height)' }}
        >
          {/* Spacer - pushes sheet down so only peek visible at scroll=0 */}
          <div
            class="w-full pointer-events-none snap-start"
            style={{ height: 'var(--spacer-height)' }}
          />

          {/* Snap anchors for middle snap points */}
          <For each={snapPositions().slice(1, -1)}>
            {(pos) => (
              <div
                class="absolute left-0 w-full h-0 snap-start snap-always pointer-events-none"
                style={{ top: `${pos}px` }}
              />
            )}
          </For>

          {/* SHEET PANEL - sticky header, content flows naturally */}
          <div
            ref={sheetRef}
            class="bg-[var(--bg-primary)] rounded-t-3xl pointer-events-auto shadow-[0_-2px_16px_rgba(0,0,0,0.08),0_0_32px_rgba(0,0,0,0.04)] dark:shadow-[0_-2px_16px_rgba(0,0,0,0.4),0_0_32px_rgba(0,0,0,0.2)]"
            style={{ 'min-height': 'var(--sheet-min-height)' }}
          >
            {/* Peek/Header area - sticky */}
            <div
              ref={peekRef}
              class="sticky top-0 bg-[var(--bg-primary)] rounded-t-3xl z-10 snap-start"
            >
              {/* Handle bar */}
              <div class="flex justify-center pt-2 pb-1">
                <div class="h-[5px] w-9 bg-[var(--border-secondary)] rounded-full opacity-60" />
              </div>
              {props.header}
              {props.sticky}
            </div>

            {/* Content wrapper with animation */}
            <div
              class="overflow-hidden rounded-t-2xl"
              classList={{
                [animationClass()]: isAnimating(),
              }}
            >
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </SheetContext.Provider>
  );
}

// Sheet.Header - The peek area
function Header(props) {
  return (
    <div class={`px-4 pb-2 bg-[var(--bg-primary)] rounded-t-2xl ${props.class || ''}`} style={props.style}>
      {props.children}
    </div>
  );
}

// Sheet.Sticky - Sticky content below header
function Sticky(props) {
  return (
    <div class={`px-4 pb-3 bg-[var(--bg-primary)] ${props.class || ''}`} style={props.style}>
      {props.children}
    </div>
  );
}

// Sheet.Content - Scrollable content area
function Content(props) {
  return (
    <div class={`px-4 pb-[max(24px,env(safe-area-inset-bottom))] rounded-t-2xl ${props.class || ''}`} style={props.style}>
      {props.children}
    </div>
  );
}

// Attach compound components
Sheet.Header = Header;
Sheet.Sticky = Sticky;
Sheet.Content = Content;

// Hook to access sheet context
export function useSheet() {
  return useContext(SheetContext);
}

export { Sheet };
