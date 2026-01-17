import { createContext, useContext, createSignal, onCleanup, createEffect } from "solid-js";
import { useLocation } from "@solidjs/router";

const SheetLayoutContext = createContext();

export function SheetLayoutProvider(props) {
  const [stickyContent, setStickyContent] = createSignal(null);
  const [isSheetOpen, setIsSheetOpen] = createSignal(false);
  const [sheetRef, setSheetRef] = createSignal(null);

  // Persist sheet state across navigation
  const [savedSnapIndex, setSavedSnapIndex] = createSignal(0);
  const [savedScrollPosition, setSavedScrollPosition] = createSignal(0);

  // Navigation direction tracking
  const [navigationDirection, setNavigationDirection] = createSignal('forward'); // 'forward' | 'back'
  const [historyStack, setHistoryStack] = createSignal([]);

  // Track navigation direction based on history
  const location = useLocation();

  createEffect(() => {
    const currentPath = location.pathname;
    const stack = historyStack();

    // Check if we're going back (current path exists earlier in stack)
    const existingIndex = stack.indexOf(currentPath);

    if (existingIndex !== -1 && existingIndex < stack.length - 1) {
      // Going back - path exists earlier in history
      setNavigationDirection('back');
      // Trim stack to current position
      setHistoryStack(stack.slice(0, existingIndex + 1));
    } else if (stack.length > 0 && stack[stack.length - 1] !== currentPath) {
      // Going forward - new path
      setNavigationDirection('forward');
      setHistoryStack([...stack, currentPath]);
    } else if (stack.length === 0) {
      // Initial load
      setNavigationDirection('forward');
      setHistoryStack([currentPath]);
    }
  });

  // Programmatically open the sheet to first snap point
  const openSheet = () => {
    const tray = sheetRef();
    if (tray) {
      // Get spacer height from CSS var
      const spacerHeight = parseFloat(getComputedStyle(tray).getPropertyValue('--spacer-height')) || 0;
      tray.scrollTo({ top: spacerHeight, behavior: 'smooth' });
    }
    setIsSheetOpen(true);
    setSavedSnapIndex(1);
  };

  // Programmatically close the sheet
  const closeSheet = () => {
    const tray = sheetRef();
    if (tray) {
      tray.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsSheetOpen(false);
    setSavedSnapIndex(0);
    setSavedScrollPosition(0);
  };

  // Snap to a specific index
  const snapTo = (index) => {
    const tray = sheetRef();
    if (tray) {
      // Supposons que chaque snap point a une hauteur définie (ex: 300px par index)
      // Ou utilise une logique basée sur tes variables CSS
      const snapHeight = index * 300; // À adapter selon ta logique de design
      tray.scrollTo({ top: snapHeight, behavior: 'smooth' });
    }
    setSavedSnapIndex(index);
    setIsSheetOpen(index > 0);
  };

  // Save current scroll position (called by Sheet on scroll)
  const saveScrollPosition = (position) => {
    setSavedScrollPosition(position);
  };

  const value = {
    stickyContent,
    setStickyContent,
    isSheetOpen,
    setIsSheetOpen,
    openSheet,
    closeSheet,
    sheetRef,
    setSheetRef,
    // Persisted state
    savedSnapIndex,
    setSavedSnapIndex,
    savedScrollPosition,
    saveScrollPosition,
    snapTo,
    // Navigation direction
    navigationDirection,
  };

  return (
    <SheetLayoutContext.Provider value={value}>
      {props.children}
    </SheetLayoutContext.Provider>
  );
}

export function useSheetLayout() {
  return useContext(SheetLayoutContext);
}

/**
 * Component to render content in the sticky area of the sheet (mobile & desktop)
 * Registers the content with the sheet context for rendering in the sticky slot
 */
export function StickySlot(props) {
  const context = useSheetLayout();

  // If no context (not in sheet layout), render inline
  if (!context) {
    return props.children;
  }

  // Register content with context for rendering in sticky slot
  context.setStickyContent(() => props.children);

  // Clean up when component unmounts
  onCleanup(() => {
    context.setStickyContent(null);
  });

  // Return null - content is rendered by the Sheet/Sidebar via context
  return null;
}
