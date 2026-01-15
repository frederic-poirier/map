import { createSignal, onMount, onCleanup, createContext, useContext, createEffect } from 'solid-js';
import { useSheetLayout } from '~/context/SheetLayoutContext';

const SheetContext = createContext();

/**
 * Sheet - Apple Maps-style bottom sheet component
 * Uses CSS scroll-snap for native-feeling snap points
 */
function Sheet(props) {
    let peekRef, trayRef, sheetRef;
    let canScroll = false;

    const sheetLayout = useSheetLayout();
    const [peekHeight, setPeekHeight] = createSignal(props.peekHeight ?? 120);
    const [snapEnabled, setSnapEnabled] = createSignal(true);
    const [isOpen, setIsOpen] = createSignal(false);

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
                // Only reset scroll if sheet is closed
                if (!isOpen()) {
                    requestAnimationFrame(() => {
                        trayRef.scrollTop = 0;
                    });
                }
            }
        });
        resizeObserver.observe(peekRef);

        // Check if sheet should be open (from context state)
        if (sheetLayout?.isSheetOpen?.()) {
            const spacerHeight = window.innerHeight * 0.4 - peekHeight();
            trayRef.scrollTop = spacerHeight + 100;
            setIsOpen(true);
        } else {
            // Initialize at closed position
            trayRef.scrollTop = 0;
        }

        // Scroll tracking for snap behavior
        let lastScrollTop = 0;
        let scrollTimeout;
        const getSpacerHeight = () => window.innerHeight * 0.4 - peekHeight();

        const handleScroll = () => {
            const { scrollTop } = trayRef;
            const spacerHeight = getSpacerHeight();
            const threshold = 50;

            // Track open/closed state
            const nowOpen = scrollTop > spacerHeight * 0.5;
            if (nowOpen !== isOpen()) {
                setIsOpen(nowOpen);
                sheetLayout?.setIsSheetOpen?.(nowOpen);
            }

            // If we're near the closed snap point, enable snap
            if (scrollTop < threshold) {
                setSnapEnabled(true);
            }
            // If we're scrolling and past the open position threshold, disable snap
            else if (scrollTop >= spacerHeight - threshold) {
                // We're in content area - disable snap to allow free scrolling
                setSnapEnabled(false);
            }
            // In between - check scroll direction
            else {
                const scrollingUp = scrollTop < lastScrollTop;
                if (scrollingUp && scrollTop < spacerHeight) {
                    // Scrolling up towards closed - enable snap
                    setSnapEnabled(true);
                }
            }

            lastScrollTop = scrollTop;

            // Re-enable snap after scroll ends (for final snap)
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollTop = trayRef.scrollTop;
                const spacerHeight = getSpacerHeight();

                // If near top (closed area), enable snap
                if (scrollTop < spacerHeight * 0.3) {
                    setSnapEnabled(true);
                }
                // If near open position, enable snap
                else if (scrollTop > spacerHeight * 0.7 && scrollTop < spacerHeight + 100) {
                    setSnapEnabled(true);
                }
            }, 150);
        };

        trayRef.addEventListener('scroll', handleScroll, { passive: true });

        // Prevent scrolling when interaction starts outside the sheet
        const onWheel = (e) => {
            if (!sheetRef) return;
            const sheetRect = sheetRef.getBoundingClientRect();
            // If mouse is above the sheet, prevent scroll
            if (e.clientY < sheetRect.top) {
                e.preventDefault();
            }
        };

        const onTouchStart = (e) => {
            if (!sheetRef) return;
            const touch = e.touches[0];
            const sheetRect = sheetRef.getBoundingClientRect();
            // Allow scroll only if touch starts on the sheet
            canScroll = touch.clientY >= sheetRect.top;
        };

        const onTouchMove = (e) => {
            if (!canScroll) {
                e.preventDefault();
            }
        };

        trayRef.addEventListener('wheel', onWheel, { passive: false });
        trayRef.addEventListener('touchstart', onTouchStart, { passive: true });
        trayRef.addEventListener('touchmove', onTouchMove, { passive: false });

        onCleanup(() => {
            resizeObserver.disconnect();
            trayRef.removeEventListener('scroll', handleScroll);
            trayRef.removeEventListener('wheel', onWheel);
            trayRef.removeEventListener('touchstart', onTouchStart);
            trayRef.removeEventListener('touchmove', onTouchMove);
            clearTimeout(scrollTimeout);
            sheetLayout?.setSheetRef?.(null);
        });
    });

    // CSS Variables for positioning (only scroll-snap related)
    const containerStyle = () => ({
        "--peek": `${peekHeight()}px`,
        // Spacer for closed state: positions sheet so only peek is visible (40vh - peek)
        "--spacer-closed-h": `calc(40svh - var(--peek))`,
    });

    // Context value for child components
    const contextValue = {
        peekHeight,
        snapEnabled,
        isOpen,
    };

    return (
        <SheetContext.Provider value={contextValue}>
            <div class="relative font-sans" style={containerStyle()}>
                {/* Background content slot */}
                {props.background}

                {/* TRAY CONTAINER - Single scroll layer */}
                <div
                    ref={trayRef}
                    class="sheet-tray"
                    classList={{ 'snap-enabled': snapEnabled() }}
                >
                    {/* Spacer for closed/peek state */}
                    <div class="sheet-spacer"></div>

                    {/* SHEET PANEL */}
                    <div ref={sheetRef} class="sheet-panel bg-[var(--bg-primary)] rounded-t-2xl sticky top-0 shadow-[0_-2px_16px_rgba(0,0,0,0.08),0_0_32px_rgba(0,0,0,0.04)] dark:shadow-[0_-2px_16px_rgba(0,0,0,0.4),0_0_32px_rgba(0,0,0,0.2)] pointer-events-auto">
                        {/* Open snap point - invisible anchor */}
                        <div class="sheet-open-anchor"></div>
                        <div ref={peekRef} class="sticky top-0 bg-[var(--bg-primary)] rounded-t-2xl z-10">
                            {/* Handle bar */}
                            <div class="flex justify-center pt-2 pb-1">
                                <div class="h-[5px] w-9 bg-[var(--border-secondary)] rounded-full opacity-60"></div>
                            </div>
                            {props.header}
                            {props.sticky}
                        </div>
                        {props.children}
                    </div>
                </div>
            </div>
        </SheetContext.Provider>
    );
}

// Sheet.Header - The peek area, its height determines the peek snap point
function Header(props) {
    return (
        <div class={`px-4 pb-2 bg-[var(--bg-primary)] ${props.class || ''}`} style={props.style}>
            {props.children}
        </div>
    );
}

// Sheet.Sticky - Sticky content below header (e.g., search input)
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
        <div class={`px-4 pb-[max(24px,env(safe-area-inset-bottom))] ${props.class || ''}`} style={props.style}>
            {props.children}
        </div>
    );
}

// Attach compound components
Sheet.Header = Header;
Sheet.Sticky = Sticky;
Sheet.Content = Content;

// Hook to access sheet context (for custom controls)
export function useSheet() {
    return useContext(SheetContext);
}

export default Sheet;
