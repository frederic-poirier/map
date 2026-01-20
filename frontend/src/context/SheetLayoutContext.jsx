import { createContext, useContext, createSignal, onCleanup, createEffect } from "solid-js";
import { useLocation } from "@solidjs/router";

const SheetLayoutContext = createContext();

export function SheetLayoutProvider(props) {
  const [stickyContent, setStickyContent] = createSignal(null);
  const [footerContent, setFooterContent] = createSignal(null);
  const [isSheetOpen, setIsSheetOpen] = createSignal(false);
  const [sheetRef, setSheetRef] = createSignal(null);

  // Persist sheet state across navigation
  const [savedSnapIndex, setSavedSnapIndex] = createSignal(1);
  const [savedScrollPosition, setSavedScrollPosition] = createSignal(0);

  // Handler for programmatic snapping (set by BottomSheet component)
  const [snapToHandler, setSnapToHandler] = createSignal(null);

  // Navigation direction tracking
  const [navigationDirection, setNavigationDirection] = createSignal('forward');
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
    const handler = snapToHandler();
    if (handler) {
      handler(1); // Snap to first open position
    }
    setIsSheetOpen(true);
    setSavedSnapIndex(1);
  };

  // Programmatically close the sheet
  const closeSheet = () => {
    const handler = snapToHandler();
    if (handler) {
      handler(0); // Snap to closed position
    }
    setIsSheetOpen(false);
    setSavedSnapIndex(0);
    setSavedScrollPosition(0);
  };

  // Snap to a specific index
  const snapTo = (index) => {
    const handler = snapToHandler();
    if (handler) {
      handler(index);
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
    footerContent,
    setFooterContent,
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
    // Handler management
    setSnapToHandler,
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

/**
 * Component to render content in the footer area of the sheet
 * Registers the content with the sheet context for rendering in the footer slot
 */
export function FooterSlot(props) {
  const context = useSheetLayout();

  // If no context (not in sheet layout), render inline
  if (!context) {
    return props.children;
  }

  // Register content with context for rendering in footer slot
  context.setFooterContent(() => props.children);

  // Clean up when component unmounts
  onCleanup(() => {
    context.setFooterContent(null);
  });

  // Return null - content is rendered by the Sheet via context
  return null;
}
