import { createSignal, createEffect, createContext, useContext } from "solid-js";

const SheetContext = createContext();

export function SheetProvider(props) {
    const [index, setIndex] = createSignal(0);
    const [snapPoints, setSnapPoints] = createSignal(['50%']);
    const [keyboardOffset, setKeyboardOffset] = createSignal(0);
    let sheetEl;

    // Gestion du redimensionnement par le clavier
    createEffect(() => {
        const visualViewport = window.visualViewport;
        if (!visualViewport) return;

        const handleResize = () => {
            const diff = window.innerHeight - visualViewport.height;
            setKeyboardOffset(diff > 100 ? diff : 0);

            // Ajuste le scroll pour garder l'input visible
            if (diff > 100 && sheetEl) {
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                    setTimeout(() => {
                        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }
            }
        };

        visualViewport.addEventListener('resize', handleResize);
        return () => visualViewport.removeEventListener('resize', handleResize);
    });

    // Helper to get all snap elements
    const getSnapElements = () => Array.from(sheetEl?.querySelectorAll('[slot="snap"]') || []);

    const api = {
        index,
        setIndex,
        snapPoints,
        setSnapPoints,
        keyboardOffset,
        // Snap to a specific snap point by index (0 = smallest/header, last = full)
        snapTo: (i) => {
            const snaps = getSnapElements();
            const target = snaps[i];
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        },
        // Snap to show header only (collapsed/minimized state)
        collapseToHeader: () => {
            const snaps = getSnapElements();
            if (snaps.length > 0) {
                snaps[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        },
        // Snap to full height (expanded state) - scrolls to last snap point
        expand: () => {
            const snaps = getSnapElements();
            if (snaps.length > 0) {
                snaps[snaps.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        },
        // Check if at header-only state
        isCollapsed: () => index() === 0,
        // Check if at full height state
        isExpanded: () => {
            const snaps = getSnapElements();
            return index() === snaps.length - 1;
        },
        link: (el) => { sheetEl = el; },
        // Nouvelle méthode pour gérer le focus sur les inputs
        handleInputFocus: (inputEl) => {
            setTimeout(() => {
                const rect = inputEl.getBoundingClientRect();

                if (rect.bottom > (window.innerHeight - keyboardOffset() - 20)) {
                    const scrollAmount = rect.bottom - (window.innerHeight - keyboardOffset() - 100);
                    sheetEl?.scrollBy({ top: scrollAmount, behavior: 'smooth' });
                }
            }, 300);
        }
    };

    return (
        <SheetContext.Provider value={api}>
            {props.children}
        </SheetContext.Provider>
    );
}

export { SheetContext };

export function useSheet() {
    const context = useContext(SheetContext);
    if (!context) throw new Error("useSheet doit être utilisé sous un <SheetProvider>");
    return context;
}