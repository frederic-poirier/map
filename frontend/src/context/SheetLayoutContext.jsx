import { createContext, useContext, createSignal, onCleanup } from "solid-js";

const SheetLayoutContext = createContext();

export function SheetLayoutProvider(props) {
    const [stickyContent, setStickyContent] = createSignal(null);
    const [isSheetOpen, setIsSheetOpen] = createSignal(false);
    const [sheetRef, setSheetRef] = createSignal(null);

    // Programmatically open the sheet with smooth animation
    const openSheet = () => {
        const tray = sheetRef();
        if (tray) {
            const spacerHeight = parseFloat(getComputedStyle(tray).getPropertyValue('--spacer-closed-h')) || 0;
            tray.scrollTo({ top: spacerHeight + 100, behavior: 'smooth' });
        }
        setIsSheetOpen(true);
    };

    // Programmatically close the sheet
    const closeSheet = () => {
        const tray = sheetRef();
        if (tray) {
            tray.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setIsSheetOpen(false);
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
